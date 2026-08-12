import { AgentRegistry } from '../agent/agent-registry.js';
import { SessionManager } from '../session/session-manager.js';
import { KanbanManager } from '../state/kanban.js';
import { SprintManager } from '../state/sprint.js';
import { MessageQueue } from '../messaging/message-queue.js';
import { MeetingCoordinator } from '../messaging/meeting.js';
import { type ConsultantAgent, type ConsultantRequest } from '../agent/consultant-factory.js';
import { DashboardServer } from '../../dashboard/server.js';
/**
 * Orchestrator 주입 옵션.
 * 테스트에서 tmux/Claude CLI 실행을 Mock 어댑터로 대체하거나,
 * 대시보드 포트를 임의로 지정하거나, keepAlive 루프를 끌 때 사용한다.
 */
export interface OrchestratorOptions {
    /** 사용자 지정 SessionManager — 테스트에서 MockTmuxAdapter 를 주입할 때 사용 */
    sessionManager?: SessionManager;
    /** 대시보드 리스닝 포트 (기본 3000) */
    dashboardPort?: number;
    /** false 면 대시보드 서버를 시작하지 않는다 */
    dashboardEnabled?: boolean;
    /** false 면 start() 가 keepAlive 루프에 진입하지 않고 즉시 반환한다 */
    keepAlive?: boolean;
    /**
     * CEO 에이전트를 start 시점에 자동 기동할지 결정한다.
     * - `true` (기본) 또는 `'if-empty'`: 칸반/스프린트가 비어 있을 때만 기동 (최초 부트스트랩 용도).
     *   이미 태스크나 스프린트가 있으면 기동을 건너뛴다 — 재시작 시 중복 계획/덮어쓰기 방지.
     * - `'always'`: 상태와 무관하게 항상 기동 (재계획 강제).
     * - `false`: 절대 기동하지 않음 (테스트 격리·수동 제어).
     */
    autoStartCeo?: boolean | 'if-empty' | 'always';
    /** WorkflowEngine 의 세션 완료 폴링 간격(ms). 테스트에서 짧게 주입한다 */
    workflowPollInterval?: number;
}
export declare class Orchestrator {
    private projectRoot;
    private projectManager;
    private agentRegistry;
    private sessionManager;
    private kanban;
    private sprintManager;
    private workflowEngine;
    private config;
    private dashboard;
    private messageQueue;
    private meetingCoordinator;
    private consultantFactory;
    /** 활성 자문 에이전트 추적 (ID → ConsultantAgent) */
    private activeConsultants;
    private watcher;
    private messageWatcher;
    private processingTasks;
    /**
     * 역할 단위 직렬화 락. taskId → 디스패치 시점의 assignee 역할.
     * tmux 세션명이 역할 기반(`ip-<role>`)이라 같은 역할의 태스크를 동시에 실행하면
     * `duplicate session` 에러가 난다. 한 역할당 태스크 1개만 워크플로우에 진입시킨다.
     */
    private processingRoles;
    private workflowAborters;
    private processedMessages;
    private running;
    private readonly dashboardPort;
    private readonly dashboardEnabled;
    private readonly keepAliveEnabled;
    private readonly autoStartCeoPolicy;
    private readonly workflowPollInterval;
    constructor(projectRoot: string, options?: OrchestratorOptions);
    /** 테스트용 접근자 — 내부 상태 검증에 쓰인다 */
    getInternals(): {
        agentRegistry: AgentRegistry;
        sessionManager: SessionManager;
        kanban: KanbanManager;
        sprintManager: SprintManager;
        messageQueue: MessageQueue;
        meetingCoordinator: MeetingCoordinator;
        activeConsultants: Map<string, ConsultantAgent>;
        dashboard: DashboardServer | null;
    };
    start(): Promise<void>;
    stop(): Promise<void>;
    /**
     * processingTasks 가 비워질 때까지 짧게 대기.
     * 테스트·재시작 시 비동기 워크플로우가 파일시스템을 만지는 중에
     * 디렉토리가 삭제되는 race 를 방지한다.
     */
    private drainProcessingTasks;
    /**
     * `autoStartCeo` 정책에 따라 CEO 세션을 조건부로 기동한다.
     * @returns CEO 세션을 실제로 시작했으면 true
     */
    private maybeStartCeo;
    private startCEO;
    private startWatcher;
    private processNewTasks;
    /**
     * 서버 기동 시 `in_progress`/`testing`/`review` 상태로 남은 고아 태스크를
     * 저장된 `task.phase` 부터 재개한다. 이전 실행에서 비정상 종료(크래시/Ctrl+C)
     * 되거나, 옛 버그로 false-success 처리된 태스크가 방치되지 않도록 한다.
     *
     * - 실제 tmux 세션이 이미 살아있으면 건드리지 않음 (다른 경로가 처리 중)
     * - 같은 역할 락은 `processNewTasks` 와 동일하게 `processingRoles` 로 직렬화
     * - 기동 시에만 1회 호출 — 런타임 디스패치 경로는 그대로 유지
     */
    private resumeInFlightTasks;
    /**
     * 공통 디스패치 경로. `processingTasks`/`processingRoles`/`workflowAborters` 를
     * 세팅하고 비동기로 워크플로우를 실행한다. 종료 시 락을 해제하고
     * 대기 중인 태스크가 있으면 다음 스캔을 트리거한다.
     */
    private dispatchWorkflow;
    private checkDependencies;
    private startMessageWatcher;
    private processNewMessages;
    private dispatchMessageToAgent;
    private watchAgentReply;
    /**
     * 자문 요청 메시지를 파싱하고 자문 에이전트를 생성한다.
     * 메시지 content는 JSON 형식의 ConsultantRequest를 기대한다.
     */
    private handleConsultationRequest;
    /**
     * 회의 초대 메시지를 파싱하고 다중 참여자 회의를 시작한다.
     * 메시지 content는 JSON 형식의 회의 설정을 기대한다.
     */
    private handleMeetingInvite;
    /**
     * 태스크를 강제로 실행한다.
     * 현재 상태·의존성을 무시하고 즉시 워크플로우를 시작한다.
     */
    forceRunTask(taskId: string): Promise<void>;
    /**
     * 태스크를 일시 중단한다.
     * 실행 중인 에이전트 세션을 종료하고 상태를 suspended로 전환한다.
     */
    suspendTask(taskId: string, reason?: string): Promise<void>;
    /**
     * 중단된 태스크를 재개한다.
     * 이전 상태로 복원하고, todo/backlog이면 워크플로우가 자동으로 픽업한다.
     */
    resumeTask(taskId: string): Promise<void>;
    /**
     * 자문 전문가 에이전트를 생성하고 세션을 시작한다.
     * 목적 완수 후 disposeConsultant()로 소멸시켜야 한다.
     */
    spawnConsultant(request: ConsultantRequest): Promise<ConsultantAgent>;
    /**
     * 자문 에이전트 세션 완료를 감시하고, 완료 시 자동 소멸시킨다.
     */
    private watchConsultantCompletion;
    /**
     * 자문 에이전트를 소멸시킨다.
     * 세션 종료 + 레지스트리 해제 + 추적 맵 정리.
     */
    disposeConsultant(consultantId: string): Promise<void>;
    /** 활성 자문 에이전트 목록 */
    getActiveConsultants(): ConsultantAgent[];
    /**
     * 이슈에 대해 유관 에이전트들이 참여하는 회의를 개최한다.
     * 선택적으로 자문 전문가 에이전트를 생성하여 참여시킬 수 있다.
     */
    startMultiAgentMeeting(params: {
        title: string;
        type: 'issue_discussion' | 'consultation' | 'tech_design_review' | 'design_review' | 'sprint_planning' | 'emergency';
        initiatorRole: string;
        participantRoles: string[];
        topics: string[];
        relatedTaskIds?: string[];
        consultantRequests?: ConsultantRequest[];
    }): Promise<{
        meetingId: string;
        consultants: ConsultantAgent[];
    }>;
    /**
     * 회의 세션 완료를 감시하고, 자문 에이전트를 소멸시킨다.
     */
    private watchMeetingCompletion;
    private keepAlive;
}
//# sourceMappingURL=orchestrator.d.ts.map