import type { AgentConfig } from '../agent/agent-types.js';
export interface ScaffoldOptions {
    /** true이면 기존 프로젝트 파일(README.md 등)을 덮어쓰지 않음 */
    preserveExisting?: boolean;
    /** 스캔으로 감지된 에이전트 설정 (없으면 기본 에이전트 사용) */
    scannedAgents?: AgentConfig[];
    /** 스캔으로 추출된 프로젝트 메타데이터 */
    scannedMeta?: {
        name: string;
        mission: string;
        techStack: string[];
    };
}
export declare function scaffoldProject(projectRoot: string, projectName: string, options?: ScaffoldOptions): Promise<void>;
//# sourceMappingURL=scaffold.d.ts.map