import type { AgentRole } from '../agent/agent-types.js';
import type { WorkflowPhase, TaskStatus } from '../state/types.js';
import { type ComponentManifest, type ComponentSpec } from './components.js';
export interface Phase {
    /**
     * 페이즈의 정식 이름. development-component 처럼 컴포넌트마다 인스턴스화되는 페이즈는
     * 모두 같은 name 을 공유한다 (instanceKey 로 구분).
     */
    name: WorkflowPhase;
    /**
     * 같은 name 을 가진 페이즈가 여러 번 등장할 때 인스턴스를 구분하는 키.
     * 정적 페이즈는 비워두고, development-component 만 컴포넌트 slug 를 채운다.
     * 재시도 횟수 추적·로그 식별에 쓰인다.
     */
    instanceKey?: string;
    /** 이 페이즈에 진입할 때 칸반 보드에 표시할 상태 */
    taskStatus: TaskStatus;
    leadAgent: AgentRole;
    participantAgents: AgentRole[];
    inputDocPaths: string[];
    outputDocPaths: string[];
    completionCriteria: string;
    /**
     * 다음으로 진행할 페이즈의 이름. 동적 펼침 후에는 워크플로우 엔진이
     * `phases[i+1]` 으로 직접 진행하므로 정적 nextPhase 는 참고용이다.
     */
    nextPhase: WorkflowPhase | null;
    /** 실패 시 재진입할 페이즈. 같은 페이즈로 재시도하려면 자기 자신을 지정. */
    onFailure?: WorkflowPhase;
    /**
     * 이 페이즈의 세션 최대 대기 시간(ms).
     * 미설정 시 [DEFAULT_PHASE_TIMEOUT_MS] 사용.
     */
    timeoutMs?: number;
    /** 컴포넌트 페이즈일 때 어떤 컴포넌트를 다루는지 (프롬프트 빌더용) */
    componentContext?: ComponentSpec;
}
/** 미설정 페이즈의 기본 타임아웃 — 10분 */
export declare const DEFAULT_PHASE_TIMEOUT_MS: number;
/**
 * 워크플로우 페이즈 배열을 빌드한다.
 *
 * - `manifest` 가 없으면: planning → design → development-plan → (testing/deployment/documentation)
 *   development-plan 까지만 진행 후 워크플로우 엔진이 매니페스트를 읽어 다시 buildPhases 를 호출한다.
 * - `manifest` 가 있으면: planning → design → development-plan → development-component(N개) → development-integrate → testing → ...
 *
 * 옛 `development` 페이즈명은 진입 시 `development-plan` 으로 매핑한다 ([resolvePhaseAlias]).
 */
export declare function buildPhases(taskSlug: string, manifest: ComponentManifest | null): Phase[];
/**
 * 옛 `development` phase 값을 새 분할 페이즈로 매핑한다.
 * 기존에 비정상 종료된 태스크가 phase=development 로 남아있을 때 development-plan 부터 재시작.
 */
export declare function resolvePhaseAlias(phase: WorkflowPhase | null | undefined): WorkflowPhase | null;
/**
 * 페이즈 배열에서 이름과 instanceKey 로 페이즈를 찾는다.
 * instanceKey 가 비어있으면 같은 이름의 첫 페이즈를 반환.
 */
export declare function findPhase(phases: Phase[], name: WorkflowPhase, instanceKey?: string): {
    phase: Phase;
    index: number;
} | undefined;
/**
 * 같은 페이즈 인스턴스를 식별하는 키 — 재시도 카운터 맵의 key 로 쓴다.
 * 같은 name 의 컴포넌트 페이즈들이 별도로 카운트되도록 한다.
 */
export declare function phaseInstanceKey(phase: Phase): string;
//# sourceMappingURL=phases.d.ts.map