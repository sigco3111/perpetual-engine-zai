import type { MetricsStore, TaskMetrics, MetricsPlan, MetricsEvaluation } from './types.js';
export declare class MetricsManager {
    private store;
    constructor(filePath: string);
    /** 메트릭스 저장소 전체 읽기 */
    getAll(): Promise<MetricsStore>;
    /** 특정 태스크의 메트릭스 조회 (스키마 불일치 엔트리는 null 로 취급) */
    getTaskMetrics(taskId: string): Promise<TaskMetrics | null>;
    /** 태스크에 메트릭스 계획 등록 */
    setPlan(taskId: string, plan: MetricsPlan): Promise<void>;
    /** 평가 결과 추가 */
    addEvaluation(taskId: string, evaluation: MetricsEvaluation): Promise<void>;
    /** 평가가 필요한 태스크 목록 (체크포인트 또는 종료일 도래) */
    getTasksNeedingEvaluation(): Promise<string[]>;
    /** 특정 태스크의 최신 평가 결과 조회 */
    getLatestEvaluation(taskId: string): Promise<MetricsEvaluation | null>;
    /** 메트릭스 계획이 있는 모든 태스크 ID 반환 */
    getTrackedTaskIds(): Promise<string[]>;
}
//# sourceMappingURL=metrics-store.d.ts.map