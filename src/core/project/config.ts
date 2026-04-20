import { z } from 'zod';
import { readYaml, writeYaml } from '../../utils/yaml.js';

// ─── Provider 설정 스키마 ───

export const providerConfigSchema = z.object({
  /** 프로바이더 타입 */
  type: z.enum(['claude-code', 'opencode', 'aicp', 'http-api']).default('claude-code'),
  /** CLI 바이너리 이름 */
  binary: z.string().optional(),
  /** HTTP API 설정 */
  api: z.object({
    baseUrl: z.string(),
    apiKey: z.string().optional(),
    model: z.string().default('glm-4-flash'),
    headers: z.record(z.string()).default({}),
  }).optional(),
  /** 동시 실행 제한 */
  maxConcurrency: z.number().min(1).default(1),
});

// ─── 동시성 규칙 스키마 ───

export const concurrencyRuleSchema = z.object({
  /** 모델 이름 또는 정규식 패턴 */
  model: z.string(),
  /** 최대 동시 요청 수 */
  limit: z.number().min(1).default(1),
});

export const concurrencyConfigSchema = z.object({
  /** 프로바이더별 기본 동시성 */
  defaults: z.record(z.number()).default({}),
  /** 모델별 동시성 규칙 (ZAI Rate Limits 기반) */
  rules: z.array(concurrencyRuleSchema).default([]),
});

// ─── 에이전트 프로바이더 매핑 스키마 ───

export const agentProviderMappingSchema = z.object({
  /** 에이전트 역할 → 사용할 프로바이더 이름 */
  mapping: z.record(z.string()).default({}),
  /** 에이전트별 프로바이더 설정 오버라이드 */
  overrides: z.record(providerConfigSchema).default({}),
});

// ─── 확장된 프로젝트 설정 스키마 ───

export const mcpServerSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).default([]),
  env: z.record(z.string()).default({}),
});

export const projectConfigSchema = z.object({
  // ─── 기존 필드 ───
  localization: z.object({
    language: z.string().default('ko'),
    language_name: z.string().default('한국어 (Korean)'),
  }).default({}),
  company: z.object({
    name: z.string().default('My Startup'),
    mission: z.string().default(''),
  }).default({}),
  product: z.object({
    name: z.string().default('My Product'),
    description: z.string().default(''),
    target_users: z.string().default(''),
    core_value: z.string().default(''),
  }).default({}),
  constraints: z.object({
    tech_stack_preference: z.string().default('auto'),
    deploy_target: z.string().default('vercel'),
  }).default({}),
  agents: z.array(z.string()).default(['ceo', 'cto', 'po', 'designer', 'qa', 'marketer']),
  mcp_servers: z.record(mcpServerSchema).default({}),

  // ─── ZAI 확장 필드 ───
  /** 프로바이더 정의 */
  providers: z.record(providerConfigSchema).default({}),
  /** 동시성 관리 설정 */
  concurrency: concurrencyConfigSchema.default({}),
  /** 에이전트별 프로바이더 매핑 */
  agent_providers: agentProviderMappingSchema.default({}),
  /** 기본 프로바이더 (에이전트에 명시적 매핑이 없을 때 사용) */
  default_provider: z.string().default('claude-code'),
});

export type ProjectConfig = z.infer<typeof projectConfigSchema>;
export type ProviderConfigType = z.infer<typeof providerConfigSchema>;
export type ConcurrencyConfigType = z.infer<typeof concurrencyConfigSchema>;
export type AgentProviderMappingType = z.infer<typeof agentProviderMappingSchema>;

/**
 * 문자열 내의 ${VAR_NAME} 패턴을 환경변수로 치환합니다.
 * 치환되지 않은 ${...} 패턴이 남아있으면 원문 유지.
 */
export function resolveEnvVars(value: string): string {
  return value.replace(/\$\{([^}]+)\}/g, (match, varName) => {
    const envValue = process.env[varName];
    return envValue !== undefined ? envValue : match;
  });
}

/**
 * 에이전트 프로바이더 매핑이 유효한지 검증합니다.
 * agent_providers.mapping의 모든 키가 providers에 정의되어 있어야 합니다.
 */
export function validateProviderConfig(config: ProjectConfig): string[] {
  const errors: string[] = [];
  const providerNames = Object.keys(config.providers);
  const mappingEntries = Object.entries(config.agent_providers?.mapping ?? {});

  for (const [role, providerName] of mappingEntries) {
    if (!providerNames.includes(providerName)) {
      errors.push(`Provider '${providerName}' referenced in agent_providers.mapping for role '${role}' but not defined in providers`);
    }
  }

  return errors;
}

/**
 * 특정 에이전트 역할에 매핑된 프로바이더 설정을 반환합니다.
 * 매핑이 없으면 default_provider를 확인하고, 그것도 없으면 null을 반환합니다.
 */
export function getProviderForAgent(config: ProjectConfig, role: string): ProviderConfigType | null {
  const mapping = config.agent_providers?.mapping ?? {};
  const providerName = mapping[role] ?? config.default_provider;

  if (!providerName || providerName === 'claude-code') return null;

  const overrides = config.agent_providers?.overrides ?? {};
  if (overrides[role]) return overrides[role];

  return config.providers[providerName] ?? null;
}

/**
 * 기본 프로바이더 설정을 반환합니다.
 */
export function getDefaultProvider(config: ProjectConfig): ProviderConfigType | null {
  const providerName = config.default_provider;
  if (!providerName || providerName === 'claude-code') return null;
  return config.providers[providerName] ?? null;
}

export async function loadConfig(configPath: string): Promise<ProjectConfig> {
  const raw = await readYaml<unknown>(configPath);
  const config = projectConfigSchema.parse(raw);

  for (const [_name, provider] of Object.entries(config.providers)) {
    if (provider.api?.apiKey) {
      provider.api.apiKey = resolveEnvVars(provider.api.apiKey);
    }
  }

  for (const [_role, override] of Object.entries(config.agent_providers?.overrides ?? {})) {
    if (override.api?.apiKey) {
      override.api.apiKey = resolveEnvVars(override.api.apiKey);
    }
  }

  return config;
}

export async function saveConfig(configPath: string, config: ProjectConfig): Promise<void> {
  await writeYaml(configPath, config);
}

export function createDefaultConfig(): ProjectConfig {
  return projectConfigSchema.parse({});
}

/**
 * ZAI 사용자를 위한 기본 설정 템플릿을 생성합니다.
 */
export function createZaiDefaultConfig(): ProjectConfig {
  return projectConfigSchema.parse({
    default_provider: 'http-api',
    providers: {
      'http-api': {
        type: 'http-api',
        api: {
          baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
          model: 'glm-4-flash',
        },
        maxConcurrency: 10,
      },
    },
    concurrency: {
      defaults: {
        'http-api': 10,
      },
      rules: [
        // ZAI Rate Limits (2026-04 기준)
        { model: 'glm-5-turbo', limit: 1 },
        { model: 'glm-5v-turbo', limit: 1 },
        { model: 'glm-5\\.1', limit: 1 },
        { model: 'glm-5$', limit: 2 },
        { model: 'glm-4\\.7$', limit: 2 },
        { model: 'glm-4\\.7-flash', limit: 1 },
        { model: 'glm-4\\.7-flashx', limit: 3 },
        { model: 'glm-4\\.6$', limit: 3 },
        { model: 'glm-4\\.6v', limit: 10 },
        { model: 'glm-4\\.5$', limit: 10 },
        { model: 'glm-4\\.5v', limit: 10 },
        { model: 'glm-4-plus', limit: 20 },
        { model: 'glm-ocr', limit: 2 },
      ],
    },
    agent_providers: {
      mapping: {
        // 코딩 에이전트는 고성능 모델 (동시 1)
        cto: 'http-api',
        // 나머지는 고동시성 모델
        ceo: 'http-api',
        po: 'http-api',
        designer: 'http-api',
        qa: 'http-api',
        marketer: 'http-api',
      },
      overrides: {
        cto: {
          type: 'http-api',
          api: {
            baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            model: 'glm-5-turbo',
          },
          maxConcurrency: 1,
        },
        ceo: {
          type: 'http-api',
          api: {
            baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            model: 'glm-4.5',
          },
          maxConcurrency: 10,
        },
        po: {
          type: 'http-api',
          api: {
            baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            model: 'glm-4.5',
          },
          maxConcurrency: 10,
        },
        designer: {
          type: 'http-api',
          api: {
            baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            model: 'glm-4.5',
          },
          maxConcurrency: 10,
        },
        qa: {
          type: 'http-api',
          api: {
            baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            model: 'glm-4.5',
          },
          maxConcurrency: 10,
        },
        marketer: {
          type: 'http-api',
          api: {
            baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            model: 'glm-4.5',
          },
          maxConcurrency: 10,
        },
      },
    },
  });
}
