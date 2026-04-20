import { describe, it, expect } from 'vitest';
import { createProviderAdapter } from '../../../src/core/session/provider-factory.js';
import type { ProviderConfig } from '../../../src/core/session/provider-adapter.js';

describe('Provider Factory and Adapters', () => {
  it('factory creates ClaudeCodeAdapter for type claude-code', () => {
    const cfg: ProviderConfig = { type: 'claude-code' } as const;
    const adapter = createProviderAdapter(cfg);
    expect(adapter.type).toBe('claude-code');
    expect(adapter.isCLIBased).toBe(true);

    const result = adapter.buildCommand({
      systemPrompt: 'sys',
      sessionId: 's1',
      projectRoot: '/tmp',
      agentName: 'cto',
    });

    expect(typeof result.command).toBe('string');
    expect(typeof result.useScriptFile).toBe('boolean');
    expect(result.command).toContain('claude');
  });

  it('factory creates OpenCodeAdapter for type opencode', () => {
    const cfg: ProviderConfig = { type: 'opencode', binary: 'opencode' } as const;
    const adapter = createProviderAdapter(cfg);
    expect(adapter.type).toBe('opencode');
    expect(adapter.isCLIBased).toBe(true);

    const result = adapter.buildCommand({
      systemPrompt: 'sys',
      sessionId: 's2',
      projectRoot: '/proj',
      agentName: 'cto',
    });

    expect(typeof result.command).toBe('string');
    expect(typeof result.useScriptFile).toBe('boolean');
    expect(result.command).toContain('opencode');
  });

  it('factory creates HttpApiAdapter for type http-api', () => {
    const cfg: ProviderConfig = {
      type: 'http-api',
      api: { baseUrl: 'https://example.com', model: 'm' },
    } as const;
    const adapter = createProviderAdapter(cfg);
    expect(adapter.type).toBe('http-api');
    expect(adapter.isCLIBased).toBe(false);

    const result = adapter.buildCommand({
      systemPrompt: 'sys',
      sessionId: 's3',
      projectRoot: '/proj',
      agentName: 'cto',
    });

    expect(typeof result.command).toBe('string');
    expect(typeof result.useScriptFile).toBe('boolean');
    // Http adapter uses node -e script
    expect(result.command).toContain('node');
    expect(result.useScriptFile).toBe(true);
  });

  it('factory throws for unknown type', () => {
    // create an invalid config by bypassing type system
    const bad = ({ type: 'unknown' } as unknown) as ProviderConfig;
    expect(() => createProviderAdapter(bad)).toThrow(/Unknown provider type/);
  });

  it('buildEphemeralCommand and buildMeetingCommand work and return expected shape', () => {
    const clCfg: ProviderConfig = { type: 'claude-code' } as const;
    const ocCfg: ProviderConfig = { type: 'opencode', binary: 'opencode' } as const;
    const httpCfg: ProviderConfig = { type: 'http-api', api: { baseUrl: 'https://x', model: 'z' } } as const;

    const claude = createProviderAdapter(clCfg);
    const opencode = createProviderAdapter(ocCfg);
    const http = createProviderAdapter(httpCfg);

    const adapters = [claude, opencode, http];

    for (const a of adapters) {
      const eph = a.buildEphemeralCommand({
        systemPrompt: 'sys',
        sessionId: 'sid',
        projectRoot: '/r',
        message: 'hello',
      });
      expect(eph).toHaveProperty('command');
      expect(eph).toHaveProperty('useScriptFile');
      expect(typeof eph.command).toBe('string');
      expect(typeof eph.useScriptFile).toBe('boolean');

      const meet = a.buildMeetingCommand({
        systemPrompt: 'sys',
        sessionId: 'sid',
        projectRoot: '/r',
        meetingAgenda: 'agenda',
      });
      expect(meet).toHaveProperty('command');
      expect(meet).toHaveProperty('useScriptFile');
      expect(typeof meet.command).toBe('string');
      expect(typeof meet.useScriptFile).toBe('boolean');
    }
  });
});
