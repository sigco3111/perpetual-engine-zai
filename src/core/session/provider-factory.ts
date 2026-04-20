/**
 * Provider Factory
 * 
 * 설정(config)에 따라 적절한 ProviderAdapter를 생성합니다.
 */

import type { ProviderAdapter, ProviderConfig } from './provider-adapter.js';
import { ClaudeCodeAdapter } from './providers/claude-code-adapter.js';
import { OpenCodeAdapter } from './providers/opencode-adapter.js';
import { HttpApiAdapter } from './providers/http-api-adapter.js';

export function createProviderAdapter(config: ProviderConfig): ProviderAdapter {
  switch (config.type) {
    case 'claude-code':
      return new ClaudeCodeAdapter(config);
    case 'opencode':
      return new OpenCodeAdapter(config);
    case 'aicp':
      // AICP는 OpenCode와 유사한 인터페이스를 사용
      return new OpenCodeAdapter({ ...config, type: 'opencode' });
    case 'http-api':
      return new HttpApiAdapter(config);
    default:
      throw new Error(`Unknown provider type: ${(config as any).type}`);
  }
}

/**
 * 기본 제공 프로바이더 설정 프리셋
 */
export const PROVIDER_PRESETS: Record<string, ProviderConfig> = {
  /** Claude Code CLI (원본 Perpetual Engine과 동일) */
  'claude-code': {
    type: 'claude-code',
    maxConcurrency: 1,
  },

  /** OpenCode (oh-my-openagent) */
  'opencode': {
    type: 'opencode',
    binary: 'opencode',
    maxConcurrency: 1,
  },

  /** ZAI GLM-5-Turbo (HTTP API) */
  'zai-glm5-turbo': {
    type: 'http-api',
    api: {
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      model: 'glm-5-turbo',
    },
    maxConcurrency: 1,
  },

  /** ZAI GLM-4.5 (HTTP API, 동시 10) */
  'zai-glm4-5': {
    type: 'http-api',
    api: {
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      model: 'glm-4.5',
    },
    maxConcurrency: 10,
  },

  /** ZAI GLM-4-Plus (HTTP API, 동시 20) */
  'zai-glm4-plus': {
    type: 'http-api',
    api: {
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      model: 'glm-4-plus',
    },
    maxConcurrency: 20,
  },

  /** OpenAI Compatible (사용자 커스텀) */
  'openai-compatible': {
    type: 'http-api',
    api: {
      baseUrl: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o',
    },
    maxConcurrency: 5,
  },
};
