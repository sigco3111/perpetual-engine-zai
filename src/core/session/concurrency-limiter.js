/**
 * Concurrency Limiter
 *
 * 프로바이더별/모델별 동시 실행 제한을 관리합니다.
 * ZAI API의 모델별 Concurrency Limit을 준수하여
 * 에이전트 세션이 제한을 초과하지 않도록 큐잉합니다.
 */
export class ConcurrencyLimiter {
    rules = [];
    /** provider:model → 현재 실행 중인 수 */
    runningCounts = new Map();
    /** 대기 중인 태스크 큐 */
    queue = [];
    processing = false;
    constructor(rules = []) {
        this.rules = rules;
    }
    /**
     * 동시성 규칙을 추가합니다.
     */
    addRule(rule) {
        this.rules.push(rule);
    }
    /**
     * 규칙을 설정 파일에서 로드합니다.
     * ZAI Rate Limits 문서 형식의 설정을 파싱합니다.
     */
    loadRules(providerConfig) {
        for (const [provider, models] of Object.entries(providerConfig)) {
            for (const [model, limit] of Object.entries(models)) {
                this.rules.push({
                    provider,
                    modelPattern: model,
                    maxConcurrency: limit,
                });
            }
        }
    }
    /**
     * 특정 프로바이더+모델의 최대 동시성을 반환합니다.
     * 매칭되는 규칙이 없으면 기본값 1을 반환합니다.
     */
    getMaxConcurrency(provider, model) {
        for (const rule of this.rules) {
            if (rule.provider === provider) {
                const regex = new RegExp(rule.modelPattern, 'i');
                if (regex.test(model)) {
                    return rule.maxConcurrency;
                }
            }
        }
        return 1; // 기본값: 안전하게 1
    }
    /**
     * 특정 프로바이더+모델의 현재 실행 중인 세션 수를 반환합니다.
     */
    getRunningCount(provider, model) {
        const key = `${provider}:${model}`;
        return this.runningCounts.get(key) || 0;
    }
    /**
     * 특정 프로바이더+모델에 대한 사용 가능한 동시성 슬롯 수를 반환합니다.
     */
    getAvailableSlots(provider, model) {
        const max = this.getMaxConcurrency(provider, model);
        const running = this.getRunningCount(provider, model);
        return Math.max(0, max - running);
    }
    /**
     * 태스크를 실행합니다. 동시성 제한에 걸리면 큐에서 대기합니다.
     * @returns 세션이 실제 시작될 때 resolve되는 Promise
     */
    async acquire(provider, model, role, execute) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                provider,
                model,
                role,
                execute,
                resolve,
                reject,
            });
            this.processQueue();
        });
    }
    /**
     * 세션 완료 후 반드시 호출하여 동시성 카운트를 해제합니다.
     */
    release(provider, model) {
        const key = `${provider}:${model}`;
        const count = this.runningCounts.get(key) || 0;
        this.runningCounts.set(key, Math.max(0, count - 1));
        this.processQueue();
    }
    /**
     * 대기 큐를 처리합니다.
     */
    processQueue() {
        if (this.processing)
            return;
        this.processing = true;
        const pending = [];
        for (const task of this.queue) {
            const available = this.getAvailableSlots(task.provider, task.model);
            if (available > 0) {
                const key = `${task.provider}:${task.model}`;
                this.runningCounts.set(key, (this.runningCounts.get(key) || 0) + 1);
                pending.push(task);
            }
        }
        // 실행할 태스크를 큐에서 제거
        const pendingIds = new Set(pending.map(t => t.id));
        this.queue = this.queue.filter(t => !pendingIds.has(t.id));
        // 비동기로 실행
        for (const task of pending) {
            task.execute()
                .then(() => task.resolve())
                .catch((err) => task.reject(err))
                .finally(() => {
                this.release(task.provider, task.model);
            });
        }
        this.processing = false;
    }
    /**
     * 현재 상태를 반환합니다 (디버깅/모니터링용).
     */
    getStatus() {
        const running = {};
        for (const [key, count] of this.runningCounts) {
            if (count > 0)
                running[key] = count;
        }
        return {
            rules: this.rules,
            running,
            queued: this.queue.length,
        };
    }
}
//# sourceMappingURL=concurrency-limiter.js.map