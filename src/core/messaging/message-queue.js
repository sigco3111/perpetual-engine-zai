import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { nanoid } from 'nanoid';
export class MessageQueue {
    messagesDir;
    constructor(messagesDir) {
        this.messagesDir = messagesDir;
    }
    async send(params) {
        await mkdir(this.messagesDir, { recursive: true });
        const message = {
            id: nanoid(),
            from: params.from,
            to: params.to,
            type: params.type,
            content: params.content,
            read: false,
            created_at: new Date().toISOString(),
        };
        const filename = `${params.from}-${Date.now()}.json`;
        await writeFile(path.join(this.messagesDir, filename), JSON.stringify(message, null, 2), 'utf-8');
        return message;
    }
    async getUnread(recipient) {
        const messages = await this.getAll();
        return messages.filter(m => !m.read && (m.to === recipient || m.to === 'all'));
    }
    async getAll() {
        if (!existsSync(this.messagesDir))
            return [];
        const files = await readdir(this.messagesDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        const messages = [];
        for (const file of jsonFiles) {
            try {
                const content = await readFile(path.join(this.messagesDir, file), 'utf-8');
                messages.push(JSON.parse(content));
            }
            catch {
                // 파싱 실패한 파일 무시
            }
        }
        return messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    async markAsRead(messageId) {
        const files = await readdir(this.messagesDir);
        for (const file of files.filter(f => f.endsWith('.json'))) {
            const filePath = path.join(this.messagesDir, file);
            try {
                const content = await readFile(filePath, 'utf-8');
                const msg = JSON.parse(content);
                if (msg.id === messageId) {
                    msg.read = true;
                    await writeFile(filePath, JSON.stringify(msg, null, 2), 'utf-8');
                    return;
                }
            }
            catch {
                // 무시
            }
        }
    }
}
//# sourceMappingURL=message-queue.js.map