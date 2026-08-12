import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { TmuxNotFoundError } from '../../utils/errors.js';
const execFileAsync = promisify(execFile);
export class TmuxAdapter {
    sessionPrefix;
    constructor(sessionPrefix = 'ip') {
        this.sessionPrefix = sessionPrefix;
    }
    async checkInstalled() {
        try {
            await execFileAsync('tmux', ['-V']);
        }
        catch {
            throw new TmuxNotFoundError();
        }
    }
    async createSession(name, command) {
        const sessionName = this.prefixed(name);
        await execFileAsync('tmux', [
            'new-session', '-d',
            '-s', sessionName,
            '-x', '200', '-y', '50',
            command,
        ]);
    }
    async killSession(name) {
        const sessionName = this.prefixed(name);
        try {
            await execFileAsync('tmux', ['kill-session', '-t', sessionName]);
        }
        catch {
            // 이미 종료된 세션 무시
        }
    }
    async killAllSessions() {
        const sessions = await this.listSessions();
        for (const session of sessions) {
            try {
                await execFileAsync('tmux', ['kill-session', '-t', session]);
            }
            catch {
                // 무시
            }
        }
    }
    async listSessions() {
        try {
            const { stdout } = await execFileAsync('tmux', [
                'list-sessions', '-F', '#{session_name}',
            ]);
            return stdout
                .trim()
                .split('\n')
                .filter(s => s.startsWith(this.sessionPrefix + '-'));
        }
        catch {
            return [];
        }
    }
    async hasSession(name) {
        const sessionName = this.prefixed(name);
        try {
            await execFileAsync('tmux', ['has-session', '-t', sessionName]);
            return true;
        }
        catch {
            return false;
        }
    }
    async sendKeys(name, keys) {
        const sessionName = this.prefixed(name);
        await execFileAsync('tmux', ['send-keys', '-t', sessionName, keys, 'Enter']);
    }
    async capturePane(name, lines = 100) {
        const sessionName = this.prefixed(name);
        try {
            const { stdout } = await execFileAsync('tmux', [
                'capture-pane', '-t', sessionName, '-p', '-S', `-${lines}`,
            ]);
            return stdout;
        }
        catch {
            return '';
        }
    }
    prefixed(name) {
        return `${this.sessionPrefix}-${name}`;
    }
}
//# sourceMappingURL=tmux-adapter.js.map