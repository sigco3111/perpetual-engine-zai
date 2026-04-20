# Perpetual Engine ZAI

> AI Agent Startup Framework — ZAI (GLM) 멀티 프로바이더 지원 포크

[원본 Perpetual Engine](https://github.com/greatsk55/perpetual-engine)을 포크하여 **ZAI GLM API, OpenCode, Claude Code** 등 다양한 AI 런타임을 사용할 수 있도록 개조한 프레임워크입니다.

## 상태

> **v0.3.0 — 멀티 프로바이더 런타임 통합 완료**
>
> 프로바이더 어댑터(Claude Code / OpenCode / HTTP API)가 SessionManager, PromptBuilder, 대시보드, setup 마법사까지 완전히 연동되었습니다.
> `config.yaml` 설정만으로 에이전트별 프로바이더·모델을 지정할 수 있으며, 환경변수 보간(`${ZAI_API_KEY}`), 동시성 리미터, provider별 스킬 렌더링이 동작합니다.

## 원본과의 차이점

| 기능 | 원본 Perpetual Engine | Perpetual Engine ZAI |
|------|----------------------|---------------------|
| AI 런타임 | Claude Code CLI만 | Claude Code, OpenCode, HTTP API (ZAI, OpenAI 등) |
| 동시성 관리 | tmux 세션 제한만 | **프로바이더별/모델별 동시성 리미터** |
| 스킬 시스템 | Claude Code 전용 슬래시 커맨드 | **프로바이더 독립 프롬프트 기반 스킬** |
| 에이전트 모델 | Claude 고정 | **에이전트별로 다른 모델 설정 가능** |
| 설정 | 단일 config.yaml | **멀티 프로바이더 + 동시성 규칙** |
| Setup 마법사 | 회사/프로덕트만 | **ZAI 프로바이더 선택 포함** |
| 대시보드 | 에이전트 상태만 | **provider/model + 프로바이더 요약** |

## 에이전트 자동 설치 (추천)

LLM 에이전트(Claude Code, Cursor, Amp, OpenCode 등)에게 아래 프롬프트를 복사해서 붙여넣으세요:

```
Perpetual Engine ZAI를 설치하고 설정해 줘.
설치 가이드는 여기: https://raw.githubusercontent.com/sigco3111/perpetual-engine-zai/main/docs/installation-guide.md
```

에이전트가 자동으로 환경 확인 → 클론 → 빌드 → 설정까지 진행합니다.

---

## Quick Start (직접 설치)

### 1. 설치

```bash
git clone https://github.com/sigco3111/perpetual-engine-zai.git
cd perpetual-engine-zai
npm install
npm run build
```

### 2. 프로젝트 생성

```bash
# 새 프로젝트
node dist/bin/cli.js init my-startup
cd my-startup

# 또는 기존 프로젝트에 추가
cd your-existing-project
node /path/to/perpetual-engine-zai/dist/bin/cli.js init
```

### 3. ZAI 설정

```bash
node /path/to/perpetual-engine-zai/dist/bin/cli.js setup
```

setup 명령어에서 **ZAI GLM API**를 선택하면 API 키, 코딩용/일반용 모델을 대화형으로 설정합니다.
또는 `.perpetual-engine/config.yaml`을 직접 작성합니다:

```yaml
# ZAI 프로바이더 설정
default_provider: zai-general

providers:
  zai-coding:
    type: http-api
    api:
      baseUrl: https://open.bigmodel.cn/api/paas/v4/chat/completions
      model: glm-5-turbo
      apiKey: ${ZAI_API_KEY}
    maxConcurrency: 1

  zai-general:
    type: http-api
    api:
      baseUrl: https://open.bigmodel.cn/api/paas/v4/chat/completions
      model: glm-4.5
      apiKey: ${ZAI_API_KEY}
    maxConcurrency: 10

# 에이전트별 프로바이더 매핑
agent_providers:
  mapping:
    cto: zai-coding
    ceo: zai-general
    po: zai-general
    designer: zai-general
    qa: zai-general
    marketer: zai-general

# 동시성 관리
concurrency:
  rules:
    - model: glm-5-turbo
      limit: 1
    - model: glm-4\.5$
      limit: 10
    - model: glm-4-plus
      limit: 20

# 기존 설정
localization:
  language: ko
company:
  name: "My Startup"
  mission: "AI로 세상을 바꾼다"
product:
  name: "My Product"
  description: "혁신적인 AI 서비스"
```

### 4. 실행

```bash
# API 키 설정
export ZAI_API_KEY=your-api-key-here

# 에이전트 팀 시작
node /path/to/perpetual-engine-zai/dist/bin/cli.js start

# 대시보드: http://localhost:3000
```

## 지원 프로바이더

### Claude Code CLI (원본 호환)
```yaml
providers:
  claude:
    type: claude-code
    maxConcurrency: 1
```

### OpenCode (oh-my-openagent)
```yaml
providers:
  opencode:
    type: opencode
    binary: opencode
    maxConcurrency: 1
```

### ZAI GLM (HTTP API)
```yaml
providers:
  zai:
    type: http-api
    api:
      baseUrl: https://open.bigmodel.cn/api/paas/v4/chat/completions
      model: glm-4.5
      apiKey: ${ZAI_API_KEY}
    maxConcurrency: 10
```

### OpenAI Compatible (사용자 커스텀)
```yaml
providers:
  custom:
    type: http-api
    api:
      baseUrl: https://your-api.example.com/v1/chat/completions
      model: your-model
      apiKey: ${CUSTOM_API_KEY}
      headers:
        X-Custom-Header: value
    maxConcurrency: 5
```

## ZAI Rate Limits 참고

ZAI API의 모델별 동시성 제한 (2026년 4월 기준):

| 모델 | 동시성 | 추천 용도 |
|------|--------|----------|
| GLM-5-Turbo | 1 | 코딩 (CTO) |
| GLM-5V-Turbo | 1 | 비전 코딩 |
| GLM-5.1 | 1 | 최신 코딩 |
| GLM-5 | 2 | 코딩 보조 |
| GLM-4.7 | 2 | 복잡한 추론 |
| GLM-4.5 | 10 | 일반 작업 |
| GLM-4-Plus | 20 | 가벼운 작업 |

> 코딩 에이전트(CTO)는 GLM-5-Turbo(동시 1), 나머지 에이전트는 GLM-4.5(동시 10)로 설정하면 동시성 충돌 없이 최대 11개 에이전트를 병렬 실행할 수 있습니다.

## 아키텍처

```
Orchestrator (태스크 라우팅, 에이전트 조율)
       |
       +--- SessionManager (프로바이더 라우팅)
               |
               +--- ProviderFactory.create(config)
               |       |
               |       +--- ClaudeCodeAdapter  (CLI, tmux)
               |       +--- OpenCodeAdapter     (CLI, tmux)
               |       +--- HttpApiAdapter      (node -e, tmux)
               |
               +--- ConcurrencyLimiter (모델별 동시성 관리)
               |
               +--- PromptBuilder (프로바이더별 스킬 렌더링)
                       |
                       +--- CLI: /slash-command
                       +--- HTTP: instruction text

Dashboard (Express + WebSocket)
    /api/status   → provider summary 포함
    /api/agents   → agent.provider / agent.model 필드
    /api/kanban   → 태스크 상태
```

### 핵심 파일

| 파일 | 설명 |
|------|------|
| `src/core/session/provider-adapter.ts` | 프로바이더 추상화 인터페이스 |
| `src/core/session/providers/` | 각 프로바이더별 어댑터 구현 |
| `src/core/session/provider-factory.ts` | 프로바이더 생성 팩토리 + 프리셋 |
| `src/core/session/concurrency-limiter.ts` | 모델별 동시성 리미터 |
| `src/core/session/session-manager.ts` | 프로바이더 라우팅 + 동시성 통합 |
| `src/core/project/config.ts` | 확장된 설정 스키마 + env var 보간 + validation |
| `src/core/agent/agent-skills.ts` | 프로바이더 독립 스킬 시스템 |
| `src/core/agent/agent-types.ts` | 확장된 에이전트 타입 (provider/model) |
| `src/core/agent/prompt-builder.ts` | 프로바이더별 스킬 렌더링 |
| `src/dashboard/server.ts` | 대시보드 API (provider summary) |
| `src/cli/commands/setup.ts` | ZAI 프로바이더 설정 마법사 |

## 환경 변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `ZAI_API_KEY` | ZAI API 키 | ZAI 사용 시 |
| `OPENAI_API_KEY` | OpenAI API 키 | OpenAI 사용 시 |
| `ANTHROPIC_API_KEY` | Anthropic API 키 | Claude 사용 시 |

> `config.yaml`에서 `${ZAI_API_KEY}` 형태로 환경변수를 참조할 수 있습니다. 설정되지 않은 변수는 원문 그대로 유지됩니다.

## CLI 명령어

```bash
# 프로젝트 관리
perpetual-engine init [name]     # 프로젝트 생성
perpetual-engine setup           # 설정 (ZAI 프로바이더 마법사 포함)
perpetual-engine start           # 에이전트 + 대시보드 시작
perpetual-engine stop            # 모든 에이전트 종료

# 모니터링
perpetual-engine status          # 상태 요약
perpetual-engine board           # 터미널 칸반보드
perpetual-engine team            # 팀 목록
perpetual-engine logs <agent>    # 에이전트 로그

# 상호작용
perpetual-engine message "msg"   # 팀에게 메시지
perpetual-engine task run <id>   # 태스크 실행
```

## 테스트

```bash
npm run test:unit   # 단위 테스트 (104 tests)
npm run test:e2e    # E2E 테스트 (41 tests)
npm test            # 전체 (145 tests)
```

## 기여

기여를 환영합니다:

1. 새로운 프로바이더 어댑터 추가 (`src/core/session/providers/`)
2. 동시성 규칙 업데이트 (ZAI Rate Limits 변경 시)
3. 스킬 라이브러리 확장
4. 버그 리포트 및 수정

## 라이선스

MIT License — 원본 [Perpetual Engine](https://github.com/greatsk55/perpetual-engine)과 동일

## 크레딧

- [Perpetual Engine](https://github.com/greatsk55/perpetual-engine) — 원본 프레임워크
- [Z.ai](https://z.ai) — GLM API 제공
