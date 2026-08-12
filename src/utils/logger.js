import chalk from 'chalk';
export const logger = {
    info(message) {
        console.log(chalk.blue('ℹ'), message);
    },
    success(message) {
        console.log(chalk.green('✓'), message);
    },
    warn(message) {
        console.log(chalk.yellow('⚠'), message);
    },
    error(message) {
        console.error(chalk.red('✗'), message);
    },
    step(message) {
        console.log(chalk.cyan('→'), message);
    },
    dim(message) {
        console.log(chalk.dim(message));
    },
};
//# sourceMappingURL=logger.js.map