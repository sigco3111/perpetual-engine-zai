import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { readYaml } from '../../utils/yaml.js';
export class AgentRegistry {
    agentsDir;
    agents = new Map();
    /** 임시(에페메럴) 에이전트 — 자문 등 일회성 에이전트용 */
    ephemeralAgents = new Map();
    constructor(agentsDir) {
        this.agentsDir = agentsDir;
    }
    async load() {
        this.agents.clear();
        const files = await readdir(this.agentsDir);
        const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
        for (const file of yamlFiles) {
            const filePath = path.join(this.agentsDir, file);
            const config = await readYaml(filePath);
            this.agents.set(config.role, config);
        }
    }
    get(role) {
        return this.agents.get(role) ?? this.ephemeralAgents.get(role);
    }
    getAll() {
        return [
            ...Array.from(this.agents.values()),
            ...Array.from(this.ephemeralAgents.values()),
        ];
    }
    /** 상시 에이전트 역할 목록 (에페메럴 제외) */
    getRoles() {
        return Array.from(this.agents.keys());
    }
    /** 에페메럴 에이전트 포함 전체 역할 목록 */
    getAllRoles() {
        return [...this.agents.keys(), ...this.ephemeralAgents.keys()];
    }
    has(role) {
        return this.agents.has(role) || this.ephemeralAgents.has(role);
    }
    /**
     * 임시 에이전트 등록.
     * 자문 전문가 등 일회성 에이전트를 고유 ID로 등록한다.
     * 기존 상시 에이전트와 키가 충돌하지 않도록 고유 ID를 사용해야 한다.
     */
    registerEphemeral(id, config) {
        this.ephemeralAgents.set(id, config);
    }
    /**
     * 임시 에이전트 해제(소멸).
     * 목적 완수 후 호출하여 레지스트리에서 제거한다.
     */
    unregisterEphemeral(id) {
        return this.ephemeralAgents.delete(id);
    }
    /** 현재 등록된 에페메럴 에이전트 목록 */
    getEphemeralAgents() {
        return Array.from(this.ephemeralAgents.entries()).map(([id, config]) => ({ id, config }));
    }
    /** 에페메럴 에이전트 존재 여부 */
    hasEphemeral(id) {
        return this.ephemeralAgents.has(id);
    }
}
//# sourceMappingURL=agent-registry.js.map