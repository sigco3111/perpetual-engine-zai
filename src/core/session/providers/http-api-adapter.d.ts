/**
 * HTTP API Provider Adapter
 *
 * CLI가 아닌 HTTP API를 통해 AI 모델을 호출합니다.
 * ZAI (GLM), OpenAI, Anthropic 등 어떤 OpenAI-compatible API든 사용 가능합니다.
 *
 * 이 어댑터는 tmux 세션 대신 직접 HTTP 요청을 보내고 응답을 처리합니다.
 * Claude Code / OpenCode처럼 파일 시스템에 직접 접근할 수는 없으므로,
 * 시스템 프롬프트에 작업 지시를 담아 결과를 텍스트로 반환받는 방식입니다.
 */
import type { ProviderAdapter, ProviderConfig, BuildCommandResult, McpServerConfig } from '../provider-adapter.js';
export declare class HttpApiAdapter implements ProviderAdapter {
    readonly type: "http-api";
    readonly isCLIBased = false;
    private baseUrl;
    private apiKey?;
    private model;
    private extraHeaders;
    constructor(config: ProviderConfig);
    /**
     * HTTP API 어댑터는 tmux 명령어를 생성하지 않습니다.
     * 대신 Node.js child_process로 간단한 스크립트를 실행합니다.
     */
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
    private buildNodeScript;
}
//# sourceMappingURL=http-api-adapter.d.ts.map