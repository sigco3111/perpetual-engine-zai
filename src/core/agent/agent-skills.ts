import type { AgentRole, AgentSkill } from './agent-types.js';

/**
 * 에이전트 역할별 기본 스킬 매핑.
 * 
 * ZAI 포크에서는 Claude Code 전용 슬래시 커맨드 대신
 * 프로바이더에 독립적인 프롬프트 기반 스킬을 사용합니다.
 * 
 * 스킬 타입:
 * - `prompt`: 시스템 프롬프트에 주입되는 지시어 (모든 프로바이더에서 사용 가능)
 * - `tool`: 프로바이더 전용 툴 (해당 프로바이더에서만 사용 가능)
 */
export type SkillType = 'prompt' | 'tool';

export interface EnhancedAgentSkill extends AgentSkill {
  /** 스킬 타입 */
  type: SkillType;
  /** 이 스킬이 호환되는 프로바이더 (빈 배열이면 모든 프로바이더에서 사용 가능) */
  compatibleProviders?: string[];
  /** 스킬의 상세 지시어 (type='prompt'인 경우 프롬프트에 주입됨) */
  instruction?: string;
}

/**
 * 에이전트 역할별 기본 스킬 매핑.
 * 각 에이전트는 자신의 역할에 맞는 스킬만 사용할 수 있다.
 */
export const DEFAULT_AGENT_SKILLS: Record<string, EnhancedAgentSkill[]> = {
  ceo: [
    {
      name: 'launch-strategy',
      type: 'prompt',
      description: '제품 런칭 전략 수립 - 단계별 출시 계획, 채널 전략, 런칭 모멘텀 유지',
      when_to_use: '새 제품/기능 런칭을 계획하거나 go-to-market 전략이 필요할 때',
      instruction: `런칭 전략 수립 시 다음 프레임워크를 따르세요:
1. 시장 검증 상태 파악 (MVP, 베타, GA)
2. 타겟 세그먼트 우선순위 결정
3. 채널 전략 (유료/무료, 직접/간접)
4. 런칭 타임라인 (프리-런칭 → 런칭 → 포스트-런칭)
5. 성공 지표 (KPI) 설정
6. 롤아웃 전략 (소프트 런칭 → 단계적 확장)`,
    },
    {
      name: 'marketing-psychology',
      type: 'prompt',
      description: '행동 심리학 기반 의사결정 - 70+ 멘탈 모델로 사용자 행동 예측',
      when_to_use: '사용자 행동 예측, 가격 전략, 포지셔닝 등 심리학 기반 판단이 필요할 때',
      instruction: `행동 심리학 기반 분석 시 다음 원리를 적용하세요:
- 앵커링 효과 (가격/기대치 설정)
- 손실 회피 (프리미엄 가격 정당화)
- 사회적 증거 (리뷰, 사용자 수)
- 희소성 (한정 제안, 얼리버드)
- 체링크 효과 (경험의 순서 설계)
- 프레이밍 효과 (메시지 표현 방식)`,
    },
    {
      name: 'seo-audit',
      type: 'prompt',
      description: 'SEO 감사 - 기술적 SEO 이슈 진단 및 검색 노출 최적화',
      when_to_use: '웹사이트의 검색 엔진 최적화 상태를 점검해야 할 때',
      instruction: `SEO 감사 시 다음 항목을 점검하세요:
1. 기술적 SEO: 메타 태그, 구조화 데이터, 사이트맵, 로딩 속도
2. 콘텐츠 SEO: 키워드 최적화, 내부 링크, 콘텐츠 품질
3. 온페이지 SEO: 제목 태그, URL 구조, 이미지 최적화
4. 오프페이지 SEO: 백링크 프로필, 도메인 권위
5. 로컬 SEO (필요시): 구글 비즈니스 프로필, 로컬 키워드`,
    },
  ],

  cto: [
    {
      name: 'security-review',
      type: 'prompt',
      description: '보안 리뷰 - 현재 브랜치 변경사항의 보안 취약점 분석',
      when_to_use: '코드 변경 후 배포 전 보안 점검이 필요할 때',
      instruction: `보안 리뷰 시 다음 항목을 점검하세요:
1. 입력 검증 (SQL 인젝션, XSS, CSRF)
2. 인증/인가 로직
3. 민감 데이터 처리 (암호화, 마스킹)
4. 의존성 취약점 (CVE 체크)
5. API 보안 (속도 제한, 인증 토큰)
6. 로깅 및 모니터링`,
    },
    {
      name: 'ai-api-integration',
      type: 'prompt',
      description: 'AI API/SDK 앱 빌드 - 프롬프트 캐싱, 도구 사용, 배치 처리 최적화',
      when_to_use: 'AI 기능을 구현하거나 LLM API를 사용하는 코드를 작성할 때',
      compatibleProviders: ['claude-code', 'opencode', 'http-api'],
      instruction: `AI API 통합 시 다음 원칙을 따르세요:
1. 프롬프트 캐싱 활용 (비용 절감)
2. 구조화된 출력 (JSON Schema)
3. 토큰 사용량 최적화
4. 에러 처리 및 재시도 로직
5. 속도 제한 준수
6. 비동기 처리 (긴 작업)`,
    },
    {
      name: 'vercel-react-best-practices',
      type: 'prompt',
      description: 'React/Next.js 성능 최적화 - Vercel 엔지니어링 가이드라인 기반',
      when_to_use: 'React/Next.js 코드를 작성하거나 성능을 최적화할 때',
      instruction: `React/Next.js 최적화 시 다음을 준수하세요:
1. 서버 컴포넌트 우선 (RSC)
2. 이미지 최적화 (next/image)
3. 코드 스플리팅 (dynamic import)
4. 데이터 페칭 (ISR, revalidation)
5. 에지 런타임 활용 (필요시)
6. 번들 사이즈 최적화`,
    },
    {
      name: 'simplify',
      type: 'prompt',
      description: '코드 품질 리뷰 - 재사용성, 품질, 효율성 검토 후 개선',
      when_to_use: '구현 완료 후 코드 품질을 높이고 싶을 때',
      instruction: `코드 간소화 리뷰 시 다음 원칙을 적용하세요:
1. 단일 책임 원칙 (SRP)
2. 중복 제거 (DRY)
3. 의미 있는 이름 사용
4. 함수 길이 제한 (20줄 이내 권장)
5. 복잡도 감소 (중첩 레벨 ≤ 3)
6. 타입 안전성 확보`,
    },
  ],

  po: [
    {
      name: 'copywriting',
      type: 'prompt',
      description: '마케팅 카피 작성 - 홈페이지, 랜딩페이지, 기능 페이지 등의 카피',
      when_to_use: '제품 페이지의 카피를 작성하거나 개선해야 할 때',
      instruction: `카피 작성 시 다음 원칙을 따르세요:
1. 헤드라인: 혜택 중심, 구체적, 호기심 유발
2. 서브헤드라인: 헤드라인 보완, 구체적 결과
3. CTA: 행동 중심, 긴박감, 명확성
4. 소셜 프루프: 데이터, 인용, 사용 후기
5. 반대 의견 처리: "하지만..." 패턴
6. 가치 제안 명확화: 10초 안에 전달`,
    },
    {
      name: 'marketing-psychology',
      type: 'prompt',
      description: '행동 심리학 기반 기획 - 사용자 의사결정 패턴 분석',
      when_to_use: '사용자 행동을 이해하고 기능 기획에 심리학 원리를 적용할 때',
      instruction: `사용자 심리 기반 기획 시:
1. 사용자 여정 매핑 (인지 → 고려 → 전환 → 유지)
2. 각 단계의 심리적 장벽 파악
3. 동기 부여 요소 설계
4. 마찰 요소 제거
5. 피드백 루프 구축`,
    },
    {
      name: 'web-design-guidelines',
      type: 'prompt',
      description: 'UI 가이드라인 검토 - 접근성, UX 모범 사례 확인',
      when_to_use: 'UI 기획안이 웹 인터페이스 가이드라인에 부합하는지 확인할 때',
      instruction: `UI 가이드라인 검토 시:
1. WCAG 2.1 AA 준수 (접근성)
2. 반응형 디자인 (모바일 우선)
3. 일관된 내비게이션 패턴
4. 명확한 시각적 계층
5. 적절한 색상 대비 (4.5:1 이상)
6. 키보드 내비게이션 지원`,
    },
  ],

  designer: [
    {
      name: 'frontend-design',
      type: 'prompt',
      description: '프론트엔드 디자인 구현 - 프로덕션급 UI 컴포넌트 생성',
      when_to_use: '웹 컴포넌트, 페이지, 대시보드 등의 UI를 구현할 때',
      instruction: `프론트엔드 디자인 시:
1. 디자인 시스템 토큰 사용 (CSS 변수)
2. 컴포넌트 재사용성
3. 접근성 (ARIA 속성)
4. 반응형 (모바일 → 데스크톱)
5. 성능 (lazy loading, 최적화)
6. 크로스 브라우저 호환성`,
    },
    {
      name: 'web-design-guidelines',
      type: 'prompt',
      description: 'UI 코드 리뷰 - 접근성, 디자인 모범 사례 준수 확인',
      when_to_use: 'UI 코드가 웹 인터페이스 가이드라인에 맞는지 검토할 때',
      instruction: `UI 코드 리뷰 시:
1. 시맨틱 HTML 사용
2. CSS 변수 기반 스타일링
3. 일관된 간격/타이포그래피
4. 포커스 상태 관리
5. 애니메이션 성능 (transform, opacity)
6. 다크 모드 지원`,
    },
  ],

  qa: [
    {
      name: 'security-review',
      type: 'prompt',
      description: '보안 리뷰 - 변경사항의 보안 취약점 분석',
      when_to_use: '배포 전 보안 관점에서 코드를 검토할 때',
      instruction: `QA 보안 리뷰 체크리스트:
1. OWASP Top 10 검토
2. 입력 검증 (모든 사용자 입력)
3. 인증 플로우 테스트
4. 권한 경계 테스트
5. 데이터 노출 점검
6. 에러 메시지 정보 노출`,
    },
    {
      name: 'audit-website',
      type: 'prompt',
      description: '웹사이트 감사 - SEO, 성능, 보안, 콘텐츠 등 150+ 규칙으로 진단',
      when_to_use: '배포된 웹사이트/앱의 전반적 품질을 점검할 때',
      instruction: `웹사이트 종합 감사 항목:
1. 성능: Lighthouse 점수, Core Web Vitals
2. 접근성: WCAG 준수, 스크린 리더 테스트
3. SEO: 메타 태그, 구조화 데이터
4. 보안: HTTPS, 헤더 설정, 취약점
5. 호환성: 브라우저/디바이스 테스트
6. 콘텐츠: 링크 점검, 이미지 최적화`,
    },
  ],

  marketer: [
    {
      name: 'paid-ads',
      type: 'prompt',
      description: '유료 광고 캠페인 - Google Ads, Meta, LinkedIn 등 PPC 전략',
      when_to_use: '유료 광고 캠페인을 기획하거나 최적화할 때',
      instruction: `유료 광고 캠페인 기획 시:
1. 목표 설정 (인지/전환/재방문)
2. 타겟 오디언스 정의
3. 키워드 리서치
4. 크리에이티브 A/B 테스트 계획
5. 예산 배분 전략
6. 성과 측정 프레임워크`,
    },
    {
      name: 'seo-audit',
      type: 'prompt',
      description: 'SEO 감사 - 기술적 SEO 이슈 진단',
      when_to_use: '검색 엔진 최적화 상태를 점검하고 개선할 때',
      instruction: `마케팅 SEO 감사 시:
1. 키워드 갭 분석 (경쟁사 대비)
2. 콘텐츠 기회 식별
3. 기술적 SEO 기준선
4. 백링크 프로필 분석
5. 로컬 SEO 기회
6. 개선 우선순위 결정`,
    },
    {
      name: 'copywriting',
      type: 'prompt',
      description: '마케팅 카피 작성 - 모든 종류의 마케팅 페이지 카피',
      when_to_use: '마케팅 콘텐츠, 랜딩페이지, 광고 카피를 작성할 때',
      instruction: `마케팅 카피 작성 프레임워크:
1. AIDA (인지→관심→욕구→행동)
2. PAS (문제→불안→해결)
3. BAB (이전→후→다리)
4. FAB (특징→이점→가치)
5. 4U (독특, 긴급, 초특가, 유용)`,
    },
    {
      name: 'launch-strategy',
      type: 'prompt',
      description: '런칭 전략 - 제품/기능 출시 계획 수립',
      when_to_use: '제품 런칭이나 기능 출시 전략을 세울 때',
      instruction: `런칭 마케팅 전략:
1. PRH (Product Hunt, Hacker News 등) 타이밍
2. 이메일 캠페인 (프리-런칭~포스트)
3. 소셜 미디어 캘린더
4. 커뮤니티 참여 전략
5. 파트너십/협업 기회
6. 피드백 수집 채널`,
    },
    {
      name: 'marketing-psychology',
      type: 'prompt',
      description: '마케팅 심리학 - 소비자 행동과학 기반 전략',
      when_to_use: '소비자 심리를 활용한 마케팅 전략이 필요할 때',
      instruction: `마케팅 심리학 적용:
1. 후회 회피 (FOMO 마케팅)
2. 상호성 원칙 (무료 샘플, 가치 제공)
3. 권위 (전문가 인증, 데이터)
4. 호감 (스토리텔링, 공감)
5. 일관성 (작은 약속 → 큰 약속)
6. 사회적 증거 (사용자 수, 리뷰)`,
    },
    {
      name: 'google-ads-manager',
      type: 'prompt',
      description: 'Google Ads 관리 - 캠페인 설정, 키워드 리서치, 입찰 최적화',
      when_to_use: 'Google Ads 캠페인을 설정하거나 성과를 분석할 때',
      instruction: `Google Ads 캠페인 관리:
1. 캠페인 구조 (검색/디스플레이/비디오)
2. 키워드 그룹화 (의도 기반)
3. 광고 소재 최적화
4. 입찰 전략 (ROAS/CPA/클릭당)
5. 타겟팅 세분화
6. 전환 추적 설정`,
    },
  ],
};

/** 역할에 맞는 기본 스킬 목록 반환 */
export function getSkillsForRole(role: string): EnhancedAgentSkill[] {
  return DEFAULT_AGENT_SKILLS[role] ?? [];
}

/**
 * 프로바이더에 맞는 스킬만 필터링합니다.
 */
export function filterSkillsByProvider(skills: EnhancedAgentSkill[], provider: string): EnhancedAgentSkill[] {
  return skills.filter(skill => {
    if (!skill.compatibleProviders || skill.compatibleProviders.length === 0) return true;
    return skill.compatibleProviders.includes(provider);
  });
}
