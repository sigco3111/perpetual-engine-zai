import type { AgentConfig } from './agent-types.js';
import type { Task, WorkflowPhase } from '../state/types.js';
import type { ProjectConfig } from '../project/config.js';
import type { ComponentSpec } from '../workflow/components.js';
export declare class PromptBuilder {
    buildSystemPrompt(params: {
        agent: AgentConfig;
        config: ProjectConfig;
        task?: Task;
        contextDocs?: string[];
        kanbanSummary?: string;
        phaseName?: WorkflowPhase;
        componentSpec?: ComponentSpec;
    }): string;
    /**
     * 사용 언어 룰 섹션 생성.
     *
     * 프로젝트 setup 단계에서 선택한 언어를 모든 자연어 출력에 강제한다.
     * 코드, 식별자, 외부 API 키워드 등 기술적 토큰은 제외된다.
     */
    private buildLanguageRule;
    /**
     * 세션 시작 시 본인 역할 맥락을 강제로 적재하는 규칙 생성.
     *
     * 매 실행은 새 Claude Code 세션 → 이전 맥락(대화·파일 상태·결정)이 메모리에 없다.
     * 따라서 첫 행동으로 본인 역할과 관련된 파일을 Glob/Read 로 읽어 적재해야,
     * 과거 결정과 어긋나거나 맥락을 놓친 산출물을 피할 수 있다.
     */
    private buildContextBootstrapRules;
    /** 에이전트 전용 스킬 섹션 생성 */
    private buildSkillsSection;
    /**
     * 진실성(anti-hallucination) 룰 섹션 생성.
     *
     * 에이전트가 거짓·날조·추정치를 "사실처럼" 사용하는 것을 금지한다.
     * 이 규칙은 다른 모든 규칙보다 우선한다.
     */
    private buildTruthfulnessRules;
    /** 메트릭스 기반 기획 룰 섹션 생성 */
    private buildMetricsRules;
    /**
     * 페이즈별 룰 — 현재 워크플로우 페이즈에 따라 추가 규칙을 주입한다.
     *
     * `development-*` 페이즈는 컴포넌트 단위 TDD 와 5종 테스트(unit/UI/snapshot/integration/E2E)
     * 를 강제한다. 도구는 tech-stack.md 의 test_runners 를 그대로 사용한다.
     */
    private buildPhaseRules;
    /** 다중 참여자 회의 및 자문 전문가 요청 가이드 */
    private buildMeetingAndConsultationGuide;
    buildKanbanSummary(tasks: Task[]): string;
}
//# sourceMappingURL=prompt-builder.d.ts.map