import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
/** 파일 존재만으로 감지하는 시그니처 */
const FILE_SIGNATURES = [
    // --- JavaScript/TypeScript 생태계 ---
    {
        file: 'package.json',
        detect: (content) => parsePackageJson(content),
    },
    {
        file: 'tsconfig.json',
        detect: () => ({ languages: ['TypeScript'] }),
    },
    {
        file: 'bun.lockb',
        detect: () => ({ buildTools: ['Bun'] }),
    },
    {
        file: 'pnpm-workspace.yaml',
        detect: () => ({ buildTools: ['pnpm'], isMonorepo: true }),
    },
    {
        file: 'lerna.json',
        detect: () => ({ isMonorepo: true }),
    },
    {
        file: 'turbo.json',
        detect: () => ({ buildTools: ['Turborepo'], isMonorepo: true }),
    },
    {
        file: 'nx.json',
        detect: () => ({ buildTools: ['Nx'], isMonorepo: true }),
    },
    // --- Python ---
    {
        file: ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile'],
        detect: (content) => parsePython(content),
    },
    // --- Go ---
    {
        file: 'go.mod',
        detect: () => ({ languages: ['Go'] }),
    },
    // --- Rust ---
    {
        file: 'Cargo.toml',
        detect: () => ({ languages: ['Rust'], buildTools: ['Cargo'] }),
    },
    // --- Java/Kotlin ---
    {
        file: ['build.gradle', 'build.gradle.kts'],
        detect: (content) => parseGradle(content),
    },
    {
        file: 'pom.xml',
        detect: () => ({ languages: ['Java'], buildTools: ['Maven'] }),
    },
    // --- iOS/macOS ---
    {
        file: ['Package.swift'],
        detect: () => ({ languages: ['Swift'], buildTools: ['Swift Package Manager'] }),
    },
    {
        file: 'Podfile',
        detect: () => ({ languages: ['Swift'], platforms: ['iOS'], buildTools: ['CocoaPods'] }),
    },
    {
        file: ['project.yml', 'Project.swift'],
        detect: () => ({ platforms: ['iOS'], buildTools: ['XcodeGen/Tuist'] }),
    },
    // --- Flutter/Dart ---
    {
        file: 'pubspec.yaml',
        detect: () => ({ languages: ['Dart'], frameworks: ['Flutter'], platforms: ['iOS', 'Android'] }),
    },
    // --- Docker/Infra ---
    {
        file: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'],
        detect: () => ({ buildTools: ['Docker'] }),
    },
    {
        file: 'terraform.tf',
        detect: () => ({ buildTools: ['Terraform'] }),
    },
    // --- 배포 ---
    {
        file: 'vercel.json',
        detect: () => ({ deployTargets: ['Vercel'] }),
    },
    {
        file: 'netlify.toml',
        detect: () => ({ deployTargets: ['Netlify'] }),
    },
    {
        file: ['fly.toml'],
        detect: () => ({ deployTargets: ['Fly.io'] }),
    },
    {
        file: 'railway.json',
        detect: () => ({ deployTargets: ['Railway'] }),
    },
    {
        file: ['firebase.json', '.firebaserc'],
        detect: () => ({ backend: ['Firebase'], deployTargets: ['Firebase'] }),
    },
    {
        file: ['supabase/config.toml', '.supabase'],
        detect: () => ({ backend: ['Supabase'], databases: ['PostgreSQL'] }),
    },
    {
        file: 'amplify.yml',
        detect: () => ({ backend: ['AWS Amplify'], deployTargets: ['AWS'] }),
    },
    // --- CI/CD ---
    {
        file: '.github/workflows',
        detect: () => ({ buildTools: ['GitHub Actions'] }),
    },
    {
        file: '.gitlab-ci.yml',
        detect: () => ({ buildTools: ['GitLab CI'] }),
    },
    {
        file: 'Fastfile',
        detect: () => ({ buildTools: ['Fastlane'] }),
    },
    {
        file: 'fastlane/Fastfile',
        detect: () => ({ buildTools: ['Fastlane'] }),
    },
];
/** 디렉토리 구조 패턴으로 플랫폼 감지 */
const DIR_PATTERNS = [
    { dir: ['apps/ios', 'ios'], detect: () => ({ platforms: ['iOS'] }) },
    { dir: ['apps/android', 'android'], detect: () => ({ platforms: ['Android'] }) },
    { dir: ['apps/web', 'web'], detect: () => ({ platforms: ['Web'] }) },
    { dir: ['apps/desktop', 'electron'], detect: () => ({ platforms: ['Desktop'] }) },
    { dir: ['apps/wear', 'wearos'], detect: () => ({ platforms: ['Wear OS'] }) },
    { dir: 'src', detect: () => ({}) }, // 일반적 소스 디렉토리
];
/** Xcodeproj/xcworkspace 감지 */
async function detectXcodeProject(root) {
    // glob 대신 간단하게 체크
    const entries = await import('node:fs/promises').then(fs => fs.readdir(root).catch(() => []));
    for (const entry of entries) {
        if (entry.endsWith('.xcodeproj') || entry.endsWith('.xcworkspace')) {
            return { platforms: ['iOS'], languages: ['Swift'], buildTools: ['Xcode'] };
        }
    }
    return {};
}
export async function detectTechStack(projectRoot) {
    const result = {
        languages: [],
        frameworks: [],
        backend: [],
        databases: [],
        buildTools: [],
        platforms: [],
        deployTargets: [],
        isMonorepo: false,
    };
    const merge = (partial) => {
        for (const [key, value] of Object.entries(partial)) {
            if (key === 'isMonorepo') {
                if (value)
                    result.isMonorepo = true;
            }
            else if (Array.isArray(value)) {
                const arr = result[key];
                for (const v of value) {
                    if (!arr.includes(v))
                        arr.push(v);
                }
            }
        }
    };
    // 파일 시그니처 검사
    for (const sig of FILE_SIGNATURES) {
        const files = Array.isArray(sig.file) ? sig.file : [sig.file];
        for (const file of files) {
            const filePath = path.join(projectRoot, file);
            if (existsSync(filePath)) {
                let content;
                try {
                    const stat = await import('node:fs/promises').then(fs => fs.stat(filePath));
                    if (stat.isFile()) {
                        content = await readFile(filePath, 'utf-8');
                    }
                }
                catch { /* directory or unreadable */ }
                merge(sig.detect(content));
                break; // 같은 시그니처의 다른 파일은 건너뜀
            }
        }
    }
    // 디렉토리 패턴 검사
    for (const pat of DIR_PATTERNS) {
        const dirs = Array.isArray(pat.dir) ? pat.dir : [pat.dir];
        for (const dir of dirs) {
            if (existsSync(path.join(projectRoot, dir))) {
                merge(pat.detect());
                break;
            }
        }
    }
    // Xcode 프로젝트 감지
    merge(await detectXcodeProject(projectRoot));
    // 모노레포 내부 스캔 (apps/ 아래)
    const appsDir = path.join(projectRoot, 'apps');
    if (existsSync(appsDir)) {
        result.isMonorepo = true;
        try {
            const apps = await import('node:fs/promises').then(fs => fs.readdir(appsDir));
            for (const app of apps) {
                const appRoot = path.join(appsDir, app);
                const stat = await import('node:fs/promises').then(fs => fs.stat(appRoot));
                if (stat.isDirectory()) {
                    // 서브 프로젝트의 package.json 확인
                    const subPkgPath = path.join(appRoot, 'package.json');
                    if (existsSync(subPkgPath)) {
                        const content = await readFile(subPkgPath, 'utf-8');
                        merge(parsePackageJson(content));
                    }
                    // Xcode 프로젝트 확인
                    merge(await detectXcodeProject(appRoot));
                    // Gradle 확인
                    for (const gf of ['build.gradle', 'build.gradle.kts']) {
                        const gradlePath = path.join(appRoot, gf);
                        if (existsSync(gradlePath)) {
                            const content = await readFile(gradlePath, 'utf-8');
                            merge(parseGradle(content));
                            break;
                        }
                    }
                }
            }
        }
        catch { /* ignore */ }
    }
    return result;
}
/** package.json 파싱 */
function parsePackageJson(content) {
    if (!content)
        return { languages: ['JavaScript'] };
    const result = {
        languages: ['JavaScript'],
        frameworks: [],
        backend: [],
        databases: [],
        platforms: ['Web'],
    };
    try {
        const pkg = JSON.parse(content);
        const allDeps = {
            ...pkg.dependencies,
            ...pkg.devDependencies,
        };
        // TypeScript
        if (allDeps['typescript']) {
            result.languages = ['TypeScript'];
        }
        // 프레임워크 감지
        const frameworkMap = {
            'next': 'Next.js',
            'react': 'React',
            'vue': 'Vue.js',
            'nuxt': 'Nuxt.js',
            'svelte': 'Svelte',
            '@sveltejs/kit': 'SvelteKit',
            'angular': 'Angular',
            '@angular/core': 'Angular',
            'express': 'Express',
            'fastify': 'Fastify',
            'hono': 'Hono',
            'elysia': 'Elysia',
            'astro': 'Astro',
            'remix': 'Remix',
            '@remix-run/react': 'Remix',
            'gatsby': 'Gatsby',
            'solid-js': 'SolidJS',
            'qwik': 'Qwik',
            'electron': 'Electron',
            'tauri': 'Tauri',
            'react-native': 'React Native',
            'expo': 'Expo',
        };
        for (const [dep, name] of Object.entries(frameworkMap)) {
            if (allDeps[dep]) {
                result.frameworks.push(name);
            }
        }
        // 백엔드/DB
        const backendMap = {
            'prisma': { backend: 'Prisma', db: 'PostgreSQL' },
            '@prisma/client': { backend: 'Prisma' },
            'drizzle-orm': { backend: 'Drizzle' },
            'mongoose': { db: 'MongoDB' },
            'pg': { db: 'PostgreSQL' },
            'mysql2': { db: 'MySQL' },
            'redis': { db: 'Redis' },
            '@supabase/supabase-js': { backend: 'Supabase', db: 'PostgreSQL' },
            'firebase': { backend: 'Firebase' },
            'firebase-admin': { backend: 'Firebase' },
            '@aws-sdk/client-s3': { backend: 'AWS S3' },
            'stripe': { backend: 'Stripe' },
        };
        for (const [dep, info] of Object.entries(backendMap)) {
            if (allDeps[dep]) {
                if (info.backend)
                    result.backend.push(info.backend);
                if (info.db) {
                    result.databases = result.databases || [];
                    result.databases.push(info.db);
                }
            }
        }
        // 모바일 플랫폼
        if (allDeps['react-native'] || allDeps['expo']) {
            result.platforms = ['iOS', 'Android'];
        }
        if (allDeps['electron'] || allDeps['tauri']) {
            result.platforms.push('Desktop');
        }
    }
    catch { /* malformed JSON */ }
    return result;
}
/** Python 프로젝트 파싱 */
function parsePython(content) {
    const result = {
        languages: ['Python'],
        frameworks: [],
    };
    if (!content)
        return result;
    const frameworkMap = {
        'django': 'Django',
        'flask': 'Flask',
        'fastapi': 'FastAPI',
        'streamlit': 'Streamlit',
        'gradio': 'Gradio',
        'pytorch': 'PyTorch',
        'torch': 'PyTorch',
        'tensorflow': 'TensorFlow',
        'langchain': 'LangChain',
        'anthropic': 'Claude API',
        'openai': 'OpenAI API',
    };
    const lower = content.toLowerCase();
    for (const [key, name] of Object.entries(frameworkMap)) {
        if (lower.includes(key)) {
            result.frameworks.push(name);
        }
    }
    return result;
}
/** Gradle 파일 파싱 */
function parseGradle(content) {
    if (!content)
        return { languages: ['Kotlin'], buildTools: ['Gradle'] };
    const result = {
        languages: [],
        frameworks: [],
        buildTools: ['Gradle'],
        platforms: [],
    };
    if (content.includes('kotlin') || content.includes('.kts')) {
        result.languages.push('Kotlin');
    }
    if (content.includes('java')) {
        result.languages.push('Java');
    }
    if (content.includes('com.android') || content.includes('android {')) {
        result.platforms.push('Android');
    }
    if (content.includes('compose')) {
        result.frameworks.push('Jetpack Compose');
    }
    if (content.includes('hilt') || content.includes('dagger')) {
        result.frameworks.push('Hilt/Dagger');
    }
    if (content.includes('spring')) {
        result.frameworks.push('Spring');
    }
    return result;
}
//# sourceMappingURL=tech-stack-detector.js.map