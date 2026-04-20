import { Command } from 'commander';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ProjectManager } from '../../core/project/project-manager.js';
import { runSetupPrompts, runProviderSetupPrompts } from '../utils/prompts.js';
import type { ProviderChoice } from '../utils/prompts.js';
import { logger } from '../../utils/logger.js';
import { getProjectPaths } from '../../utils/paths.js';

export function registerSetupCommand(program: Command): void {
  program
    .command('setup')
    .description('대화형 초기 설정 (회사 비전 및 프로덕트 설정)')
    .action(async () => {
      const projectRoot = process.cwd();
      const manager = new ProjectManager(projectRoot);

      if (!manager.exists()) {
        logger.error('PerpetualEngine 프로젝트가 아닙니다. 먼저 perpetual-engine init <name> 으로 프로젝트를 생성하세요.');
        process.exit(1);
      }

      logger.info('회사 및 프로덕트 설정을 시작합니다...\n');

      const answers = await runSetupPrompts();
      const config = await manager.loadConfig();

      // config 업데이트
      config.localization.language = answers.language;
      config.localization.language_name = answers.languageName;
      config.company.name = answers.companyName;
      config.company.mission = answers.companyMission;
      config.product.name = answers.productName;
      config.product.description = answers.productDescription;
      config.product.target_users = answers.targetUsers;
      config.product.core_value = answers.coreValue;
      config.constraints.tech_stack_preference = answers.techStackPreference;
      config.constraints.deploy_target = answers.deployTarget;

      await manager.saveConfig(config);

      const providerAnswers = await runProviderSetupPrompts();
      const choice: ProviderChoice = providerAnswers.providerChoice ?? (providerAnswers.useZaiProvider ? 'zai-api' : 'claude-code');

      const baseUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

      if (choice === 'claude-code') {
        config.default_provider = 'claude-code';
        logger.info('Claude Code CLI를 사용합니다.');
      } else if (choice === 'opencode') {
        config.default_provider = 'opencode-glm47';
        const headers: Record<string, string> = {};
        config.providers = {
          'opencode-glm51': {
            type: 'opencode' as const,
            binary: 'opencode',
            api: { model: 'zai-coding-plan/glm-5.1', headers },
            maxConcurrency: 1,
          },
          'opencode-glm47': {
            type: 'opencode' as const,
            binary: 'opencode',
            api: { model: 'zai-coding-plan/glm-4.7', headers },
            maxConcurrency: 2,
          },
          'opencode-glm46v': {
            type: 'opencode' as const,
            binary: 'opencode',
            api: { model: 'zai-coding-plan/glm-4.6v', headers },
            maxConcurrency: 2,
          },
          'opencode-glm46': {
            type: 'opencode' as const,
            binary: 'opencode',
            api: { model: 'zai-coding-plan/glm-4.6', headers },
            maxConcurrency: 3,
          },
        };
        config.agent_providers = {
          mapping: {
            cto: 'opencode-glm51',
            ceo: 'opencode-glm47',
            po: 'opencode-glm47',
            designer: 'opencode-glm46v',
            qa: 'opencode-glm46',
            marketer: 'opencode-glm46',
          },
          overrides: {},
        };
        logger.success('OpenCode (GLM 모델 분산) 설정이 완료되었습니다!');
      } else if (choice === 'zai-api') {
        config.default_provider = 'zai-general';
        config.providers = {
          'zai-coding': {
            type: 'http-api',
            api: { baseUrl, apiKey: providerAnswers.apiKey, model: providerAnswers.codingModel ?? 'glm-5-turbo', headers: {} },
            maxConcurrency: 1,
          },
          'zai-general': {
            type: 'http-api',
            api: { baseUrl, apiKey: providerAnswers.apiKey, model: providerAnswers.generalModel ?? 'glm-4.5', headers: {} },
            maxConcurrency: 10,
          },
        };
        config.agent_providers = {
          mapping: { cto: 'zai-coding', ceo: 'zai-general', po: 'zai-general', designer: 'zai-general', qa: 'zai-general', marketer: 'zai-general' },
          overrides: {},
        };
        config.concurrency = {
          defaults: {},
          rules: [
            { model: 'glm-5-turbo', limit: 1 },
            { model: 'glm-5', limit: 2 },
            { model: 'glm-5\\.1', limit: 1 },
            { model: 'glm-4\\.5$', limit: 10 },
            { model: 'glm-4-plus', limit: 20 },
          ],
        };
        logger.success('ZAI GLM API 설정이 완료되었습니다!');
      } else if (choice === 'mixed-opencode-zai') {
        config.default_provider = 'zai-general';
        config.providers = {
          opencode: { type: 'opencode', binary: 'opencode', maxConcurrency: 1 },
          'zai-coding': {
            type: 'http-api',
            api: { baseUrl, apiKey: providerAnswers.apiKey, model: providerAnswers.codingModel ?? 'glm-5-turbo', headers: {} },
            maxConcurrency: 1,
          },
          'zai-general': {
            type: 'http-api',
            api: { baseUrl, apiKey: providerAnswers.apiKey, model: providerAnswers.generalModel ?? 'glm-4.5', headers: {} },
            maxConcurrency: 10,
          },
        };
        config.agent_providers = {
          mapping: { cto: 'opencode', ceo: 'zai-general', po: 'zai-general', designer: 'zai-general', qa: 'zai-general', marketer: 'zai-general' },
          overrides: {},
        };
        config.concurrency = {
          defaults: {},
          rules: [
            { model: 'glm-5-turbo', limit: 1 },
            { model: 'glm-4\\.5$', limit: 10 },
          ],
        };
        logger.success('OpenCode + ZAI 혼합 설정이 완료되었습니다!');
      } else if (choice === 'mixed-claude-zai') {
        config.default_provider = 'zai-general';
        config.providers = {
          claude: { type: 'claude-code', maxConcurrency: 1 },
          'zai-general': {
            type: 'http-api',
            api: { baseUrl, apiKey: providerAnswers.apiKey, model: providerAnswers.generalModel ?? 'glm-4.5', headers: {} },
            maxConcurrency: 10,
          },
        };
        config.agent_providers = {
          mapping: { cto: 'claude', ceo: 'zai-general', po: 'zai-general', designer: 'zai-general', qa: 'zai-general', marketer: 'zai-general' },
          overrides: {},
        };
        config.concurrency = {
          defaults: {},
          rules: [
            { model: 'glm-4\\.5$', limit: 10 },
          ],
        };
        logger.success('Claude Code + ZAI 혼합 설정이 완료되었습니다!');
      }

      await manager.saveConfig(config);

      // vision 문서 생성
      const paths = getProjectPaths(projectRoot);

      await writeFile(
        path.join(paths.vision, 'company-goal.md'),
        `# ${answers.companyName} - 회사 목표\n\n## 미션\n${answers.companyMission}\n\n## 핵심 가치\n${answers.coreValue}\n\n---\n*이 문서는 모든 에이전트의 의사결정 기준이 됩니다.*\n`,
        'utf-8',
      );

      await writeFile(
        path.join(paths.vision, 'product-vision.md'),
        `# ${answers.productName} - 프로덕트 비전\n\n## 개요\n${answers.productDescription}\n\n## 타겟 사용자\n${answers.targetUsers}\n\n## 핵심 가치\n${answers.coreValue}\n\n## 기술 스택\n- 선호: ${answers.techStackPreference}\n- 배포: ${answers.deployTarget}\n\n---\n*이 문서는 PO와 CTO의 기획/개발 기준이 됩니다.*\n`,
        'utf-8',
      );

      logger.success('설정이 완료되었습니다!');
      logger.step('다음 단계:');
      logger.dim('  perpetual-engine start    # 에이전트 팀 가동 + 대시보드');
    });
}
