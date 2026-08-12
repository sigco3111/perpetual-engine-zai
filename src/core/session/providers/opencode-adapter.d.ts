/**
 * OpenCode Provider Adapter
 *
 * OpenCode (oh-my-openagent) CLI를 에이전트 런타임으로 사용합니다.
 * `opencode run` 서브커맨드로 비대화형 실행을 수행합니다.
 *
 * 주요 차이점 vs Claude Code:
 * - `opencode run "message"` 서브커맨드 사용
 * - --model 플래그로 모델 지정 (provider/model 형식)
 * - --dangerously-skip-permissions로 자율 실행
 * - 시스템 프롬프트를 메시지 앞에 컨텍스트로 결합
 */
import type { ProviderAdapter, ProviderConfig, BuildCommandResult, McpServerConfig } from '../provider-adapter.js';
export declare class OpenCodeAdapter implements ProviderAdapter {
    readonly type: "opencode";
    readonly isCLIBased = true;
    /** OpenCode 바이너리 경로 (기본: opencode) */
    private binary;
    /** 사용할 모델 (provider/model 형식, 빈 값이면 opencode 기본값 사용) */
    private model;
    constructor(config: ProviderConfig);
    buildCommand(params: {
        systemPrompt: string;
        sessionId: string;
        projectRoot: string;
        taskInstruction?: string;
        mcpConfig?: Record<string, McpServerConfig>;
        agentName: string;
    }): BuildCommandResult;
    buildEphemeralCommand(params: {
        systemPrompt: string;
        sessionId: string;
        projectRoot: string;
        message: string;
        mcpConfig?: Record<string, McpServerConfig>;
    }): BuildCommandResult;
    buildMeetingCommand(params: {
        systemPrompt: string;
        sessionId: string;
        projectRoot: string;
        meetingAgenda: string;
        mcpConfig?: Record<string, McpServerConfig>;
    }): BuildCommandResult;
    /**
     * 공통 명령어 빌더.
     * 시스템 프롬프트를 컨텍스트로 메시지 앞에 결합하고,
     * `opencode run` 서브커맨드로 실행합니다.
     */
    private buildRunCommand;
    private escapeSingleQuote;
}
//# sourceMappingURL=opencode-adapter.d.ts.map