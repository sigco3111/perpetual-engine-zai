import { SessionManager } from '../session/session-manager.js';
import { AgentRegistry } from '../agent/agent-registry.js';
import { KanbanManager } from '../state/kanban.js';
import { MetricsManager } from '../metrics/metrics-store.js';
import type { Task } from '../state/types.js';
import type { ProjectConfig } from '../project/config.js';
export declare class WorkflowEngine {
    private sessionManager;
    private agentRegistry;
    private kanban;
    private metricsManager;
    private metricsEvaluator;
    private config;
    private projectRoot;
    private pollInterval;
    constructor(params: {
        sessionManager: SessionManager;
        agentRegistry: AgentRegistry;
        kanban: KanbanManager;
        config: ProjectConfig;
        projectRoot: string;
        metricsManager?: MetricsManager;
        /** 세션 완료 폴링 간격(ms). 테스트에서 짧게 주입하면 워크플로우가 빠르게 종료된다 */
        pollInterval?: number;
    });
    private static MAX_PHASE_RETRIES;
    runWorkflow(task: Task, signal?: AbortSignal): Promise<void>;
    /** 메트릭스 평가가 필요한 태스크 확인 및 평가 트리거 */
    runMetricsCheckIfNeeded(): Promise<void>;
    /** 메트릭스 평가 지시 메시지 생성 */
    private buildMetricsEvalInstruction;
    private executePhase;
    private checkOutputs;
    private waitForCompletion;
}
//# sourceMappingURL=workflow-engine.d.ts.map