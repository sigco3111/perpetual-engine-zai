import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { getProjectPaths } from '../../utils/paths.js';
export class MeetingCoordinator {
    projectRoot;
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
    }
    async createAgenda(params) {
        const agenda = {
            id: nanoid(),
            type: params.type,
            title: params.title,
            participants: params.participants,
            topics: params.topics,
            created_at: new Date().toISOString(),
        };
        return agenda;
    }
    async saveMinutes(minutes) {
        const paths = getProjectPaths(this.projectRoot);
        await mkdir(paths.meetings, { recursive: true });
        const date = new Date().toISOString().split('T')[0];
        const slug = minutes.title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-');
        const filename = `${date}-${slug}.md`;
        const filePath = path.join(paths.meetings, filename);
        const markdown = this.formatMinutesAsMarkdown(minutes);
        await writeFile(filePath, markdown, 'utf-8');
        return filePath;
    }
    async saveDecision(decision) {
        const paths = getProjectPaths(this.projectRoot);
        await mkdir(paths.decisions, { recursive: true });
        const date = new Date().toISOString().split('T')[0];
        const slug = decision.title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-');
        const filename = `${date}-${slug}.md`;
        const filePath = path.join(paths.decisions, filename);
        const markdown = `# 의사결정: ${decision.title}

- **일시**: ${date}
- **결정자**: ${decision.decided_by}
- **회의**: ${decision.meeting_id}

## 배경
${decision.context}

## 결정
${decision.decision}

## 근거
${decision.reasoning}
`;
        await writeFile(filePath, markdown, 'utf-8');
        return filePath;
    }
    formatMinutesAsMarkdown(minutes) {
        let md = `# ${minutes.title}

- **일시**: ${minutes.date}
- **유형**: ${minutes.type}
- **참여자**: ${minutes.participants.join(', ')}

## 논의 내용
`;
        for (const disc of minutes.discussions) {
            md += `\n### ${disc.speaker}:\n${disc.content}\n`;
        }
        if (minutes.decisions.length > 0) {
            md += `\n## 결정사항\n`;
            for (const d of minutes.decisions) {
                md += `- ${d}\n`;
            }
        }
        if (minutes.action_items.length > 0) {
            md += `\n## 액션 아이템\n`;
            for (const item of minutes.action_items) {
                const taskRef = item.task_id ? ` [${item.task_id}]` : '';
                md += `- ${item.assignee}: ${item.description}${taskRef}\n`;
            }
        }
        return md;
    }
}
//# sourceMappingURL=meeting.js.map