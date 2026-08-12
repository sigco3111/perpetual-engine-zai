/** 감지된 기술 스택 */
export interface DetectedTechStack {
    /** 주요 언어 */
    languages: string[];
    /** 프레임워크/라이브러리 */
    frameworks: string[];
    /** 백엔드/인프라 */
    backend: string[];
    /** 데이터베이스 */
    databases: string[];
    /** 빌드/패키지 도구 */
    buildTools: string[];
    /** 플랫폼 (web, ios, android, desktop 등) */
    platforms: string[];
    /** 배포 타겟 */
    deployTargets: string[];
    /** 모노레포 여부 */
    isMonorepo: boolean;
}
export declare function detectTechStack(projectRoot: string): Promise<DetectedTechStack>;
//# sourceMappingURL=tech-stack-detector.d.ts.map