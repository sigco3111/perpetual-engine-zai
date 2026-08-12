import { type ScaffoldOptions } from './scaffold.js';
import { type ProjectConfig } from './config.js';
import type { AgentConfig } from '../agent/agent-types.js';
export interface InitOptions extends ScaffoldOptions {
    /** 스캔으로 감지된 에이전트 설정 */
    scannedAgents?: AgentConfig[];
    /** 스캔으로 추출된 프로젝트 메타데이터 */
    scannedMeta?: {
        name: string;
        mission: string;
        techStack: string[];
    };
}
export declare class ProjectManager {
    private projectRoot;
    constructor(projectRoot: string);
    get paths(): {
        root: string;
        infinitePower: string;
        config: string;
        agents: string;
        sessions: string;
        state: string;
        messages: string;
        kanban: string;
        sprints: string;
        metrics: string;
        metricsReports: string;
        docs: string;
        vision: string;
        meetings: string;
        decisions: string;
        planning: string;
        design: string;
        designMockups: string;
        development: string;
        marketing: string;
        marketingMockups: string;
        changelog: string;
        workspace: string;
    };
    init(projectName: string, options?: InitOptions): Promise<void>;
    loadConfig(): Promise<ProjectConfig>;
    saveConfig(config: ProjectConfig): Promise<void>;
    exists(): boolean;
    private ensureProject;
}
//# sourceMappingURL=project-manager.d.ts.map