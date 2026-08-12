import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
/** 도메인 키워드 감지 패턴 */
const DOMAIN_PATTERNS = {
    'e-commerce': /(?:상품|주문|결제|장바구니|product|order|payment|cart|checkout)/i,
    'fintech': /(?:금융|결제|은행|투자|핀테크|payment|banking|invest|fintech)/i,
    'healthcare': /(?:건강|의료|헬스|환자|진료|health|medical|patient|clinic)/i,
    'fitness': /(?:운동|피트니스|체육|트레이닝|fitness|workout|exercise|gym)/i,
    'education': /(?:교육|학습|강의|수업|education|learning|course|lecture)/i,
    'social': /(?:소셜|커뮤니티|채팅|피드|social|community|chat|feed|message)/i,
    'saas': /(?:SaaS|대시보드|analytics|구독|subscription|dashboard|tenant)/i,
    'ai-ml': /(?:AI|ML|모델|인공지능|machine.?learning|neural|LLM|GPT|Claude)/i,
    'gaming': /(?:게임|플레이어|스코어|game|player|score|level)/i,
    'media': /(?:미디어|콘텐츠|영상|스트리밍|media|content|video|streaming)/i,
    'logistics': /(?:물류|배송|배달|택배|logistics|delivery|shipping)/i,
    'travel': /(?:여행|숙박|호텔|예약|travel|hotel|booking|reservation)/i,
};
/** 워크플로우 키워드 패턴 */
const WORKFLOW_PATTERNS = {
    'scrum': /(?:스크럼|스프린트|scrum|sprint|backlog|standup)/i,
    'kanban': /(?:칸반|kanban|board|workflow)/i,
    'agile': /(?:애자일|agile|iteration|retrospective)/i,
    'ci-cd': /(?:CI\/CD|continuous|pipeline|deploy|배포)/i,
    'code-review': /(?:코드.?리뷰|code.?review|PR.?review|pull.?request)/i,
    'testing': /(?:테스트|QA|quality|testing|coverage|E2E)/i,
    'design-system': /(?:디자인.?시스템|design.?system|컴포넌트|component.?library)/i,
};
export async function detectDocs(projectRoot) {
    const result = {
        projectDescription: '',
        docCategories: [],
        workflowKeywords: [],
        domainKeywords: [],
        hasContribGuide: false,
        hasApiDocs: false,
        hasDesignDocs: false,
        hasQaDocs: false,
        hasBusinessDocs: false,
    };
    // 1. README 파싱
    const readmeContent = await readReadme(projectRoot);
    if (readmeContent) {
        result.projectDescription = extractDescription(readmeContent);
        detectKeywords(readmeContent, result);
    }
    // 2. docs/ 디렉토리 구조 스캔
    await scanDocsDirectory(projectRoot, result);
    // 3. CLAUDE.md 파싱 (에이전트 이외의 메타데이터)
    const claudeMd = await readFileSafe(path.join(projectRoot, 'CLAUDE.md'));
    if (claudeMd) {
        detectKeywords(claudeMd, result);
    }
    // 4. CONTRIBUTING, API docs 등 특수 파일 확인
    const specialFiles = [
        [['CONTRIBUTING.md', 'CONTRIBUTING', '.github/CONTRIBUTING.md'], 'hasContribGuide'],
        [['docs/api', 'api-docs', 'swagger.json', 'openapi.yaml', 'openapi.json'], 'hasApiDocs'],
        [['docs/design', 'design', '.figma'], 'hasDesignDocs'],
        [['docs/qa', 'tests', '__tests__', 'e2e', 'cypress', 'playwright.config.ts'], 'hasQaDocs'],
        [['docs/business', 'docs/marketing', 'docs/backlog', 'docs/specs'], 'hasBusinessDocs'],
    ];
    for (const [files, key] of specialFiles) {
        for (const file of files) {
            if (existsSync(path.join(projectRoot, file))) {
                result[key] = true;
                break;
            }
        }
    }
    return result;
}
/** README 파일 읽기 */
async function readReadme(root) {
    const candidates = ['README.md', 'readme.md', 'README', 'README.rst'];
    for (const file of candidates) {
        const content = await readFileSafe(path.join(root, file));
        if (content)
            return content;
    }
    return null;
}
/** README에서 프로젝트 설명 추출 */
function extractDescription(readme) {
    const lines = readme.split('\n');
    const descLines = [];
    let foundTitle = false;
    for (const line of lines) {
        if (!foundTitle && line.startsWith('#')) {
            foundTitle = true;
            continue;
        }
        if (foundTitle) {
            if (line.trim() === '') {
                if (descLines.length > 0)
                    break;
                continue;
            }
            if (line.startsWith('#') || line.startsWith('```'))
                break;
            descLines.push(line.trim());
            if (descLines.length >= 3)
                break;
        }
    }
    return descLines.join(' ').slice(0, 300);
}
/** 텍스트에서 도메인/워크플로우 키워드 감지 */
function detectKeywords(text, result) {
    for (const [keyword, pattern] of Object.entries(DOMAIN_PATTERNS)) {
        if (pattern.test(text) && !result.domainKeywords.includes(keyword)) {
            result.domainKeywords.push(keyword);
        }
    }
    for (const [keyword, pattern] of Object.entries(WORKFLOW_PATTERNS)) {
        if (pattern.test(text) && !result.workflowKeywords.includes(keyword)) {
            result.workflowKeywords.push(keyword);
        }
    }
}
/** docs/ 디렉토리 구조 스캔 */
async function scanDocsDirectory(root, result) {
    const docsDir = path.join(root, 'docs');
    if (!existsSync(docsDir))
        return;
    try {
        const entries = await readdir(docsDir);
        for (const entry of entries) {
            const entryPath = path.join(docsDir, entry);
            const st = await stat(entryPath);
            if (st.isDirectory()) {
                result.docCategories.push(entry);
            }
            else if (entry.endsWith('.md')) {
                // 파일명에서 카테고리 추론
                const name = entry.replace('.md', '').toLowerCase();
                if (!result.docCategories.includes(name)) {
                    result.docCategories.push(name);
                }
                // 파일 내용에서 키워드 감지 (작은 파일만)
                if (st.size < 50000) {
                    const content = await readFileSafe(entryPath);
                    if (content)
                        detectKeywords(content, result);
                }
            }
        }
    }
    catch { /* ignore */ }
}
async function readFileSafe(filePath) {
    try {
        if (!existsSync(filePath))
            return null;
        const st = await stat(filePath);
        if (!st.isFile())
            return null;
        return await readFile(filePath, 'utf-8');
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=docs-detector.js.map