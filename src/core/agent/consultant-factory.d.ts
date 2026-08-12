import type { AgentConfig } from './agent-types.js';
/**
 * 자문 전문가 에이전트 생성 요청.
 *
 * 고정된 도메인 목록이 없다.
 * 에이전트가 "이런 전문가가 필요하다"고 자유롭게 서술하면
 * 그 설명으로부터 전문가 에이전트를 즉석 생성한다.
 */
export interface ConsultantRequest {
    /**
     * 어떤 전문가가 필요한지 자유 서술.
     * 예: "SaaS B2B 가격 전략 전문가", "GDPR 및 한국 개인정보보호법 전문 변호사",
     *     "헬스케어 도메인의 데이터 규제 전문가", "시리즈A 투자유치 경험이 풍부한 재무 전문가"
     */
    expertise: string;
    /** 자문 요청 배경/컨텍스트 — 왜 이 전문가가 필요한지 */
    context: string;
    /** 구체적 질문 목록 */
    questions: string[];
    /** 자문을 요청한 에이전트 */
    requested_by: string;
    /** 관련 태스크 ID (있으면) */
    related_task_id?: string;
}
/** 생성된 자문 에이전트 인스턴스 (추적용) */
export interface ConsultantAgent {
    /** 고유 ID (예: "consultant-a8f3k2m1") */
    id: string;
    /** 실제 AgentConfig */
    config: AgentConfig;
    /** 전문 분야 (요청자가 서술한 그대로) */
    expertise: string;
    /** 생성 시각 */
    created_at: string;
    /** 요청자 */
    requested_by: string;
    /** 관련 태스크 */
    related_task_id?: string;
    /** 소멸 여부 */
    disposed: boolean;
}
/**
 * 자문 전문가 에이전트 팩토리.
 *
 * 미리 정의된 도메인 없이, 요청에 서술된 전문성으로부터
 * 즉석으로 해당 분야 전문가 에이전트를 생성한다.
 * 생성된 에이전트는 목적 완수 후 자동 소멸된다.
 */
export declare class ConsultantFactory {
    /**
     * 자문 요청으로부터 에페메럴(일시적) 전문가 에이전트를 즉석 생성한다.
     *
     * expertise 필드에 서술된 내용이 곧 이 에이전트의 정체성이 된다.
     * "GDPR 전문 변호사"라고 쓰면 GDPR 전문 변호사가 되고,
     * "핀테크 결제 시스템 아키텍트"라고 쓰면 그 전문가가 된다.
     */
    create(request: ConsultantRequest): ConsultantAgent;
}
//# sourceMappingURL=consultant-factory.d.ts.map