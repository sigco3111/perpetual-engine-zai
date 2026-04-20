import { describe, it, expect } from 'vitest';
import { PromptBuilder } from '../../../src/core/agent/prompt-builder.js';
import type { AgentConfig } from '../../../src/core/agent/agent-types.js';
import type { ProjectConfig } from '../../../src/core/project/config.js';
import { projectConfigSchema } from '../../../src/core/project/config.js';

interface PromptBuilderInternals {
  buildSkillsSection(agent: AgentConfig, providerType?: string): string;
}

const baseConfig: ProjectConfig = projectConfigSchema.parse({});

function makeAgent(skills: AgentConfig['skills']): AgentConfig {
  return {
    name: 'CEO',
    role: 'ceo',
    description: '테스트용 CEO',
    responsibilities: [],
    rules: [],
    skills,
    can_create_sub_agents: false,
    max_sub_agents: 0,
    reports_to: 'board',
    collaborates_with: [],
    system_prompt_template: '당신은 CEO입니다.',
    meeting_permissions: { can_schedule: true, can_participate: true, required_meetings: [] },
  };
}

describe('PromptBuilder buildSkillsSection — CLI provider (default)', () => {
  it('renders slash command format when providerType is undefined', () => {
    const builder = new PromptBuilder() as unknown as PromptBuilderInternals;
    const agent = makeAgent([
      { name: 'launch-strategy', description: '런칭 전략', when_to_use: '런칭 계획 시' },
    ]);
    const result = builder.buildSkillsSection(agent);
    expect(result).toContain('### /launch-strategy');
    expect(result).toContain('- 설명: 런칭 전략');
    expect(result).toContain('슬래시 명령어');
  });

  it('renders slash command format when providerType is claude-code', () => {
    const builder = new PromptBuilder() as unknown as PromptBuilderInternals;
    const agent = makeAgent([
      { name: 'launch-strategy', description: '런칭 전략', when_to_use: '런칭 계획 시' },
    ]);
    const result = builder.buildSkillsSection(agent, 'claude-code');
    expect(result).toContain('### /launch-strategy');
    expect(result).toContain('- 설명: 런칭 전략');
    expect(result).toContain('슬래시 명령어');
  });
});

describe('PromptBuilder buildSkillsSection — non-CLI providers', () => {
  it('renders instruction format for http-api provider', () => {
    const builder = new PromptBuilder() as unknown as PromptBuilderInternals;
    const agent = makeAgent([
      {
        name: 'launch-strategy',
        description: '런칭 전략',
        when_to_use: '런칭 계획 시',
        type: 'prompt',
        instruction: '런칭 전략 수립 시 다음 프레임워크를 따르세요:\n1. 시장 검증 상태 파악',
      },
    ]);
    const result = builder.buildSkillsSection(agent, 'http-api');
    expect(result).toContain('### launch-strategy');
    expect(result).not.toContain('### /launch-strategy');
    expect(result).toContain('- 지침:');
    expect(result).toContain('런칭 전략 수립 시 다음 프레임워크를 따르세요');
    expect(result).toContain('프롬프트 지시로 활성화');
    expect(result).not.toContain('슬래시 명령어');
  });

  it('renders skill instruction content when instruction field is present', () => {
    const builder = new PromptBuilder() as unknown as PromptBuilderInternals;
    const agent = makeAgent([
      {
        name: 'security-review',
        description: '보안 리뷰',
        when_to_use: '배포 전 보안 점검',
        type: 'prompt',
        instruction: '보안 리뷰 시 다음 항목을 점검하세요:\n1. 입력 검증\n2. 인증/인가',
      },
    ]);
    const result = builder.buildSkillsSection(agent, 'http-api');
    expect(result).toContain('보안 리뷰 시 다음 항목을 점검하세요');
    expect(result).toContain('입력 검증');
  });

  it('renders fallback message when skill has no instruction field', () => {
    const builder = new PromptBuilder() as unknown as PromptBuilderInternals;
    const agent = makeAgent([
      { name: 'basic-skill', description: '기본 스킬', when_to_use: '필요 시' },
    ]);
    const result = builder.buildSkillsSection(agent, 'http-api');
    expect(result).toContain('이 스킬은 특별한 지침이 없습니다');
  });

  it('renders instruction format for opencode provider', () => {
    const builder = new PromptBuilder() as unknown as PromptBuilderInternals;
    const agent = makeAgent([
      {
        name: 'simplify',
        description: '코드 간소화',
        when_to_use: '리팩토링 시',
        type: 'prompt',
        instruction: '단일 책임 원칙을 적용하세요.',
      },
    ]);
    const result = builder.buildSkillsSection(agent, 'opencode');
    expect(result).toContain('### simplify');
    expect(result).not.toContain('### /simplify');
    expect(result).toContain('단일 책임 원칙을 적용하세요');
    expect(result).toContain('프롬프트 지시로 활성화');
  });

  it('renders multiple skills for non-CLI provider', () => {
    const builder = new PromptBuilder() as unknown as PromptBuilderInternals;
    const agent = makeAgent([
      { name: 'skill-a', description: 'A', when_to_use: 'A 필요 시' },
      {
        name: 'skill-b',
        description: 'B',
        when_to_use: 'B 필요 시',
        type: 'prompt',
        instruction: 'B 지침 내용',
      },
    ]);
    const result = builder.buildSkillsSection(agent, 'http-api');
    expect(result).toContain('### skill-a');
    expect(result).toContain('이 스킬은 특별한 지침이 없습니다');
    expect(result).toContain('### skill-b');
    expect(result).toContain('B 지침 내용');
  });
});

describe('PromptBuilder buildSkillsSection — backward compat via buildSystemPrompt', () => {
  it('buildSystemPrompt without providerType renders slash commands', () => {
    const builder = new PromptBuilder();
    const agent = makeAgent([
      { name: 'launch-strategy', description: '런칭 전략', when_to_use: '런칭 계획 시' },
    ]);
    const prompt = builder.buildSystemPrompt({ agent, config: baseConfig });
    expect(prompt).toContain('### /launch-strategy');
    expect(prompt).toContain('슬래시 명령어');
  });
});
