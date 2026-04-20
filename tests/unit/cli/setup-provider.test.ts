import { describe, it, expect } from 'vitest';
import { createDefaultConfig, validateProviderConfig } from '../../../src/core/project/config.js';

describe('Setup Provider Config', () => {
  it('default config has no providers', () => {
    const config = createDefaultConfig();
    expect(Object.keys(config.providers)).toHaveLength(0);
    expect(config.default_provider).toBe('claude-code');
  });

  it('provider config structure is valid after setup', () => {
    const config = createDefaultConfig();

    config.default_provider = 'zai-general';
    config.providers = {
      'zai-coding': {
        type: 'http-api',
        api: {
          baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
          apiKey: '${ZAI_API_KEY}',
          model: 'glm-5-turbo',
        },
        maxConcurrency: 1,
      },
      'zai-general': {
        type: 'http-api',
        api: {
          baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
          apiKey: '${ZAI_API_KEY}',
          model: 'glm-4.5',
        },
        maxConcurrency: 10,
      },
    };
    config.agent_providers = {
      mapping: {
        cto: 'zai-coding',
        ceo: 'zai-general',
        po: 'zai-general',
        designer: 'zai-general',
        qa: 'zai-general',
        marketer: 'zai-general',
      },
      overrides: {},
    };

    expect(config.default_provider).toBe('zai-general');
    expect(config.providers['zai-coding'].api?.model).toBe('glm-5-turbo');
    expect(config.providers['zai-general'].api?.model).toBe('glm-4.5');
    expect(config.agent_providers.mapping.cto).toBe('zai-coding');
    expect(config.agent_providers.mapping.ceo).toBe('zai-general');
  });

  it('provider config passes validation', () => {
    const config = createDefaultConfig();

    config.default_provider = 'zai-general';
    config.providers = {
      'zai-coding': {
        type: 'http-api',
        api: {
          baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
          apiKey: '${ZAI_API_KEY}',
          model: 'glm-5-turbo',
        },
        maxConcurrency: 1,
      },
      'zai-general': {
        type: 'http-api',
        api: {
          baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
          apiKey: '${ZAI_API_KEY}',
          model: 'glm-4.5',
        },
        maxConcurrency: 10,
      },
    };
    config.agent_providers = {
      mapping: {
        cto: 'zai-coding',
        ceo: 'zai-general',
        po: 'zai-general',
        designer: 'zai-general',
        qa: 'zai-general',
        marketer: 'zai-general',
      },
      overrides: {},
    };

    const errors = validateProviderConfig(config);
    expect(errors).toHaveLength(0);
  });

  it('concurrency rules have valid regex patterns', () => {
    const rules = [
      { model: 'glm-5-turbo', limit: 1 },
      { model: 'glm-5', limit: 2 },
      { model: 'glm-5\\.1', limit: 1 },
      { model: 'glm-4\\.5$', limit: 10 },
      { model: 'glm-4-plus', limit: 20 },
    ];

    for (const rule of rules) {
      expect(() => new RegExp(rule.model)).not.toThrow();
      expect(rule.limit).toBeGreaterThan(0);
    }
  });

  it('no provider selected preserves original behavior', () => {
    const config = createDefaultConfig();

    expect(config.default_provider).toBe('claude-code');
    expect(Object.keys(config.providers)).toHaveLength(0);
    expect(Object.keys(config.agent_providers.mapping)).toHaveLength(0);
  });
});
