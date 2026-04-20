import { describe, it, expect, vi } from 'vitest';
import { SessionManager } from '../../../src/core/session/session-manager.js';
import { ConcurrencyLimiter } from '../../../src/core/session/concurrency-limiter.js';
import { MockTmuxAdapter } from '../../e2e/helpers/mock-tmux.js';
import type { AgentConfig } from '../../../src/core/agent/agent-types.js';
import { createDefaultConfig } from '../../../src/core/project/config.js';
import type { ProjectConfig } from '../../../src/core/project/config.js';
import path from 'node:path';
import { mkdir, rm } from 'node:fs/promises';

const TEST_ROOT = path.join('/tmp', `sm-provider-test-${Date.now()}`);

const baseAgent: AgentConfig = {
  name: 'CEO',
  role: 'ceo',
  description: 'Chief Executive Officer',
  responsibilities: ['전략 수립', '의사결정'],
  rules: ['kanban.json을 항상 읽어라'],
  skills: [],
  can_create_sub_agents: false,
  max_sub_agents: 0,
  reports_to: 'investor',
  collaborates_with: ['cto', 'po'],
  system_prompt_template: '',
  meeting_permissions: {
    can_schedule: true,
    can_participate: true,
    required_meetings: [],
  },
};

function configWithProvider(overrides?: Partial<ProjectConfig>): ProjectConfig {
  return {
    ...createDefaultConfig(),
    providers: {
      'test-provider': {
        type: 'http-api' as const,
        api: {
          baseUrl: 'https://test.example.com/api',
          apiKey: 'test-key',
          model: 'test-model',
          headers: {},
        },
        maxConcurrency: 5,
      },
    },
    agent_providers: {
      mapping: { ceo: 'test-provider' },
      overrides: {},
    },
    default_provider: 'claude-code',
    ...overrides,
  };
}

async function setupProjectRoot(): Promise<string> {
  await mkdir(TEST_ROOT, { recursive: true });
  await mkdir(path.join(TEST_ROOT, '.perpetual-engine'), { recursive: true });
  return TEST_ROOT;
}

async function cleanupProjectRoot(): Promise<void> {
  await rm(TEST_ROOT, { recursive: true, force: true });
}

describe('SessionManager provider-aware command generation', () => {
  it('no provider config → Claude CLI command (backward compat)', async () => {
    const tmux = new MockTmuxAdapter();
    const sm = new SessionManager(tmux);
    const projectRoot = await setupProjectRoot();

    try {
      const config = createDefaultConfig();
      const session = await sm.startAgent({
        agent: baseAgent,
        config,
        projectRoot,
      });

      expect(session).toBeDefined();
      expect(tmux.createCalls.length).toBe(1);
      expect(tmux.createCalls[0].command).toContain('claude');
      expect(tmux.createCalls[0].command).toContain('--append-system-prompt');
    } finally {
      await cleanupProjectRoot();
    }
  });

  it('HTTP API provider → node -e command (not claude)', async () => {
    const tmux = new MockTmuxAdapter();
    const sm = new SessionManager(tmux);
    const projectRoot = await setupProjectRoot();

    try {
      const config = configWithProvider();
      const session = await sm.startAgent({
        agent: baseAgent,
        config,
        projectRoot,
      });

      expect(session).toBeDefined();
      expect(tmux.createCalls.length).toBe(1);
      const cmd = tmux.createCalls[0].command;
      expect(cmd).toContain('node');
      expect(cmd).not.toMatch(/\bclaude\b/);
    } finally {
      await cleanupProjectRoot();
    }
  });

  it('AgentSession.provider populated when provider configured', async () => {
    const tmux = new MockTmuxAdapter();
    const sm = new SessionManager(tmux);
    const projectRoot = await setupProjectRoot();

    try {
      const config = configWithProvider();
      const session = await sm.startAgent({
        agent: baseAgent,
        config,
        projectRoot,
      });

      expect(session.provider).toBe('http-api');
    } finally {
      await cleanupProjectRoot();
    }
  });

  it('AgentSession.model populated when provider has api.model', async () => {
    const tmux = new MockTmuxAdapter();
    const sm = new SessionManager(tmux);
    const projectRoot = await setupProjectRoot();

    try {
      const config = configWithProvider();
      const session = await sm.startAgent({
        agent: baseAgent,
        config,
        projectRoot,
      });

      expect(session.model).toBe('test-model');
    } finally {
      await cleanupProjectRoot();
    }
  });

  it('concurrency: limit 1 blocks second same-model session', async () => {
    const tmux = new MockTmuxAdapter();
    const sm = new SessionManager(tmux);
    const projectRoot = await setupProjectRoot();

    try {
      const cfg = configWithProvider({ concurrency: { rules: [{ model: 'test-model', limit: 1 }] } as any } as Partial<ProjectConfig>);

      // load concurrency rules into session manager
      sm.configureConcurrency({ concurrency: { rules: [{ model: 'test-model', limit: 1 }] } });

      // start first session — should succeed
      const s1 = await sm.startAgent({ agent: baseAgent, config: cfg, projectRoot });
      expect(s1).toBeDefined();
      expect(tmux.createCalls.length).toBe(1);

      // attempt to start second session with same role/model — simulate different role by cloning agent
      const otherAgent = { ...baseAgent, role: 'ceo2', name: 'CEO Two' } as AgentConfig;
      // map new role to same provider
      cfg.agent_providers.mapping['ceo2'] = 'test-provider';

      await expect(sm.startAgent({ agent: otherAgent, config: cfg, projectRoot })).rejects.toThrow(/Concurrency limit reached/i);
    } finally {
      await cleanupProjectRoot();
    }
  });

  it('concurrency: different models do not block each other', async () => {
    const tmux = new MockTmuxAdapter();
    const sm = new SessionManager(tmux);
    const projectRoot = await setupProjectRoot();

    try {
      const cfg = configWithProvider({ concurrency: { rules: [{ model: 'test-model', limit: 1 }, { model: 'other-model', limit: 1 }] } as any } as Partial<ProjectConfig>);
      sm.configureConcurrency({ concurrency: { rules: [{ model: 'test-model', limit: 1 }, { model: 'other-model', limit: 1 }] } });

      // start first session with test-model
      const s1 = await sm.startAgent({ agent: baseAgent, config: cfg, projectRoot });
      expect(s1).toBeDefined();
      expect(tmux.createCalls.length).toBe(1);

      // start second session mapped to same provider but different model by overriding provider for that role
      const otherAgent = { ...baseAgent, role: 'ceo2', name: 'CEO Two' } as AgentConfig;
      cfg.agent_providers.mapping['ceo2'] = 'test-provider';
      // override provider model for ceo2 via agent_providers.overrides
      cfg.agent_providers.overrides['ceo2'] = { type: 'http-api', api: { baseUrl: 'https://test.example.com/api', apiKey: 'test-key', model: 'other-model', headers: {} }, maxConcurrency: 1 } as any;

      const s2 = await sm.startAgent({ agent: otherAgent, config: cfg, projectRoot });
      expect(s2).toBeDefined();
      expect(tmux.createCalls.length).toBe(2);
    } finally {
      await cleanupProjectRoot();
    }
  });

  it('concurrency: stopAgent releases slot so new session can start', async () => {
    const tmux = new MockTmuxAdapter();
    const sm = new SessionManager(tmux);
    const projectRoot = await setupProjectRoot();

    try {
      const cfg = configWithProvider({ concurrency: { rules: [{ model: 'test-model', limit: 1 }] } as any } as Partial<ProjectConfig>);
      sm.configureConcurrency({ concurrency: { rules: [{ model: 'test-model', limit: 1 }] } });

      const s1 = await sm.startAgent({ agent: baseAgent, config: cfg, projectRoot });
      expect(s1).toBeDefined();
      expect(tmux.createCalls.length).toBe(1);

      // stop first session
      await sm.stopAgent(baseAgent.role);

      // now starting a new session with same model should succeed
      const otherAgent = { ...baseAgent, role: 'ceo2', name: 'CEO Two' } as AgentConfig;
      cfg.agent_providers.mapping['ceo2'] = 'test-provider';
      const s2 = await sm.startAgent({ agent: otherAgent, config: cfg, projectRoot });
      expect(s2).toBeDefined();
      expect(tmux.createCalls.length).toBe(2);
    } finally {
      await cleanupProjectRoot();
    }
  });

  it('unresolved env var in apiKey throws error', async () => {
    const tmux = new MockTmuxAdapter();
    const sm = new SessionManager(tmux);
    const projectRoot = await setupProjectRoot();

    try {
      const config = configWithProvider({
        providers: {
          'test-provider': {
            type: 'http-api' as const,
            api: {
              baseUrl: 'https://test.example.com/api',
              apiKey: '${UNRESOLVED_VAR}',
              model: 'test-model',
              headers: {},
            },
            maxConcurrency: 5,
          },
        },
      } as Partial<ProjectConfig>);

      await expect(
        sm.startAgent({ agent: baseAgent, config, projectRoot }),
      ).rejects.toThrow(/unresolved environment variable/i);
    } finally {
      await cleanupProjectRoot();
    }
  });

  it('no provider → session.provider is undefined', async () => {
    const tmux = new MockTmuxAdapter();
    const sm = new SessionManager(tmux);
    const projectRoot = await setupProjectRoot();

    try {
      const config = createDefaultConfig();
      const session = await sm.startAgent({
        agent: baseAgent,
        config,
        projectRoot,
      });

      expect(session.provider).toBeUndefined();
      expect(session.model).toBeUndefined();
    } finally {
      await cleanupProjectRoot();
    }
  });

  // Ephemeral & Meeting tests
  it('Ephemeral with no provider → Claude CLI', async () => {
    const tmux = new MockTmuxAdapter();
    const sm = new SessionManager(tmux);
    const projectRoot = await setupProjectRoot();

    try {
      const config = createDefaultConfig();
      const session = await sm.startEphemeralAgent({
        sessionName: 'ephemeral-ceo',
        agent: baseAgent,
        config,
        projectRoot,
        message: 'Please advise on roadmap',
      });

      expect(session).toBeDefined();
      expect(tmux.createCalls.length).toBe(1);
      expect(tmux.createCalls[0].command).toContain('claude');
    } finally {
      await cleanupProjectRoot();
    }
  });

  it('Ephemeral with HTTP API provider → falls back to CLI', async () => {
    const tmux = new MockTmuxAdapter();
    const sm = new SessionManager(tmux);
    const projectRoot = await setupProjectRoot();

    try {
      const config = configWithProvider();
      const session = await sm.startEphemeralAgent({
        sessionName: 'ephemeral-ceo',
        agent: baseAgent,
        config,
        projectRoot,
        message: 'Please advise on roadmap',
      });

      expect(session).toBeDefined();
      expect(tmux.createCalls.length).toBe(1);
      const cmd = tmux.createCalls[0].command;
      expect(cmd).toContain('claude');
    } finally {
      await cleanupProjectRoot();
    }
  });

  it('Ephemeral with OpenCode provider → uses opencode', async () => {
    const tmux = new MockTmuxAdapter();
    const sm = new SessionManager(tmux);
    const projectRoot = await setupProjectRoot();

    try {
      const config = configWithProvider({ providers: { 'test-provider': { type: 'opencode' as const, binary: 'opencode', maxConcurrency: 1 } } as any } as Partial<ProjectConfig>);
      // map ceo to test-provider
      config.agent_providers = { mapping: { ceo: 'test-provider' }, overrides: {} } as any;

      const session = await sm.startEphemeralAgent({
        sessionName: 'ephemeral-ceo',
        agent: baseAgent,
        config,
        projectRoot,
        message: 'Please advise on roadmap',
      });

      expect(session).toBeDefined();
      expect(tmux.createCalls.length).toBe(1);
      const cmd = tmux.createCalls[0].command;
      expect(cmd).toContain('opencode');
    } finally {
      await cleanupProjectRoot();
    }
  });

  it('Meeting with no provider → Claude CLI', async () => {
    const tmux = new MockTmuxAdapter();
    const sm = new SessionManager(tmux);
    const projectRoot = await setupProjectRoot();

    try {
      const config = createDefaultConfig();
      const session = await sm.startMeetingSession({
        meetingId: 'm1',
        initiator: baseAgent,
        participants: [baseAgent],
        config,
        agenda: 'Discuss roadmap',
        projectRoot,
      });

      expect(session).toBeDefined();
      expect(tmux.createCalls.length).toBe(1);
      expect(tmux.createCalls[0].command).toContain('claude');
    } finally {
      await cleanupProjectRoot();
    }
  });

  it('Meeting with HTTP API provider → falls back to CLI', async () => {
    const tmux = new MockTmuxAdapter();
    const sm = new SessionManager(tmux);
    const projectRoot = await setupProjectRoot();

    try {
      const config = configWithProvider();
      const session = await sm.startMeetingSession({
        meetingId: 'm2',
        initiator: baseAgent,
        participants: [baseAgent],
        config,
        agenda: 'Discuss roadmap',
        projectRoot,
      });

      expect(session).toBeDefined();
      expect(tmux.createCalls.length).toBe(1);
      const cmd = tmux.createCalls[0].command;
      expect(cmd).toContain('claude');
    } finally {
      await cleanupProjectRoot();
    }
  });
});
