import { SessionManager } from '../core/session/session-manager.js';
/**
 * DashboardServer 주입 옵션.
 * 테스트에서 MockTmuxAdapter 가 주입된 SessionManager 를 공유할 때 사용한다.
 */
export interface DashboardServerOptions {
    sessionManager?: SessionManager;
    onRestartAgents?: () => Promise<void>;
    onTaskResumed?: (taskId: string) => Promise<void>;
}
export declare class DashboardServer {
    private app;
    private httpServer;
    private wss;
    private projectRoot;
    private kanban;
    private sprintManager;
    private agentRegistry;
    private sessionManager;
    private messageQueue;
    private watcher;
    private port;
    private onRestartAgents?;
    private onTaskResumed?;
    constructor(projectRoot: string, port?: number, options?: DashboardServerOptions);
    /** 실제 바인딩된 포트 (테스트에서 port=0 으로 자동 할당 받은 경우 사용) */
    getPort(): number;
    private setupRoutes;
    private listMarkdownFiles;
    private setupWebSocket;
    private broadcast;
    private startFileWatcher;
    start(): Promise<void>;
    stop(): Promise<void>;
}
//# sourceMappingURL=server.d.ts.map