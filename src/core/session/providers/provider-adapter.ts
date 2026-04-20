export interface McpServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface ProviderConfig {
  type: 'claude-code' | 'opencode' | 'aicp' | 'http-api';
  binary?: string;
  api?: {
    baseUrl?: string;
    apiKey?: string;
    model?: string;
    headers?: Record<string, string>;
  };
  maxConcurrency?: number;
}

export interface BuildCommandResult {
  command: string;
  useScriptFile: boolean;
}

export interface ProviderAdapter {
  readonly type: string;
  readonly isCLIBased: boolean;

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
}
