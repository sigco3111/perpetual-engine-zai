import type { AgentConfig } from '../agent/agent-types.js';
import { type DetectedTechStack } from './detectors/tech-stack-detector.js';
import { type DetectedDocs } from './detectors/docs-detector.js';
/** 스캔 결과 */
export interface ScanResult {
    agents: AgentConfig[];
    projectMeta: {
        name: string;
        mission: string;
        techStack: string[];
        workflow: string;
    };
    /** 감지된 기술 스택 상세 */
    detectedTechStack: DetectedTechStack;
    /** 감지된 문서 정보 */
    detectedDocs: DetectedDocs;
    /** 스캔 방식 */
    scanMode: 'claude-md' | 'auto-detect';
    /** 스캔 요약 */
    summary: string;
    /** 에이전트 추천 이유 */
    reasoning: string[];
}
/**
 * 기존 프로젝트를 스캔하여 에이전트 설정을 자동 생성합니다.
 *
 * 두 가지 모드로 동작합니다:
 * 1. CLAUDE.md에 에이전트 정의가 있으면 → 해당 정의를 파싱 + 기술 스택으로 보강
 * 2. 에이전트 정의가 없으면 → 기술 스택 + 문서 + 프로젝트 구조로 에이전트 자동 추천
 */
export declare function scanExistingProject(projectRoot: string): Promise<ScanResult | null>;
//# sourceMappingURL=project-scanner.d.ts.map