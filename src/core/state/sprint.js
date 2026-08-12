import { FileStore } from './file-store.js';
export class SprintManager {
    store;
    constructor(sprintsPath) {
        this.store = new FileStore(sprintsPath);
    }
    async createSprint(name) {
        let newSprint;
        await this.store.update(store => {
            const id = `sprint-${store.sprints.length + 1}`;
            newSprint = {
                id,
                name,
                status: 'planning',
                tasks: [],
                started_at: null,
                completed_at: null,
                created_at: new Date().toISOString(),
            };
            return {
                sprints: [...store.sprints, newSprint],
                current_sprint: store.current_sprint,
            };
        });
        return newSprint;
    }
    async startSprint(sprintId) {
        let updated;
        await this.store.update(store => {
            const sprints = store.sprints.map(s => {
                if (s.id === sprintId) {
                    updated = { ...s, status: 'active', started_at: new Date().toISOString() };
                    return updated;
                }
                return s;
            });
            return { sprints, current_sprint: sprintId };
        });
        if (!updated)
            throw new Error(`스프린트를 찾을 수 없습니다: ${sprintId}`);
        return updated;
    }
    async completeSprint(sprintId) {
        let updated;
        await this.store.update(store => {
            const sprints = store.sprints.map(s => {
                if (s.id === sprintId) {
                    updated = { ...s, status: 'completed', completed_at: new Date().toISOString() };
                    return updated;
                }
                return s;
            });
            const current = store.current_sprint === sprintId ? null : store.current_sprint;
            return { sprints, current_sprint: current };
        });
        if (!updated)
            throw new Error(`스프린트를 찾을 수 없습니다: ${sprintId}`);
        return updated;
    }
    async addTaskToSprint(sprintId, taskId) {
        await this.store.update(store => {
            const sprints = store.sprints.map(s => {
                if (s.id === sprintId && !s.tasks.includes(taskId)) {
                    return { ...s, tasks: [...s.tasks, taskId] };
                }
                return s;
            });
            return { ...store, sprints };
        });
    }
    async getCurrentSprint() {
        const store = await this.store.read();
        if (!store.current_sprint)
            return null;
        return store.sprints.find(s => s.id === store.current_sprint) ?? null;
    }
    async getAllSprints() {
        const store = await this.store.read();
        return store.sprints;
    }
    async getSprintStore() {
        return this.store.read();
    }
}
//# sourceMappingURL=sprint.js.map