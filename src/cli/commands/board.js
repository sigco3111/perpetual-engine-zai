import chalk from 'chalk';
import Table from 'cli-table3';
import { KanbanManager } from '../../core/state/kanban.js';
import { getProjectPaths, isPerpetualEngineProject } from '../../utils/paths.js';
import { logger } from '../../utils/logger.js';
const STATUS_COLUMNS = [
    { key: 'backlog', label: 'Backlog' },
    { key: 'todo', label: 'To Do' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'review', label: 'Review' },
    { key: 'testing', label: 'Testing' },
    { key: 'done', label: 'Done' },
];
const PRIORITY_COLORS = {
    critical: chalk.red,
    high: chalk.yellow,
    medium: chalk.white,
    low: chalk.dim,
};
function formatTask(task) {
    const colorFn = PRIORITY_COLORS[task.priority] || chalk.white;
    return colorFn(`[${task.id}] ${task.title}\n  ${chalk.dim(task.assignee)}`);
}
export function registerBoardCommand(program) {
    program
        .command('board')
        .description('칸반보드 (터미널)')
        .action(async () => {
        const projectRoot = process.cwd();
        if (!isPerpetualEngineProject(projectRoot)) {
            logger.error('PerpetualEngine 프로젝트가 아닙니다.');
            process.exit(1);
        }
        const paths = getProjectPaths(projectRoot);
        const kanban = new KanbanManager(paths.kanban);
        const tasks = await kanban.getAllTasks();
        const byStatus = {};
        for (const t of tasks) {
            if (!byStatus[t.status])
                byStatus[t.status] = [];
            byStatus[t.status].push(t);
        }
        const table = new Table({
            head: STATUS_COLUMNS.map(c => chalk.bold(c.label)),
            colWidths: STATUS_COLUMNS.map(() => 22),
            wordWrap: true,
        });
        // 최대 행 수
        const maxRows = Math.max(...STATUS_COLUMNS.map(c => (byStatus[c.key] || []).length), 1);
        for (let i = 0; i < maxRows; i++) {
            const row = STATUS_COLUMNS.map(c => {
                const statusTasks = byStatus[c.key] || [];
                return statusTasks[i] ? formatTask(statusTasks[i]) : '';
            });
            table.push(row);
        }
        console.log(`\n${chalk.bold('  Kanban Board')}\n`);
        console.log(table.toString());
        console.log('');
    });
}
//# sourceMappingURL=board.js.map