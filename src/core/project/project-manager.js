import { existsSync } from 'node:fs';
import path from 'node:path';
import { scaffoldProject } from './scaffold.js';
import { loadConfig, saveConfig } from './config.js';
import { getProjectPaths } from '../../utils/paths.js';
import { ProjectNotFoundError } from '../../utils/errors.js';
export class ProjectManager {
    projectRoot;
    constructor(projectRoot) {
        this.projectRoot = path.resolve(projectRoot);
    }
    get paths() {
        return getProjectPaths(this.projectRoot);
    }
    async init(projectName, options) {
        await scaffoldProject(this.projectRoot, projectName, options);
    }
    async loadConfig() {
        this.ensureProject();
        return loadConfig(this.paths.config);
    }
    async saveConfig(config) {
        this.ensureProject();
        await saveConfig(this.paths.config, config);
    }
    exists() {
        return existsSync(this.paths.infinitePower);
    }
    ensureProject() {
        if (!this.exists()) {
            throw new ProjectNotFoundError(this.projectRoot);
        }
    }
}
//# sourceMappingURL=project-manager.js.map