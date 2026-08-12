/**
 * Provider Factory
 *
 * 설정(config)에 따라 적절한 ProviderAdapter를 생성합니다.
 */
import type { ProviderAdapter, ProviderConfig } from './provider-adapter.js';
export declare function createProviderAdapter(config: ProviderConfig): ProviderAdapter;
/**
 * 기본 제공 프로바이더 설정 프리셋
 */
export declare const PROVIDER_PRESETS: Record<string, ProviderConfig>;
//# sourceMappingURL=provider-factory.d.ts.map