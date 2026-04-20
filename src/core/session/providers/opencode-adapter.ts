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

export class OpenCodeAdapter implements ProviderAdapter {
  readonly type = 'opencode' as const;
  readonly isCLIBased = true;

  /** OpenCode 바이너리 경로 (기본: opencode) */
  private binary: string;
  /** 사용할 모델 (provider/model 형식, 빈 값이면 opencode 기본값 사용) */
  private model: string;

  constructor(config: ProviderConfig) {
    this.binary = config.binary || 'opencode';
    this.model = config.api?.model || '';
  }

  buildCommand(params: {
    systemPrompt: string;
    sessionId: string;
    projectRoot: string;
    taskInstruction?: string;
    mcpConfig?: Record<string, McpServerConfig>;
    agentName: string;
  }): BuildCommandResult {
    return this.buildRunCommand(params.systemPrompt, params.taskInstruction || '');
  }

  buildEphemeralCommand(params: {
    systemPrompt: string;
    sessionId: string;
    projectRoot: string;
    message: string;
    mcpConfig?: Record<string, McpServerConfig>;
  }): BuildCommandResult {
    return this.buildRunCommand(params.systemPrompt, params.message);
  }

  buildMeetingCommand(params: {
    systemPrompt: string;
    sessionId: string;
    projectRoot: string;
    meetingAgenda: string;
    mcpConfig?: Record<string, McpServerConfig>;
  }): BuildCommandResult {
    return this.buildRunCommand(params.systemPrompt, params.meetingAgenda);
  }

  /**
   * 공통 명령어 빌더.
   * 시스템 프롬프트를 컨텍스트로 메시지 앞에 결합하고,
   * `opencode run` 서브커맨드로 실행합니다.
   */
  private buildRunCommand(systemPrompt: string, userMessage: string): BuildCommandResult {
    // 시스템 프롬프트 + 사용자 메시지를 하나의 메시지로 결합
    const combinedMessage = systemPrompt
      ? `[시스템 지시]\n${systemPrompt}\n\n[사용자 메시지]\n${userMessage}`
      : userMessage;

    const parts: string[] = [
      this.binary,
      'run',
    ];

    // 모델이 지정된 경우에만 --model 추가
    if (this.model) {
      parts.push('--model', this.model);
    }

    // 자율 실행 (권한 자동 승인)
    parts.push('--dangerously-skip-permissions');

    // 메시지를 인자로 전달
    parts.push(`'${this.escapeSingleQuote(combinedMessage)}'`);

    const command = parts.join(' ');
    return { command, useScriptFile: command.length > 8000 };
  }

  private escapeSingleQuote(str: string): string {
    return str.replace(/'/g, "'\\''");
  }
}
