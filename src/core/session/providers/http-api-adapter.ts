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

import type { ProviderAdapter, ProviderConfig, BuildCommandResult, McpServerConfig } from './provider-adapter.js';

export class HttpApiAdapter implements ProviderAdapter {
  readonly type = 'http-api' as const;
  readonly isCLIBased = false;

  private baseUrl: string;
  private apiKey?: string;
  private model: string;
  private extraHeaders: Record<string, string>;

  constructor(config: ProviderConfig) {
    this.baseUrl = config.api?.baseUrl || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    this.apiKey = config.api?.apiKey;
    this.model = config.api?.model || 'glm-4-flash';
    this.extraHeaders = config.api?.headers || {};
  }

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
  }): BuildCommandResult {
    const payload = {
      model: this.model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        ...(params.taskInstruction ? [{ role: 'user', content: params.taskInstruction }] : []),
      ],
      temperature: 0.7,
    };

    const script = this.buildNodeScript(payload, params.sessionId);
    return { command: `node -e '${script.replace(/'/g, "'\\''")}'`, useScriptFile: true };
  }

  buildEphemeralCommand(params: {
    systemPrompt: string;
    sessionId: string;
    projectRoot: string;
    message: string;
    mcpConfig?: Record<string, McpServerConfig>;
  }): BuildCommandResult {
    const payload = {
      model: this.model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.message },
      ],
      temperature: 0.7,
    };

    const script = this.buildNodeScript(payload, params.sessionId);
    return { command: `node -e '${script.replace(/'/g, "'\\''")}'`, useScriptFile: true };
  }

  buildMeetingCommand(params: {
    systemPrompt: string;
    sessionId: string;
    projectRoot: string;
    meetingAgenda: string;
    mcpConfig?: Record<string, McpServerConfig>;
  }): BuildCommandResult {
    const payload = {
      model: this.model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.meetingAgenda },
      ],
      temperature: 0.7,
    };

    const script = this.buildNodeScript(payload, params.sessionId);
    return { command: `node -e '${script.replace(/'/g, "'\\''")}'`, useScriptFile: true };
  }

  private buildNodeScript(payload: object, sessionId: string): string {
    const json = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.extraHeaders,
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    const headersJson = JSON.stringify(headers);

    return `
const https = require('https');
const url = require('url');
const payload = ${json};
const headers = ${headersJson};
const parsed = new URL('${this.baseUrl}');
const postData = JSON.stringify(payload);
const req = https.request({
  hostname: parsed.hostname,
  port: parsed.port || 443,
  path: parsed.pathname + parsed.search,
  method: 'POST',
  headers: { ...headers, 'Content-Length': Buffer.byteLength(postData) },
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      const content = result.choices?.[0]?.message?.content || result.output?.text || JSON.stringify(result);
      console.log(content);
    } catch(e) { console.error('Parse error:', data.slice(0, 500)); process.exit(1); }
  });
});
req.on('error', (e) => { console.error('Request failed:', e.message); process.exit(1); });
req.write(postData);
req.end();
`;
  }
}
