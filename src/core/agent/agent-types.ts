export type AgentRole = 'ceo' | 'cto' | 'po' | 'designer' | 'qa' | 'marketer' | 'custom';
export type AgentStatus = 'idle' | 'working' | 'waiting' | 'paused' | 'stopped';

export interface AgentSkill {
  /** 스킬 이름 */
  name: string;
  /** 스킬 설명 */
  description: string;
  /** 언제 이 스킬을 사용해야 하는지 */
  when_to_use: string;
}

export interface AgentConfig {
  name: string;
  role: AgentRole;
  description: string;
  responsibilities: string[];
  rules: string[];
  skills: AgentSkill[];
  required_mcp_tools?: string[];
  can_create_sub_agents: boolean;
  max_sub_agents: number;
  reports_to: string;
  collaborates_with: string[];

  // ─── ZAI 확장 필드 ───
  /** 사용할 프로바이더 이름 (config.providers의 키). 미설정 시 default_provider 사용 */
  provider?: string;
  /** 프로바이더별 설정 오버라이드 (config.agent_providers.overrides보다 우선) */
  providerOverrides?: {
    model?: string;
    maxConcurrency?: number;
    temperature?: number;
  };

  system_prompt_template: string;
  meeting_permissions: {
    can_schedule: boolean;
    can_participate: boolean;
    required_meetings: string[];
  };
}

export interface AgentSession {
  role: string;
  sessionName: string;
  status: AgentStatus;
  currentTask?: string;
  startedAt: string;
  /** 사용 중인 프로바이더 타입 */
  provider?: string;
  /** 사용 중인 모델 */
  model?: string;
}
