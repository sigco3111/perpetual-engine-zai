/**
 * Claude Code Provider Adapter
 * 
 * 원본 Perpetual Engine의 Claude Code CLI 호출 로직을 어댑터로 캡슐화합니다.
 */

import type { ProviderAdapter, ProviderConfig, BuildCommandResult, McpServerConfig } from './provider-adapter.js';

export class ClaudeCodeAdapter implements ProviderAdapter {
  readonly type = 'claude-code' as const;
  readonly isCLIBased = true;

  constructor(private config: ProviderConfig) {}

  buildCommand(params: {
    systemPrompt: string;
    sessionId: string;
    projectRoot: string;
    taskInstruction?: string;
    mcpConfig?: Record<string, McpServerConfig>;
    agentName: string;
  }): BuildCommandResult {
    const parts: string[] = [
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

  buildEphemeralCommand(params: {
    systemPrompt: string;
    sessionId: string;
    projectRoot: string;
    message: string;
    mcpConfig?: Record<string, McpServerConfig>;
  }): BuildCommandResult {
    const parts: string[] = [
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

  buildMeetingCommand(params: {
    systemPrompt: string;
    sessionId: string;
    projectRoot: string;
    meetingAgenda: string;
    mcpConfig?: Record<string, McpServerConfig>;
  }): BuildCommandResult {
    const parts: string[] = [
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

  private buildMcpConfigArg(mcpConfig?: Record<string, McpServerConfig>): string | null {
    if (!mcpConfig || Object.keys(mcpConfig).length === 0) return null;
    return JSON.stringify(mcpConfig);
  }

  private escapeSingleQuote(str: string): string {
    return str.replace(/'/g, "'\\''");
  }
}
