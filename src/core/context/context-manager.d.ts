import type { AgentConfig } from '../agent/agent-types.js';
import type { Task, WorkflowPhase } from '../state/types.js';
export declare class ContextManager {
    private projectRoot;
    constructor(projectRoot: string);
    getContextDocs(agent: AgentConfig, task: Task, phase: WorkflowPhase): string[];
    /**
     * docs/design/mockups/{feature}/ 하위의 *.html + meta.json 경로들을 반환.
     * feature 이름이 task slug 로 시작하거나 포함하면 매칭.
     */
    private findFeatureMockups;
}
//# sourceMappingURL=context-manager.d.ts.map