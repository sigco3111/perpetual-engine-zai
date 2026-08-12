export declare class DocumentLock {
    private lockPath;
    constructor(documentPath: string);
    acquire(owner: string, retries?: number, delay?: number): Promise<boolean>;
    release(): Promise<void>;
    isLocked(): boolean;
}
//# sourceMappingURL=document-lock.d.ts.map