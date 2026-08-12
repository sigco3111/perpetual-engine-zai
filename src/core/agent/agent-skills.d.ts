import type { AgentSkill } from './agent-types.js';
/**
 * 에이전트 역할별 기본 스킬 매핑.
 *
 * ZAI 포크에서는 Claude Code 전용 슬래시 커맨드 대신
 * 프로바이더에 독립적인 프롬프트 기반 스킬을 사용합니다.
 *
 * 스킬 타입:
 * - `prompt`: 시스템 프롬프트에 주입되는 지시어 (모든 프로바이더에서 사용 가능)
 * - `tool`: 프로바이더 전용 툴 (해당 프로바이더에서만 사용 가능)
 */
export type SkillType = 'prompt' | 'tool';
export interface EnhancedAgentSkill extends AgentSkill {
    /** 스킬 타입 */
    type: SkillType;
    /** 이 스킬이 호환되는 프로바이더 (빈 배열이면 모든 프로바이더에서 사용 가능) */
    compatibleProviders?: string[];
    /** 스킬의 상세 지시어 (type='prompt'인 경우 프롬프트에 주입됨) */
    instruction?: string;
}
/**
 * 에이전트 역할별 기본 스킬 매핑.
 * 각 에이전트는 자신의 역할에 맞는 스킬만 사용할 수 있다.
 */
export declare const DEFAULT_AGENT_SKILLS: Record<string, EnhancedAgentSkill[]>;
/** 역할에 맞는 기본 스킬 목록 반환 */
export declare function getSkillsForRole(role: string): EnhancedAgentSkill[];
/**
 * 프로바이더에 맞는 스킬만 필터링합니다.
 */
export declare function filterSkillsByProvider(skills: EnhancedAgentSkill[], provider: string): EnhancedAgentSkill[];
//# sourceMappingURL=agent-skills.d.ts.map