/**
 * Concurrency Limiter
 *
 * 프로바이더별/모델별 동시 실행 제한을 관리합니다.
 * ZAI API의 모델별 Concurrency Limit을 준수하여
 * 에이전트 세션이 제한을 초과하지 않도록 큐잉합니다.
 */
export interface ConcurrencyRule {
    /** 프로바이더 타입 */
    provider: string;
    /** 모델 이름 (정규식 가능) */
    modelPattern: string;
    /** 최대 동시 세션 수 */
    maxConcurrency: number;
}
export interface QueuedTask {
    id: string;
    provider: string;
    model: string;
    role: string;
    execute: () => Promise<void>;
    resolve: () => void;
    reject: (err: Error) => void;
}
export declare class ConcurrencyLimiter {
    private rules;
    /** provider:model → 현재 실행 중인 수 */
    private runningCounts;
    /** 대기 중인 태스크 큐 */
    private queue;
    private processing;
    constructor(rules?: ConcurrencyRule[]);
    /**
     * 동시성 규칙을 추가합니다.
     */
    addRule(rule: ConcurrencyRule): void;
    /**
     * 규칙을 설정 파일에서 로드합니다.
     * ZAI Rate Limits 문서 형식의 설정을 파싱합니다.
     */
    loadRules(providerConfig: Record<string, Record<string, number>>): void;
    /**
     * 특정 프로바이더+모델의 최대 동시성을 반환합니다.
     * 매칭되는 규칙이 없으면 기본값 1을 반환합니다.
     */
    getMaxConcurrency(provider: string, model: string): number;
    /**
     * 특정 프로바이더+모델의 현재 실행 중인 세션 수를 반환합니다.
     */
    getRunningCount(provider: string, model: string): number;
    /**
     * 특정 프로바이더+모델에 대한 사용 가능한 동시성 슬롯 수를 반환합니다.
     */
    getAvailableSlots(provider: string, model: string): number;
    /**
     * 태스크를 실행합니다. 동시성 제한에 걸리면 큐에서 대기합니다.
     * @returns 세션이 실제 시작될 때 resolve되는 Promise
     */
    acquire(provider: string, model: string, role: string, execute: () => Promise<void>): Promise<void>;
    /**
     * 세션 완료 후 반드시 호출하여 동시성 카운트를 해제합니다.
     */
    release(provider: string, model: string): void;
    /**
     * 대기 큐를 처리합니다.
     */
    private processQueue;
    /**
     * 현재 상태를 반환합니다 (디버깅/모니터링용).
     */
    getStatus(): {
        rules: ConcurrencyRule[];
        running: Record<string, number>;
        queued: number;
    };
}
//# sourceMappingURL=concurrency-limiter.d.ts.map