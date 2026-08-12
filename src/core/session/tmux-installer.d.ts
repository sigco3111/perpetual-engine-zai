export interface TmuxInstallResult {
    /** 설치를 실제로 시도했는가 */
    attempted: boolean;
    /** 성공 여부 */
    succeeded: boolean;
    /** 사용한 방법 (brew 등) */
    method?: string;
    /** 사용자에게 보여줄 메시지 — 실패/스킵 사유 또는 다음 행동 안내 */
    message?: string;
}
/**
 * tmux 자동 설치 시도.
 *
 * - macOS: brew 가 있으면 `brew install tmux` 를 바로 실행 (sudo 불필요)
 * - Linux: sudo 가 필요하므로 자동 실행하지 않고, 감지된 패키지 매니저 기준
 *   수동 명령어를 안내
 * - 그 외 플랫폼: 수동 설치 안내
 */
export declare function tryAutoInstallTmux(platform?: NodeJS.Platform): Promise<TmuxInstallResult>;
//# sourceMappingURL=tmux-installer.d.ts.map