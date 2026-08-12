import type { AgentConfig } from '../../agent/agent-types.js';
import type { DetectedTechStack } from './tech-stack-detector.js';
import type { DetectedDocs } from './docs-detector.js';
/** 추천 결과 */
export interface AgentRecommendation {
    agents: AgentConfig[];
    reasoning: string[];
}
/**
 * 감지된 프로젝트 정보를 기반으로 최적의 에이전트 팀을 추천합니다.
 *
 * 기본 팀(CEO, CTO, PO, Designer, QA, Marketer)에서 시작하여
 * 프로젝트 특성에 맞게 각 에이전트의 역할/규칙/프롬프트를 커스터마이즈합니다.
 */
export declare function recommendAgents(techStack: DetectedTechStack, docs: DetectedDocs): AgentRecommendation;
//# sourceMappingURL=agent-recommender.d.ts.map