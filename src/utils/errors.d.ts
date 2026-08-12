export declare class PerpetualEngineError extends Error {
    constructor(message: string);
}
export declare class ProjectNotFoundError extends PerpetualEngineError {
    constructor(path: string);
}
export declare class ConfigError extends PerpetualEngineError {
    constructor(message: string);
}
export declare class TmuxNotFoundError extends PerpetualEngineError {
    constructor();
}
export declare class AgentError extends PerpetualEngineError {
    constructor(agent: string, message: string);
}
//# sourceMappingURL=errors.d.ts.map