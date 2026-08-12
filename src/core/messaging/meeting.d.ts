export type MeetingType = 'sprint_planning' | 'backlog_grooming' | 'tech_design_review' | 'design_review' | 'deployment' | 'marketing_strategy' | 'emergency' | 'retrospective' | 'issue_discussion' | 'consultation';
export interface MeetingAgenda {
    id: string;
    type: MeetingType;
    title: string;
    /** 회의 참여 에��전트 역할 목록 (복수) */
    participants: string[];
    topics: string[];
    /** 연관 태스크/이슈 ID (있을 경우) */
    related_task_ids?: string[];
    /** 자문 에이전트가 참여하는 경우 해당 ID 목록 */
    consultant_ids?: string[];
    created_at: string;
}
export interface MeetingMinutes {
    id: string;
    agenda_id: string;
    type: MeetingType;
    title: string;
    date: string;
    participants: string[];
    /** 자문 전문가 참여자 (있을 경우) */
    consultants?: Array<{
        id: string;
        domain: string;
        name: string;
    }>;
    discussions: Array<{
        speaker: string;
        content: string;
    }>;
    decisions: string[];
    action_items: Array<{
        task_id?: string;
        assignee: string;
        description: string;
    }>;
}
export declare class MeetingCoordinator {
    private projectRoot;
    constructor(projectRoot: string);
    createAgenda(params: {
        type: MeetingType;
        title: string;
        participants: string[];
        topics: string[];
    }): Promise<MeetingAgenda>;
    saveMinutes(minutes: MeetingMinutes): Promise<string>;
    saveDecision(decision: {
        title: string;
        context: string;
        decision: string;
        reasoning: string;
        decided_by: string;
        meeting_id: string;
    }): Promise<string>;
    private formatMinutesAsMarkdown;
}
//# sourceMappingURL=meeting.d.ts.map