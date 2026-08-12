export declare class FileStore<T> {
    private filePath;
    private lockPath;
    private absKey;
    constructor(filePath: string);
    read(): Promise<T>;
    write(data: T): Promise<void>;
    update(updater: (data: T) => T): Promise<T>;
    private atomicWrite;
    private acquireLock;
    private releaseLock;
}
//# sourceMappingURL=file-store.d.ts.map