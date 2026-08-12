/**
 * Claude Code Provider Adapter
 *
 * 원본 Perpetual Engine의 Claude Code CLI 호출 로직을 어댑터로 캡슐화합니다.
 */
export class ClaudeCodeAdapter {
    config;
    type = 'claude-code';
    isCLIBased = true;
    constructor(config) {
        this.config = config;
    }
    buildCommand(params) {
        const parts = [
            'claude',
            '--append-system-prompt', `'${this.escapeSingleQuote(params.systemPrompt)}'`,
            '--session-id', params.sessionId,
            '--dangerously-skip-permissions',
            '--add-dir', `'${params.projectRoot}'`,
        ];
        if (params.taskInstruction) {
            parts.push("-p", `'${this.escapeSingleQuote(params.taskInstruction)}'`);
        }
        const mcpArg = this.buildMcpConfigArg(params.mcpConfig);
        if (mcpArg) {
            parts.push('--mcp-config', `'${mcpArg}'`);
        }
        const command = parts.join(' ');
        return { command, useScriptFile: command.length > 8000 };
    }
    buildEphemeralCommand(params) {
        const parts = [
            'claude',
            '--append-system-prompt', `'${this.escapeSingleQuote(params.systemPrompt)}'`,
            '--session-id', params.sessionId,
            '--dangerously-skip-permissions',
            '--add-dir', `'${params.projectRoot}'`,
            '-p', `'${this.escapeSingleQuote(params.message)}'`,
        ];
        const mcpArg = this.buildMcpConfigArg(params.mcpConfig);
        if (mcpArg) {
            parts.push('--mcp-config', `'${mcpArg}'`);
        }
        const command = parts.join(' ');
        return { command, useScriptFile: command.length > 8000 };
    }
    buildMeetingCommand(params) {
        const parts = [
            'claude',
            '--append-system-prompt', `'${this.escapeSingleQuote(params.systemPrompt)}'`,
            '--session-id', params.sessionId,
            '--dangerously-skip-permissions',
            '--add-dir', `'${params.projectRoot}'`,
            '-p', `'${this.escapeSingleQuote(params.meetingAgenda)}'`,
        ];
        const mcpArg = this.buildMcpConfigArg(params.mcpConfig);
        if (mcpArg) {
            parts.push('--mcp-config', `'${mcpArg}'`);
        }
        const command = parts.join(' ');
        return { command, useScriptFile: command.length > 8000 };
    }
    buildMcpConfigArg(mcpConfig) {
        if (!mcpConfig || Object.keys(mcpConfig).length === 0)
            return null;
        return JSON.stringify(mcpConfig);
    }
    escapeSingleQuote(str) {
        return str.replace(/'/g, "'\\''");
    }
}
//# sourceMappingURL=claude-code-adapter.js.map