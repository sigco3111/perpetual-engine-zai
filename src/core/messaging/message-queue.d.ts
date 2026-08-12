export interface Message {
    id: string;
    from: string;
    to: string;
    type: 'info' | 'request' | 'meeting_invite' | 'review_request' | 'directive' | 'consultation_request';
    content: string;
    read: boolean;
    created_at: string;
}
export declare class MessageQueue {
    private messagesDir;
    constructor(messagesDir: string);
    send(params: {
        from: string;
        to: string;
        type: Message['type'];
        content: string;
    }): Promise<Message>;
    getUnread(recipient: string): Promise<Message[]>;
    getAll(): Promise<Message[]>;
    markAsRead(messageId: string): Promise<void>;
}
//# sourceMappingURL=message-queue.d.ts.map