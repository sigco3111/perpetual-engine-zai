/**
 * 에이전트가 응답·문서·커밋 메시지에 사용할 언어 옵션.
 * value: BCP-47 언어 코드 (config 저장용)
 * name: 사용자에게 보이는 표시명
 * promptName: 시스템 프롬프트에 주입될 사람이 읽는 이름 (LLM이 인식하기 좋은 형태)
 */
export declare const LANGUAGE_CHOICES: ReadonlyArray<{
    value: string;
    name: string;
    promptName: string;
}>;
/** value → promptName 조회 (config의 language 코드로부터 사람이 읽는 이름을 얻을 때 사용) */
export declare function resolveLanguageName(code: string): string;
export interface SetupAnswers {
    language: string;
    languageName: string;
    companyName: string;
    companyMission: string;
    productName: string;
    productDescription: string;
    targetUsers: string;
    coreValue: string;
    techStackPreference: string;
    deployTarget: string;
}
export declare function runSetupPrompts(): Promise<SetupAnswers>;
export interface ProviderSetupAnswers {
    useZaiProvider: boolean;
    apiKey?: string;
    codingModel?: string;
    generalModel?: string;
}
export type ProviderChoice = 'claude-code' | 'opencode' | 'zai-api' | 'mixed-opencode-zai' | 'mixed-claude-zai';
export interface ProviderSetupAnswers {
    useZaiProvider: boolean;
    providerChoice?: ProviderChoice;
    apiKey?: string;
    codingModel?: string;
    generalModel?: string;
}
export declare function runProviderSetupPrompts(): Promise<ProviderSetupAnswers>;
//# sourceMappingURL=prompts.d.ts.map