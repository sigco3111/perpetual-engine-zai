export type Device = 'mobile' | 'tablet' | 'desktop' | 'slide' | string;
/**
 * 피처 폴더의 meta.json 스키마.
 *
 * 기본(짧은) 형태: 한 피처 1개 화면
 *   { "name","feature","screen","device","title", ... }
 *
 * 확장 형태: 한 피처에 여러 화면 (mobile/tablet/desktop 등)
 *   { "feature":"login", "title":"로그인", "screens": { "mobile.html": { "device":"mobile", ... }, "desktop.html": { ... } } }
 *
 * 파일이 여러 개인데 `screens` 가 없으면, 파일명으로 device 를 추론하고
 * feature/title 등은 피처 레벨 공통으로 사용한다.
 */
export interface MockupMeta {
    name?: string;
    feature?: string;
    screen?: string;
    device?: Device;
    title?: string;
    description?: string;
    flow?: string[];
    tokensUsed?: string[];
    componentsUsed?: string[];
    screens?: Record<string, Partial<Omit<MockupMeta, 'screens'>>>;
}
export interface MockupEntry {
    /** 캔버스 고유 id: `<feature>-<screenName>` */
    id: string;
    feature: string;
    screen: string;
    device: Device;
    name?: string;
    title?: string;
    description?: string;
    flow?: string[];
    tokensUsed?: string[];
    componentsUsed?: string[];
    /** `/design-assets/...` 로 서빙 가능한 HTML 상대 경로 */
    htmlPath: string;
    /** meta.json 상대 경로 */
    metaPath: string;
    /** HTML 파일 마지막 수정 시각 ISO */
    modified: string;
}
/**
 * docs/design/mockups/<feature>/ 하위를 스캔하여 목업 엔트리들을 반환.
 *
 * 규약:
 *  - 피처 폴더 1개 = 여러 화면 가능 (mobile.html + tablet.html + desktop.html 등)
 *  - meta.json 필수 — 없으면 해당 폴더 skip (Design Canvas 에서 사라짐)
 *  - meta.json 의 `screens` 필드로 파일별 메타를 세밀히 지정 가능; 없으면 파일명으로 device 추론
 */
export declare function scanMockups(mockupsRoot: string): Promise<MockupEntry[]>;
//# sourceMappingURL=mockup-scanner.d.ts.map