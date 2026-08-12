import { z } from 'zod';
export declare const providerConfigSchema: z.ZodObject<{
    /** 프로바이더 타입 */
    type: z.ZodDefault<z.ZodEnum<["claude-code", "opencode", "aicp", "http-api"]>>;
    /** CLI 바이너리 이름 */
    binary: z.ZodOptional<z.ZodString>;
    /** HTTP API 설정 */
    api: z.ZodOptional<z.ZodObject<{
        baseUrl: z.ZodOptional<z.ZodString>;
        apiKey: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
        headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        headers: Record<string, string>;
        baseUrl?: string | undefined;
        apiKey?: string | undefined;
        model?: string | undefined;
    }, {
        baseUrl?: string | undefined;
        apiKey?: string | undefined;
        model?: string | undefined;
        headers?: Record<string, string> | undefined;
    }>>;
    /** 동시 실행 제한 */
    maxConcurrency: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "claude-code" | "opencode" | "aicp" | "http-api";
    maxConcurrency: number;
    binary?: string | undefined;
    api?: {
        headers: Record<string, string>;
        baseUrl?: string | undefined;
        apiKey?: string | undefined;
        model?: string | undefined;
    } | undefined;
}, {
    binary?: string | undefined;
    type?: "claude-code" | "opencode" | "aicp" | "http-api" | undefined;
    api?: {
        baseUrl?: string | undefined;
        apiKey?: string | undefined;
        model?: string | undefined;
        headers?: Record<string, string> | undefined;
    } | undefined;
    maxConcurrency?: number | undefined;
}>;
export declare const concurrencyRuleSchema: z.ZodObject<{
    /** 모델 이름 또는 정규식 패턴 */
    model: z.ZodString;
    /** 최대 동시 요청 수 */
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    model: string;
    limit: number;
}, {
    model: string;
    limit?: number | undefined;
}>;
export declare const concurrencyConfigSchema: z.ZodObject<{
    /** 프로바이더별 기본 동시성 */
    defaults: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    /** 모델별 동시성 규칙 (ZAI Rate Limits 기반) */
    rules: z.ZodDefault<z.ZodArray<z.ZodObject<{
        /** 모델 이름 또는 정규식 패턴 */
        model: z.ZodString;
        /** 최대 동시 요청 수 */
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        model: string;
        limit: number;
    }, {
        model: string;
        limit?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    defaults: Record<string, number>;
    rules: {
        model: string;
        limit: number;
    }[];
}, {
    defaults?: Record<string, number> | undefined;
    rules?: {
        model: string;
        limit?: number | undefined;
    }[] | undefined;
}>;
export declare const agentProviderMappingSchema: z.ZodObject<{
    /** 에이전트 역할 → 사용할 프로바이더 이름 */
    mapping: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    /** 에이전트별 프로바이더 설정 오버라이드 */
    overrides: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        /** 프로바이더 타입 */
        type: z.ZodDefault<z.ZodEnum<["claude-code", "opencode", "aicp", "http-api"]>>;
        /** CLI 바이너리 이름 */
        binary: z.ZodOptional<z.ZodString>;
        /** HTTP API 설정 */
        api: z.ZodOptional<z.ZodObject<{
            baseUrl: z.ZodOptional<z.ZodString>;
            apiKey: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
            headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            headers: Record<string, string>;
            baseUrl?: string | undefined;
            apiKey?: string | undefined;
            model?: string | undefined;
        }, {
            baseUrl?: string | undefined;
            apiKey?: string | undefined;
            model?: string | undefined;
            headers?: Record<string, string> | undefined;
        }>>;
        /** 동시 실행 제한 */
        maxConcurrency: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "claude-code" | "opencode" | "aicp" | "http-api";
        maxConcurrency: number;
        binary?: string | undefined;
        api?: {
            headers: Record<string, string>;
            baseUrl?: string | undefined;
            apiKey?: string | undefined;
            model?: string | undefined;
        } | undefined;
    }, {
        binary?: string | undefined;
        type?: "claude-code" | "opencode" | "aicp" | "http-api" | undefined;
        api?: {
            baseUrl?: string | undefined;
            apiKey?: string | undefined;
            model?: string | undefined;
            headers?: Record<string, string> | undefined;
        } | undefined;
        maxConcurrency?: number | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    mapping: Record<string, string>;
    overrides: Record<string, {
        type: "claude-code" | "opencode" | "aicp" | "http-api";
        maxConcurrency: number;
        binary?: string | undefined;
        api?: {
            headers: Record<string, string>;
            baseUrl?: string | undefined;
            apiKey?: string | undefined;
            model?: string | undefined;
        } | undefined;
    }>;
}, {
    mapping?: Record<string, string> | undefined;
    overrides?: Record<string, {
        binary?: string | undefined;
        type?: "claude-code" | "opencode" | "aicp" | "http-api" | undefined;
        api?: {
            baseUrl?: string | undefined;
            apiKey?: string | undefined;
            model?: string | undefined;
            headers?: Record<string, string> | undefined;
        } | undefined;
        maxConcurrency?: number | undefined;
    }> | undefined;
}>;
export declare const mcpServerSchema: z.ZodObject<{
    command: z.ZodString;
    args: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    env: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    command: string;
    args: string[];
    env: Record<string, string>;
}, {
    command: string;
    args?: string[] | undefined;
    env?: Record<string, string> | undefined;
}>;
export declare const projectConfigSchema: z.ZodObject<{
    localization: z.ZodDefault<z.ZodObject<{
        language: z.ZodDefault<z.ZodString>;
        language_name: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        language: string;
        language_name: string;
    }, {
        language?: string | undefined;
        language_name?: string | undefined;
    }>>;
    company: z.ZodDefault<z.ZodObject<{
        name: z.ZodDefault<z.ZodString>;
        mission: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        mission: string;
    }, {
        name?: string | undefined;
        mission?: string | undefined;
    }>>;
    product: z.ZodDefault<z.ZodObject<{
        name: z.ZodDefault<z.ZodString>;
        description: z.ZodDefault<z.ZodString>;
        target_users: z.ZodDefault<z.ZodString>;
        core_value: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        target_users: string;
        core_value: string;
    }, {
        name?: string | undefined;
        description?: string | undefined;
        target_users?: string | undefined;
        core_value?: string | undefined;
    }>>;
    constraints: z.ZodDefault<z.ZodObject<{
        tech_stack_preference: z.ZodDefault<z.ZodString>;
        deploy_target: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        tech_stack_preference: string;
        deploy_target: string;
    }, {
        tech_stack_preference?: string | undefined;
        deploy_target?: string | undefined;
    }>>;
    agents: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    mcp_servers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        command: z.ZodString;
        args: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        env: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        command: string;
        args: string[];
        env: Record<string, string>;
    }, {
        command: string;
        args?: string[] | undefined;
        env?: Record<string, string> | undefined;
    }>>>;
    /** 프로바이더 정의 */
    providers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        /** 프로바이더 타입 */
        type: z.ZodDefault<z.ZodEnum<["claude-code", "opencode", "aicp", "http-api"]>>;
        /** CLI 바이너리 이름 */
        binary: z.ZodOptional<z.ZodString>;
        /** HTTP API 설정 */
        api: z.ZodOptional<z.ZodObject<{
            baseUrl: z.ZodOptional<z.ZodString>;
            apiKey: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
            headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            headers: Record<string, string>;
            baseUrl?: string | undefined;
            apiKey?: string | undefined;
            model?: string | undefined;
        }, {
            baseUrl?: string | undefined;
            apiKey?: string | undefined;
            model?: string | undefined;
            headers?: Record<string, string> | undefined;
        }>>;
        /** 동시 실행 제한 */
        maxConcurrency: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "claude-code" | "opencode" | "aicp" | "http-api";
        maxConcurrency: number;
        binary?: string | undefined;
        api?: {
            headers: Record<string, string>;
            baseUrl?: string | undefined;
            apiKey?: string | undefined;
            model?: string | undefined;
        } | undefined;
    }, {
        binary?: string | undefined;
        type?: "claude-code" | "opencode" | "aicp" | "http-api" | undefined;
        api?: {
            baseUrl?: string | undefined;
            apiKey?: string | undefined;
            model?: string | undefined;
            headers?: Record<string, string> | undefined;
        } | undefined;
        maxConcurrency?: number | undefined;
    }>>>;
    /** 동시성 관리 설정 */
    concurrency: z.ZodDefault<z.ZodObject<{
        /** 프로바이더별 기본 동시성 */
        defaults: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        /** 모델별 동시성 규칙 (ZAI Rate Limits 기반) */
        rules: z.ZodDefault<z.ZodArray<z.ZodObject<{
            /** 모델 이름 또는 정규식 패턴 */
            model: z.ZodString;
            /** 최대 동시 요청 수 */
            limit: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            model: string;
            limit: number;
        }, {
            model: string;
            limit?: number | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        defaults: Record<string, number>;
        rules: {
            model: string;
            limit: number;
        }[];
    }, {
        defaults?: Record<string, number> | undefined;
        rules?: {
            model: string;
            limit?: number | undefined;
        }[] | undefined;
    }>>;
    /** 에이전트별 프로바이더 매핑 */
    agent_providers: z.ZodDefault<z.ZodObject<{
        /** 에이전트 역할 → 사용할 프로바이더 이름 */
        mapping: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        /** 에이전트별 프로바이더 설정 오버라이드 */
        overrides: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
            /** 프로바이더 타입 */
            type: z.ZodDefault<z.ZodEnum<["claude-code", "opencode", "aicp", "http-api"]>>;
            /** CLI 바이너리 이름 */
            binary: z.ZodOptional<z.ZodString>;
            /** HTTP API 설정 */
            api: z.ZodOptional<z.ZodObject<{
                baseUrl: z.ZodOptional<z.ZodString>;
                apiKey: z.ZodOptional<z.ZodString>;
                model: z.ZodOptional<z.ZodString>;
                headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                headers: Record<string, string>;
                baseUrl?: string | undefined;
                apiKey?: string | undefined;
                model?: string | undefined;
            }, {
                baseUrl?: string | undefined;
                apiKey?: string | undefined;
                model?: string | undefined;
                headers?: Record<string, string> | undefined;
            }>>;
            /** 동시 실행 제한 */
            maxConcurrency: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "claude-code" | "opencode" | "aicp" | "http-api";
            maxConcurrency: number;
            binary?: string | undefined;
            api?: {
                headers: Record<string, string>;
                baseUrl?: string | undefined;
                apiKey?: string | undefined;
                model?: string | undefined;
            } | undefined;
        }, {
            binary?: string | undefined;
            type?: "claude-code" | "opencode" | "aicp" | "http-api" | undefined;
            api?: {
                baseUrl?: string | undefined;
                apiKey?: string | undefined;
                model?: string | undefined;
                headers?: Record<string, string> | undefined;
            } | undefined;
            maxConcurrency?: number | undefined;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        mapping: Record<string, string>;
        overrides: Record<string, {
            type: "claude-code" | "opencode" | "aicp" | "http-api";
            maxConcurrency: number;
            binary?: string | undefined;
            api?: {
                headers: Record<string, string>;
                baseUrl?: string | undefined;
                apiKey?: string | undefined;
                model?: string | undefined;
            } | undefined;
        }>;
    }, {
        mapping?: Record<string, string> | undefined;
        overrides?: Record<string, {
            binary?: string | undefined;
            type?: "claude-code" | "opencode" | "aicp" | "http-api" | undefined;
            api?: {
                baseUrl?: string | undefined;
                apiKey?: string | undefined;
                model?: string | undefined;
                headers?: Record<string, string> | undefined;
            } | undefined;
            maxConcurrency?: number | undefined;
        }> | undefined;
    }>>;
    /** 기본 프로바이더 (에이전트에 명시적 매핑이 없을 때 사용) */
    default_provider: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    agents: string[];
    localization: {
        language: string;
        language_name: string;
    };
    company: {
        name: string;
        mission: string;
    };
    product: {
        name: string;
        description: string;
        target_users: string;
        core_value: string;
    };
    constraints: {
        tech_stack_preference: string;
        deploy_target: string;
    };
    mcp_servers: Record<string, {
        command: string;
        args: string[];
        env: Record<string, string>;
    }>;
    providers: Record<string, {
        type: "claude-code" | "opencode" | "aicp" | "http-api";
        maxConcurrency: number;
        binary?: string | undefined;
        api?: {
            headers: Record<string, string>;
            baseUrl?: string | undefined;
            apiKey?: string | undefined;
            model?: string | undefined;
        } | undefined;
    }>;
    concurrency: {
        defaults: Record<string, number>;
        rules: {
            model: string;
            limit: number;
        }[];
    };
    agent_providers: {
        mapping: Record<string, string>;
        overrides: Record<string, {
            type: "claude-code" | "opencode" | "aicp" | "http-api";
            maxConcurrency: number;
            binary?: string | undefined;
            api?: {
                headers: Record<string, string>;
                baseUrl?: string | undefined;
                apiKey?: string | undefined;
                model?: string | undefined;
            } | undefined;
        }>;
    };
    default_provider: string;
}, {
    agents?: string[] | undefined;
    localization?: {
        language?: string | undefined;
        language_name?: string | undefined;
    } | undefined;
    company?: {
        name?: string | undefined;
        mission?: string | undefined;
    } | undefined;
    product?: {
        name?: string | undefined;
        description?: string | undefined;
        target_users?: string | undefined;
        core_value?: string | undefined;
    } | undefined;
    constraints?: {
        tech_stack_preference?: string | undefined;
        deploy_target?: string | undefined;
    } | undefined;
    mcp_servers?: Record<string, {
        command: string;
        args?: string[] | undefined;
        env?: Record<string, string> | undefined;
    }> | undefined;
    providers?: Record<string, {
        binary?: string | undefined;
        type?: "claude-code" | "opencode" | "aicp" | "http-api" | undefined;
        api?: {
            baseUrl?: string | undefined;
            apiKey?: string | undefined;
            model?: string | undefined;
            headers?: Record<string, string> | undefined;
        } | undefined;
        maxConcurrency?: number | undefined;
    }> | undefined;
    concurrency?: {
        defaults?: Record<string, number> | undefined;
        rules?: {
            model: string;
            limit?: number | undefined;
        }[] | undefined;
    } | undefined;
    agent_providers?: {
        mapping?: Record<string, string> | undefined;
        overrides?: Record<string, {
            binary?: string | undefined;
            type?: "claude-code" | "opencode" | "aicp" | "http-api" | undefined;
            api?: {
                baseUrl?: string | undefined;
                apiKey?: string | undefined;
                model?: string | undefined;
                headers?: Record<string, string> | undefined;
            } | undefined;
            maxConcurrency?: number | undefined;
        }> | undefined;
    } | undefined;
    default_provider?: string | undefined;
}>;
export type ProjectConfig = z.infer<typeof projectConfigSchema>;
export type ProviderConfigType = z.infer<typeof providerConfigSchema>;
export type ConcurrencyConfigType = z.infer<typeof concurrencyConfigSchema>;
export type AgentProviderMappingType = z.infer<typeof agentProviderMappingSchema>;
/**
 * 문자열 내의 ${VAR_NAME} 패턴을 환경변수로 치환합니다.
 * 치환되지 않은 ${...} 패턴이 남아있으면 원문 유지.
 */
export declare function resolveEnvVars(value: string): string;
/**
 * 에이전트 프로바이더 매핑이 유효한지 검증합니다.
 * agent_providers.mapping의 모든 키가 providers에 정의되어 있어야 합니다.
 */
export declare function validateProviderConfig(config: ProjectConfig): string[];
/**
 * 특정 에이전트 역할에 매핑된 프로바이더 설정을 반환합니다.
 * 매핑이 없으면 default_provider를 확인하고, 그것도 없으면 null을 반환합니다.
 */
export declare function getProviderForAgent(config: ProjectConfig, role: string): ProviderConfigType | null;
/**
 * 기본 프로바이더 설정을 반환합니다.
 */
export declare function getDefaultProvider(config: ProjectConfig): ProviderConfigType | null;
export declare function loadConfig(configPath: string): Promise<ProjectConfig>;
export declare function saveConfig(configPath: string, config: ProjectConfig): Promise<void>;
export declare function createDefaultConfig(): ProjectConfig;
/**
 * ZAI 사용자를 위한 기본 설정 템플릿을 생성합니다.
 */
export declare function createZaiDefaultConfig(): ProjectConfig;
//# sourceMappingURL=config.d.ts.map