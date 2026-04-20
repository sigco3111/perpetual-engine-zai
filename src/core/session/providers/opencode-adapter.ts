/**
 * OpenCode Provider Adapter
 * 
 * OpenCode (oh-my-openagent) CLI를 에이전트 런타임으로 사용합니다.
 * AICP (Agent Communication Protocol) 기반 --acp --stdio 통신을 지원합니다.
 * 
 * 주요 차이점 vs Claude Code:
 * - --model 플래그로 모델 지정 가능
 * - --acp --stdio로 프로그래밍 방식 실행
 * - 세션 ID 관리 방식이 다름
 */

import type { ProviderAdapter, ProviderConfig, BuildCommandResult, McpServerConfig } from '../provider-adapter.js';

export class OpenCodeAdapter implements ProviderAdapter {
  readonly type = 'opencode' as const;
  readonly isCLIBased = true;

  /** OpenCode 바이너리 이름 (기본: opencode) */
  private binary: string;
  /** 사용할 모델 (기본: claude-sonnet-4) */
  private model: string;

  constructor(config: ProviderConfig) {
    this.binary = config.binary || 'opencode';
    this.model = config.api?.model || 'claude-sonnet-4';
  }

  buildCommand(params: {
    systemPrompt: string;
    sessionId: string;
    projectRoot: string;
    taskInstruction?: string;
    mcpConfig?: Record<string, McpServerConfig>;
    agentName: string;
  }): BuildCommandResult {
    const parts: string[] = [
      this.binary,
      '--model', this.model,
      '--agent', `'${this.escapeSingleQuote(params.systemPrompt)}'`,
    ];

    if (params.taskInstruction) {
      parts.push('-p', `'${this.escapeSingleQuote(params.taskInstruction)}'`);
    }

    // OpenCode는 MCP 서버를 opencode.json에서 관리하므로
    // CLI 인자로 전달하지 않고, 필요시 opencode.json을 생성
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
      this.binary,
      '--model', this.model,
      '--agent', `'${this.escapeSingleQuote(params.systemPrompt)}'`,
      '-p', `'${this.escapeSingleQuote(params.message)}'`,
    ];

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
      this.binary,
      '--model', this.model,
      '--agent', `'${this.escapeSingleQuote(params.systemPrompt)}'`,
      '-p', `'${this.escapeSingleQuote(params.meetingAgenda)}'`,
    ];

    const command = parts.join(' ');
    return { command, useScriptFile: command.length > 8000 };
  }

  private escapeSingleQuote(str: string): string {
    return str.replace(/'/g, "'\\''");
  }
}
