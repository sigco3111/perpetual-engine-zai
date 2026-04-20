import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  resolveEnvVars,
  validateProviderConfig,
  getProviderForAgent,
  getDefaultProvider,
  type ProjectConfig,
} from '../../../src/core/project/config.js';

function makeConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    localization: { language: 'ko', language_name: '한국어 (Korean)' },
    company: { name: 'Test', mission: '' },
    product: { name: 'Test', description: '', target_users: '', core_value: '' },
    constraints: { tech_stack_preference: 'auto', deploy_target: 'vercel' },
    agents: ['ceo', 'cto', 'po', 'designer', 'qa', 'marketer'],
    mcp_servers: {},
    providers: {},
    concurrency: { defaults: {}, rules: [] },
    agent_providers: { mapping: {}, overrides: {} },
    default_provider: 'claude-code',
    ...overrides,
  };
}

describe('resolveEnvVars', () => {
  it('replaces ${VAR} with environment variable value', () => {
    process.env.MY_VAR = 'test';
    expect(resolveEnvVars('key-${MY_VAR}')).toBe('key-test');
    delete process.env.MY_VAR;
  });

  it('leaves unresolved ${VAR} unchanged when env var is unset', () => {
    delete process.env.UNSET_VAR;
    expect(resolveEnvVars('${UNSET_VAR}')).toBe('${UNSET_VAR}');
  });

  it('returns plain text unchanged when no variables present', () => {
    expect(resolveEnvVars('plain-text')).toBe('plain-text');
  });
});

describe('validateProviderConfig', () => {
  it('returns empty errors for valid mapping', () => {
    const config = makeConfig({
      providers: {
        'zai-glm4': {
          type: 'http-api',
          api: { baseUrl: 'https://example.com', model: 'glm-4-flash' },
          maxConcurrency: 10,
        },
      },
      agent_providers: {
        mapping: { cto: 'zai-glm4' },
        overrides: {},
      },
    });

    expect(validateProviderConfig(config)).toEqual([]);
  });

  it('returns error for mapping referencing non-existent provider', () => {
    const config = makeConfig({
      agent_providers: {
        mapping: { cto: 'nonexistent' },
        overrides: {},
      },
    });

    const errors = validateProviderConfig(config);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('nonexistent');
    expect(errors[0]).toContain('cto');
  });
});

describe('getProviderForAgent', () => {
  it('returns provider from mapping when defined', () => {
    const provider = {
      type: 'http-api' as const,
      api: { baseUrl: 'https://example.com', model: 'glm-5-turbo' },
      maxConcurrency: 1,
    };
    const config = makeConfig({
      providers: { 'zai-glm5': provider },
      agent_providers: {
        mapping: { cto: 'zai-glm5' },
        overrides: {},
      },
    });

    expect(getProviderForAgent(config, 'cto')).toEqual(provider);
  });

  it('returns override when override exists for role', () => {
    const override = {
      type: 'http-api' as const,
      api: { baseUrl: 'https://example.com', model: 'glm-5-turbo' },
      maxConcurrency: 1,
    };
    const config = makeConfig({
      providers: {
        'zai-glm5': {
          type: 'http-api',
          api: { baseUrl: 'https://example.com', model: 'glm-4-flash' },
          maxConcurrency: 10,
        },
      },
      agent_providers: {
        mapping: { cto: 'zai-glm5' },
        overrides: { cto: override },
      },
    });

    expect(getProviderForAgent(config, 'cto')).toEqual(override);
  });

  it('returns null when no provider configured (backward compat)', () => {
    const config = makeConfig();
    expect(getProviderForAgent(config, 'cto')).toBeNull();
  });

  it('returns null when default_provider is claude-code', () => {
    const config = makeConfig({ default_provider: 'claude-code' });
    expect(getProviderForAgent(config, 'cto')).toBeNull();
  });
});

describe('getDefaultProvider', () => {
  it('returns providers[default_provider]', () => {
    const provider = {
      type: 'http-api' as const,
      api: { baseUrl: 'https://example.com', model: 'glm-4-flash' },
      maxConcurrency: 10,
    };
    const config = makeConfig({
      default_provider: 'zai-glm4',
      providers: { 'zai-glm4': provider },
    });

    expect(getDefaultProvider(config)).toEqual(provider);
  });

  it('returns null when default_provider is claude-code', () => {
    const config = makeConfig({ default_provider: 'claude-code' });
    expect(getDefaultProvider(config)).toBeNull();
  });
});
