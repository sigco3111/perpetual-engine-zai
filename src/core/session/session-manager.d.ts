import { TmuxAdapter } from './tmux-adapter.js';
import type { AgentConfig, AgentSession } from '../agent/agent-types.js';
import type { Task, WorkflowPhase } from '../state/types.js';
import type { ProjectConfig } from '../project/config.js';
import type { ComponentSpec } from '../workflow/components.js';
export declare class SessionManager {
    private tmux;
    private promptBuilder;
    private concurrencyLimiter;
    private activeSessions;
    private projectRoot;
    /** role → resolver 함수 (used to release a concurrency slot when session stops) */
    private slotResolvers;
    /** role → resolver that signals session create completion (used so startAgent can wait until tmux created) */
    private createCompleteResolvers;
    constructor(tmux?: TmuxAdapter);
    configureConcurrency(config: {
        concurrency?: {
            rules?: Array<{
                model: string;
                limit: number;
            }>;
        };
    }): void;
    setProjectRoot(root: string): void;
    private getLogDir;
    /**
     * tmux 세션을 생성한다. 명령어가 tmux 한도를 넘을 것 같으면
     * 자동으로 셸 스크립트 파일에 기록하고 스크립트 경로만 tmux 에 전달한다.
     */
    private createTmuxSession;
    checkPrerequisites(): Promise<void>;
    startAgent(params: {
        agent: AgentConfig;
        config: ProjectConfig;
        task?: Task;
        contextDocs?: string[];
        kanbanSummary?: string;
        projectRoot: string;
        message?: string;
        /**
         * 이 세션이 "완료" 로 간주되려면 반드시 생성되어야 할 산출물 파일 경로들.
         * WorkflowEngine 이 checkOutputs 로 검증하는 경로와 동일해야 한다 — 여기서 명시하지 않으면
         * 에이전트가 의미 있는 파일명(예: mvp-core-features.md)으로 저장해 산출물 검증이 계속 실패한다.
         */
        expectedOutputs?: string[];
        /** 페이즈 완료 조건 문구 (Phase.completionCriteria) */
        completionCriteria?: string;
        /** 현재 워크플로우 페이즈 — PromptBuilder 가 페이즈별 룰(컴포넌트 단위 TDD 등)을 주입한다 */
        phaseName?: WorkflowPhase;
        /** 컴포넌트 페이즈일 때 어떤 컴포넌트를 다루는지 — 5종 테스트 경로/구현 경로를 프롬프트에 노출 */
        componentSpec?: ComponentSpec;
    }): Promise<AgentSession>;
    stopAgent(role: string): Promise<void>;
    stopAll(): Promise<void>;
    getRunningAgents(): Promise<AgentSession[]>;
    isAgentRunning(role: string): Promise<boolean>;
    getAgentLog(role: string, lines?: number): Promise<string>;
    /**
     * config.ts의 ProviderConfigType을 provider-adapter.ts의 ProviderConfig으로 변환합니다.
     */
    private toAdapterConfig;
    /**
     * 에이전트의 required_mcp_tools와 프로젝트의 mcp_servers 설정을 매칭하여
     * ProviderAdapter.buildCommand에 전달할 mcpConfig 객체를 생성합니다.
     */
    private buildMcpConfigObject;
    /**
     * 에이전트의 required_mcp_tools와 프로젝트의 mcp_servers 설정을 매칭하여
     * Claude Code CLI의 --mcp-config 인자를 생성한다.
     */
    private buildMcpConfigArg;
    pauseAgent(role: string): Promise<void>;
    /**
     * 에페메럴(일시적) 에이전트 세션 시작.
     * 고유 sessionName으로 ���행되며, 완료 후 자동 정리된다.
     */
    startEphemeralAgent(params: {
        sessionName: string;
        agent: AgentConfig;
        config: ProjectConfig;
        contextDocs?: string[];
        kanbanSummary?: string;
        projectRoot: string;
        message: string;
    }): Promise<AgentSession>;
    /**
     * 다중 에이전트 회의 시작.
     * 회의 주최자(initiator)를 하나의 세션으로 실행하되,
     * 참여자 목록과 안건을 시스템 프롬프트에 주입하여
     * 다른 에이전트의 관점을 반영한 회의를 진행하게 한다.
     */
    startMeetingSession(params: {
        meetingId: string;
        initiator: AgentConfig;
        participants: AgentConfig[];
        consultants?: Array<{
            id: string;
            config: AgentConfig;
        }>;
        config: ProjectConfig;
        agenda: string;
        kanbanSummary?: string;
        projectRoot: string;
    }): Promise<AgentSession>;
}
//# sourceMappingURL=session-manager.d.ts.map