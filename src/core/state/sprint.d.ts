import type { Sprint, SprintStore } from './types.js';
export declare class SprintManager {
    private store;
    constructor(sprintsPath: string);
    createSprint(name: string): Promise<Sprint>;
    startSprint(sprintId: string): Promise<Sprint>;
    completeSprint(sprintId: string): Promise<Sprint>;
    addTaskToSprint(sprintId: string, taskId: string): Promise<void>;
    getCurrentSprint(): Promise<Sprint | null>;
    getAllSprints(): Promise<Sprint[]>;
    getSprintStore(): Promise<SprintStore>;
}
//# sourceMappingURL=sprint.d.ts.map