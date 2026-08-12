export declare class TmuxAdapter {
    private sessionPrefix;
    constructor(sessionPrefix?: string);
    checkInstalled(): Promise<void>;
    createSession(name: string, command: string): Promise<void>;
    killSession(name: string): Promise<void>;
    killAllSessions(): Promise<void>;
    listSessions(): Promise<string[]>;
    hasSession(name: string): Promise<boolean>;
    sendKeys(name: string, keys: string): Promise<void>;
    capturePane(name: string, lines?: number): Promise<string>;
    private prefixed;
}
//# sourceMappingURL=tmux-adapter.d.ts.map