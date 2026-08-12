/**
 * Claude Code Provider Adapter
 *
 * 원본 Perpetual Engine의 Claude Code CLI 호출 로직을 어댑터로 캡슐화합니다.
 */
import type { ProviderAdapter, ProviderConfig, BuildCommandResult, McpServerConfig } from '../provider-adapter.js';
export declare class ClaudeCodeAdapter implements ProviderAdapter {
    private config;
    readonly type: "claude-code";
    readonly isCLIBased = true;
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
    private buildMcpConfigArg;
    private escapeSingleQuote;
}
//# sourceMappingURL=claude-code-adapter.d.ts.map