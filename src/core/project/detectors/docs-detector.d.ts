/** 감지된 문서/워크플로우 정보 */
export interface DetectedDocs {
    /** README에서 추출한 프로젝트 설명 */
    projectDescription: string;
    /** 존재하는 문서 카테고리 */
    docCategories: string[];
    /** 워크플로우/프로세스 키워드 */
    workflowKeywords: string[];
    /** 도메인 키워드 (프로젝트가 다루는 분야) */
    domainKeywords: string[];
    /** 기여 가이드 존재 여부 */
    hasContribGuide: boolean;
    /** API 문서 존재 여부 */
    hasApiDocs: boolean;
    /** 디자인 문서 존재 여부 */
    hasDesignDocs: boolean;
    /** QA/테스트 문서 존재 여부 */
    hasQaDocs: boolean;
    /** 마케팅/비즈니스 문서 존재 여부 */
    hasBusinessDocs: boolean;
}
export declare function detectDocs(projectRoot: string): Promise<DetectedDocs>;
//# sourceMappingURL=docs-detector.d.ts.map