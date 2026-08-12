import type { MetricDefinition, MetricResult, MetricsEvaluation, EvaluationVerdict, EvaluationAction, MetricsPlan } from './types.js';
/**
 * 메트릭스 평가기.
 *
 * 기획의 측정 지표를 기반으로 달성도를 계산하고
 * 자동으로 판정(verdict)과 다음 행동(action)을 결정한다.
 *
 * 판정 기준:
 * - exceeded (>=120%): 목표 초과 → scale_up
 * - achieved (>=100%): 목표 달성 → maintain
 * - improving (>=60%): 개선 중 → iterate
 * - stagnant (>=30%): 정체 → pivot
 * - failed (<30%): 실패 → kill
 */
export declare class MetricsEvaluator {
    /**
     * 단일 지표의 달성률 계산.
     * direction에 따라 계산 방식이 달라진다.
     */
    calculateAchievement(metric: MetricDefinition, actual: number): number;
    /** 전체 지표의 가중 평균 달성률 (균등 가중) */
    calculateOverallAchievement(results: MetricResult[]): number;
    /** 달성률로부터 판정 결정 */
    getVerdict(overallAchievement: number): EvaluationVerdict;
    /** 판정으로부터 다음 행동 결정 */
    getAction(verdict: EvaluationVerdict, type: 'checkpoint' | 'final'): EvaluationAction;
    /** 판정별 한국어 설명 생성 */
    generateReasoning(verdict: EvaluationVerdict, action: EvaluationAction, results: MetricResult[], plan: MetricsPlan, type: 'checkpoint' | 'final'): string;
    /** 전체 평가 수행 */
    evaluate(params: {
        taskId: string;
        plan: MetricsPlan;
        actuals: Array<{
            name: string;
            actual: number;
        }>;
        type: 'checkpoint' | 'final';
    }): MetricsEvaluation;
}
//# sourceMappingURL=metrics-evaluator.d.ts.map