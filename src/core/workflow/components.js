import { readFile } from 'node:fs/promises';
import path from 'node:path';
/**
 * 매니페스트 타입가드.
 *
 * CLAUDE.md 룰: 에이전트가 쓰는 JSON 은 읽는 쪽에서 가드한다 — 자유 형식으로 덮어써도
 * 워크플로우 엔진이 크래시하지 않도록 좁힌다.
 */
export function isComponentManifest(value) {
    if (!value || typeof value !== 'object')
        return false;
    const v = value;
    if (v.version !== 1)
        return false;
    if (typeof v.task_id !== 'string' || v.task_id.length === 0)
        return false;
    if (!isComponentTechStack(v.tech_stack))
        return false;
    if (!Array.isArray(v.components) || v.components.length === 0)
        return false;
    for (const c of v.components) {
        if (!isComponentSpec(c))
            return false;
    }
    // slug 중복 금지 — 컴포넌트 페이즈 이름 충돌을 방지
    const slugs = new Set();
    for (const c of v.components) {
        if (slugs.has(c.slug))
            return false;
        slugs.add(c.slug);
    }
    return true;
}
function isComponentTechStack(value) {
    if (!value || typeof value !== 'object')
        return false;
    const v = value;
    if (typeof v.framework !== 'string' || v.framework.length === 0)
        return false;
    const r = v.test_runners;
    if (!r || typeof r !== 'object')
        return false;
    for (const key of ['unit', 'ui', 'snapshot', 'integration', 'e2e']) {
        if (typeof r[key] !== 'string' || r[key].length === 0)
            return false;
    }
    return true;
}
function isComponentSpec(value) {
    if (!value || typeof value !== 'object')
        return false;
    const v = value;
    if (typeof v.name !== 'string' || v.name.length === 0)
        return false;
    if (typeof v.slug !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(v.slug))
        return false;
    if (typeof v.description !== 'string')
        return false;
    if (!Array.isArray(v.implementation_paths) || v.implementation_paths.length === 0)
        return false;
    if (!v.implementation_paths.every(p => typeof p === 'string' && p.length > 0))
        return false;
    const t = v.test_paths;
    if (!t || typeof t !== 'object')
        return false;
    for (const key of ['unit', 'ui', 'snapshot', 'integration', 'e2e']) {
        if (typeof t[key] !== 'string' || t[key].length === 0)
            return false;
    }
    if (v.dependencies !== undefined) {
        if (!Array.isArray(v.dependencies))
            return false;
        if (!v.dependencies.every(d => typeof d === 'string'))
            return false;
    }
    return true;
}
/**
 * 매니페스트 파일 경로. development-plan 페이즈가 이 경로에 정확히 작성해야 한다.
 */
export function manifestPath(taskSlug) {
    return `docs/development/feature-${taskSlug}/components.json`;
}
/**
 * 기술 스택 문서 경로. CTO 가 사람용 설명을 작성한다.
 */
export function techStackDocPath(taskSlug) {
    return `docs/development/feature-${taskSlug}/tech-stack.md`;
}
/**
 * `development-component` 페이즈의 모든 산출 경로 (구현 + 5종 테스트).
 * Phase.outputDocPaths 가 이 경로들을 그대로 반환한다.
 */
export function componentExpectedOutputs(spec) {
    return [
        ...spec.implementation_paths,
        spec.test_paths.unit,
        spec.test_paths.ui,
        spec.test_paths.snapshot,
        spec.test_paths.integration,
        spec.test_paths.e2e,
    ];
}
/**
 * 매니페스트를 디스크에서 읽고 가드를 통과하면 반환. 실패 시 null.
 *
 * 의도적으로 throw 하지 않는다 — 호출자가 "있으면 컴포넌트 펼침, 없으면 development-plan 재시도"
 * 분기를 깔끔히 쓸 수 있도록.
 */
export async function readComponentManifest(projectRoot, taskSlug) {
    const fullPath = path.join(projectRoot, manifestPath(taskSlug));
    let raw;
    try {
        raw = await readFile(fullPath, 'utf-8');
    }
    catch {
        return null;
    }
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        return null;
    }
    return isComponentManifest(parsed) ? parsed : null;
}
//# sourceMappingURL=components.js.map