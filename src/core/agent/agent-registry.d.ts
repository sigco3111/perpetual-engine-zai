import type { AgentConfig } from './agent-types.js';
export declare class AgentRegistry {
    private agentsDir;
    private agents;
    /** 임시(에페메럴) 에이전트 — 자문 등 일회성 에이전트용 */
    private ephemeralAgents;
    constructor(agentsDir: string);
    load(): Promise<void>;
    get(role: string): AgentConfig | undefined;
    getAll(): AgentConfig[];
    /** 상시 에이전트 역할 목록 (에페메럴 제외) */
    getRoles(): string[];
    /** 에페메럴 에이전트 포함 전체 역할 목록 */
    getAllRoles(): string[];
    has(role: string): boolean;
    /**
     * 임시 에이전트 등록.
     * 자문 전문가 등 일회성 에이전트를 고유 ID로 등록한다.
     * 기존 상시 에이전트와 키가 충돌하지 않도록 고유 ID를 사용해야 한다.
     */
    registerEphemeral(id: string, config: AgentConfig): void;
    /**
     * 임시 에이전트 해제(소멸).
     * 목적 완수 후 호출하여 레지스트리에서 제거한다.
     */
    unregisterEphemeral(id: string): boolean;
    /** 현재 등록된 에페메럴 에이전트 목록 */
    getEphemeralAgents(): Array<{
        id: string;
        config: AgentConfig;
    }>;
    /** 에페메럴 에이전트 존재 여부 */
    hasEphemeral(id: string): boolean;
}
//# sourceMappingURL=agent-registry.d.ts.map