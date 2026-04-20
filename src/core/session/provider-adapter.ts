/**
 * Provider Adapter Interface
 * 
 * Claude Code, OpenCode, 또는 HTTP API 기반의 다양한 AI 런타임을
 * 단일 인터페이스로 추상화합니다.
 * 
 * 새로운 프로바이더를 추가하려면 이 인터페이스를 구현하세요.
 */

export type ProviderType = 'claude-code' | 'opencode' | 'aicp' | 'http-api';

export interface ProviderConfig {
  /** 프로바이더 타입 */
  type: ProviderType;
  /** CLI 바이너리 이름 (CLI 타입인 경우) */
  binary?: string;
  /** CLI 인자 템플릿 */
  args?: ProviderArgs;
  /** HTTP API 설정 (http-api 타입인 경우) */
  api?: {
    baseUrl?: string;
    apiKey?: string;
    model?: string;
    headers?: Record<string, string>;
  };
  /** 동시 실행 제한 (기본: 1) */
  maxConcurrency?: number;
  /** 타임아웃 (ms, 기본: 600000 = 10분) */
  defaultTimeout?: number;
  /** MCP 서버 설정 (CLI 타입인 경우) */
  mcpServers?: Record<string, McpServerConfig>;
}

export interface ProviderArgs {
  /** 시스템 프롬프트 전달 방식: 'append-system-prompt' | 'system' | 'env' */
  systemPromptMode: 'append-system-prompt' | 'system' | 'env';
  /** 시스템 프롬프트 CLI 플래그 */
  systemPromptFlag: string;
  /** 세션 ID CLI 플래그 (없으면 undefined) */
  sessionIdFlag?: string;
  /** 자동 승인 CLI 플래그 (없으면 undefined) */
  autoApproveFlag?: string;
  /** 프로젝트 디렉토리 CLI 플래그 (없으면 undefined) */
  projectDirFlag?: string;
  /** 프롬프트 입력 CLI 플래그 */
  promptFlag: string;
  /** MCP 설정 CLI 픜래그 (없으면 undefined) */
  mcpConfigFlag?: string;
}

export interface McpServerConfig {
  command: string;
  args: string[];
  env: Record<string, string>;
}

export interface BuildCommandResult {
  /** 실행할 전체 명령어 (tmux 세션에 전달) */
  command: string;
  /** 명령이 8KB 초과 시 .sh 파일로 분리해야 하는지 */
  useScriptFile: boolean;
}

/**
 * 프로바이더 어댑터 인터페이스
 */
export interface ProviderAdapter {
  /** 프로바이더 타입 */
  readonly type: ProviderType;
  /** 이 어댑터가 CLI 기반인지 HTTP API 기반인지 */
  readonly isCLIBased: boolean;

  /**
   * 에이전트 실행 명령어를 빌드합니다.
   * @param params 명령어 빌드 파라미터
   * @returns 실행할 명령어 정보
   */
  buildCommand(params: {
    systemPrompt: string;
    sessionId: string;
    projectRoot: string;
    taskInstruction?: string;
    mcpConfig?: Record<string, McpServerConfig>;
    agentName: string;
  }): BuildCommandResult;

  /**
   * 에페메럴 (컨설턴트) 에이전트 명령어를 빌드합니다.
   */
  buildEphemeralCommand(params: {
    systemPrompt: string;
    sessionId: string;
    projectRoot: string;
    message: string;
    mcpConfig?: Record<string, McpServerConfig>;
  }): BuildCommandResult;

  /**
   * 회의 세션 명령어를 빌드합니다.
   */
  buildMeetingCommand(params: {
    systemPrompt: string;
    sessionId: string;
    projectRoot: string;
    meetingAgenda: string;
    mcpConfig?: Record<string, McpServerConfig>;
  }): BuildCommandResult;

  /**
   * 세션이 정상적으로 완료되었는지 확인합니다.
   * CLI 기반: tmux 세션 존재 여부로 판단
   * HTTP 기반: 응답 상태로 판단
   */
  isSessionComplete?(sessionName: string): Promise<boolean>;
}
