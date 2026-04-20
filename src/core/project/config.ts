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

export async function loadConfig(configPath: string): Promise<ProjectConfig> {
  const raw = await readYaml<unknown>(configPath);
  return projectConfigSchema.parse(raw);
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
