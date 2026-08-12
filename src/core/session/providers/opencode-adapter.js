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
export class OpenCodeAdapter {
    type = 'opencode';
    isCLIBased = true;
    /** OpenCode 바이너리 경로 (기본: opencode) */
    binary;
    /** 사용할 모델 (provider/model 형식, 빈 값이면 opencode 기본값 사용) */
    model;
    constructor(config) {
        this.binary = config.binary || 'opencode';
        this.model = config.api?.model || '';
    }
    buildCommand(params) {
        return this.buildRunCommand(params.systemPrompt, params.taskInstruction || '');
    }
    buildEphemeralCommand(params) {
        return this.buildRunCommand(params.systemPrompt, params.message);
    }
    buildMeetingCommand(params) {
        return this.buildRunCommand(params.systemPrompt, params.meetingAgenda);
    }
    /**
     * 공통 명령어 빌더.
     * 시스템 프롬프트를 컨텍스트로 메시지 앞에 결합하고,
     * `opencode run` 서브커맨드로 실행합니다.
     */
    buildRunCommand(systemPrompt, userMessage) {
        // 시스템 프롬프트 + 사용자 메시지를 하나의 메시지로 결합
        const combinedMessage = systemPrompt
            ? `[시스템 지시]\n${systemPrompt}\n\n[사용자 메시지]\n${userMessage}`
            : userMessage;
        const parts = [
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
    escapeSingleQuote(str) {
        return str.replace(/'/g, "'\\''");
    }
}
//# sourceMappingURL=opencode-adapter.js.map