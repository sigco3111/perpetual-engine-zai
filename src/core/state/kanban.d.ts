import type { KanbanBoard, Task, TaskStatus, TaskPriority, TaskType, WorkflowPhase } from './types.js';
export declare class KanbanManager {
    private store;
    constructor(kanbanPath: string);
    addTask(params: {
        title: string;
        description: string;
        type: TaskType;
        priority: TaskPriority;
        assignee: string;
        created_by: string;
        sprint?: string;
        dependencies?: string[];
        acceptance_criteria?: string[];
        created_in_meeting?: string;
    }): Promise<Task>;
    moveTask(taskId: string, status: TaskStatus): Promise<Task>;
    updateTaskPhase(taskId: string, phase: WorkflowPhase, assignee?: string): Promise<Task>;
    /**
     * 태스크를 강제로 in_progress로 이동시킨다.
     * 의존성과 현재 상태를 무시하고 즉시 실행 대기 상태로 만든다.
     */
    forceStart(taskId: string): Promise<Task>;
    /**
     * 태스크를 일시 중단(suspended) 상태로 전환한다.
     * 현재 상태를 suspended_from에 저장하여 나중에 복원할 수 있다.
     */
    suspendTask(taskId: string, reason?: string): Promise<Task>;
    /**
     * 중단된 태스크를 이전 상태로 복원한다.
     */
    resumeTask(taskId: string): Promise<Task>;
    getTask(taskId: string): Promise<Task | null>;
    getTasks(filter?: {
        status?: TaskStatus;
        assignee?: string;
        sprint?: string;
        priority?: TaskPriority;
    }): Promise<Task[]>;
    getAllTasks(): Promise<Task[]>;
    getBoard(): Promise<KanbanBoard>;
    /**
     * 에이전트가 숫자 id를 쓸 수 있으므로, 읽을 때 문자열로 정규화
     */
    private normalize;
}
//# sourceMappingURL=kanban.d.ts.map