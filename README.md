# Perpetual Engine ZAI

> AI Agent Startup Framework — ZAI (GLM) 멀티 프로바이더 지원 포크

[원본 Perpetual Engine](https://github.com/greatsk55/perpetual-engine)을 포크하여 **ZAI GLM API, OpenCode, Claude Code** 등 다양한 AI 런타임을 사용할 수 있도록 개조한 프레임워크입니다.

## 상태

> **v0.5.0 — 대시보드 풀기능 개선 + 태스크 제어**
>
> OpenCode 어댑터가 `opencode run` 서브커맨드로 정상 동작하며, 에이전트별로 서로 다른 GLM 모델을 할당하여 동시성 병목 없이 병렬 실행할 수 있습니다.
> ZAI API 잔액 불필요 — opencode 코딩플랜만으로 6개 에이전트 풀가동이 가능합니다.
> 대시보드에서 칸반 관리, 메시지 송수신, 설정 편집, 에이전트 제어까지 모든 기능을 GUI로 조작할 수 있습니다.

## 원본과의 차이점

| 기능 | 원본 Perpetual Engine | Perpetual Engine ZAI |
|------|----------------------|---------------------|
| AI 런타임 | Claude Code CLI만 | Claude Code, OpenCode, HTTP API (ZAI, OpenAI 등) |
| 동시성 관리 | tmux 세션 제한만 | **프로바이더별/모델별 동시성 리미터 + 큐잉** |
| 스킬 시스템 | Claude Code 전용 슬래시 커맨드 | **프로바이더 독립 프롬프트 기반 스킬** |
| 에이전트 모델 | Claude 고정 | **에이전트별로 다른 모델 설정 가능** |
| 설정 | 단일 config.yaml | **멀티 프로바이더 + 동시성 규칙** |
| Setup 마법사 | 회사/프로덕트만 | **ZAI 프로바이더 선택 포함** |
| 대시보드 | 에이전트 상태만 | **provider/model + 프로바이더 요약** |
| 대시보드 칸반 | 읽기 전용 | **태스크 CRUD + Force Run / Suspend / Resume** |
| 대시보드 메시지 | 기본 송수신 | **에이전트 응답 대기 + JSON 포맷팅 + 회의 초대 렌더링** |
| 대시보드 설정 | 없음 | **Configuration 편집 + Agent Control (Stop / Restart)** |
| 태스크 재개 | 수동 CLI만 | **Resume 즉시 워크플로우 디스패치 + 다중 refresh** |
| 모델 분산 | N/A | **에이전트별 GLM 모델 분산으로 동시성 병목 회피** |

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

### 3. 설정

```bash
node /path/to/perpetual-engine-zai/dist/bin/cli.js setup
```

setup 명령어에서 **OpenCode**를 선택하면 에이전트별 GLM 모델 분산 설정이 자동 생성됩니다.
또는 `.perpetual-engine/config.yaml`을 직접 작성합니다:

```yaml
providers:
  opencode-glm51:
    type: opencode
    binary: opencode
    api:
      model: zai-coding-plan/glm-5.1
    maxConcurrency: 1

  opencode-glm47:
    type: opencode
    binary: opencode
    api:
      model: zai-coding-plan/glm-4.7
    maxConcurrency: 2

  opencode-glm46v:
    type: opencode
    binary: opencode
    api:
      model: zai-coding-plan/glm-4.6v
    maxConcurrency: 2

  opencode-glm46:
    type: opencode
    binary: opencode
    api:
      model: zai-coding-plan/glm-4.6
    maxConcurrency: 3

agent_providers:
  mapping:
    cto: opencode-glm51
    ceo: opencode-glm47
    po: opencode-glm47
    designer: opencode-glm46v
    qa: opencode-glm46
    marketer: opencode-glm46

default_provider: opencode-glm47

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
# 에이전트 팀 시작
node /path/to/perpetual-engine-zai/dist/bin/cli.js start

# 대시보드: http://localhost:3000
```

ZAI API 키나 별도 결제 없이, opencode 코딩플랜만으로 실행됩니다.

## 모델 분산 전략

에이전트별로 서로 다른 GLM 모델을 할당하여 동시성 제한을 회피합니다:

| 에이전트 | 모델 | 동시성 | 용도 |
|---------|------|--------|------|
| CTO | `glm-5.1` | 1 | 코딩 전담 |
| CEO | `glm-4.7` | 2 | 전략 기획 |
| PO | `glm-4.7` | 2 | 기획/분석 |
| Designer | `glm-4.6v` | 2 | 비전 디자인 |
| QA | `glm-4.6` | 3 | 품질 관리 |
| Marketer | `glm-4.6` | 3 | 마케팅 |

> 4개 모델에 6개 에이전트를 분산하면 동시성 병목 없이 병렬 실행할 수 있습니다.

## 지원 프로바이더

### OpenCode (코딩플랜) — 기본
```yaml
providers:
  opencode:
    type: opencode
    binary: opencode
    api:
      model: zai-coding-plan/glm-5.1
    maxConcurrency: 1
```

### Claude Code CLI (원본 호환)
```yaml
providers:
  claude:
    type: claude-code
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

## 아키텍처

```
Orchestrator (태스크 라우팅, 에이전트 조율)
       |
       +--- SessionManager (프로바이더 라우팅)
               |
               +--- ProviderFactory.create(config)
               |       |
               |       +--- ClaudeCodeAdapter  (CLI, tmux)
               |       +--- OpenCodeAdapter     (opencode run, tmux)
               |       +--- HttpApiAdapter      (node -e, tmux)
               |
               +--- ConcurrencyLimiter (모델별 동시성 관리 + 큐잉)
               |
               +--- PromptBuilder (프로바이더별 스킬 렌더링)
                       |
                       +--- CLI: /slash-command
                       +--- HTTP: instruction text

Dashboard (Express + WebSocket + 인라인 React)
    /api/status   → provider summary + 에이전트 실행 상태
    /api/agents   → agent.provider / agent.model 필드
    /api/kanban   → 태스크 상태별 그룹핑 (backlog ~ done + suspended)
    /api/tasks/:id/force-run   → 태스크 강제 실행
    /api/tasks/:id/suspend     → 태스크 일시 중단
    /api/tasks/:id/resume      → 태스크 재개 (워크플로우 즉시 디스패치)
    /api/agents/stop-all       → 전체 에이전트 종료
    /api/agents/restart        → 에이전트 재시작 (고아 태스크 재개)
    /api/config                → 설정 조회/수정
    /api/messages              → 메시지 송수신 + 에이전트 응답 대기
```

### 핵심 파일

| 파일 | 설명 |
|------|------|
| `src/core/session/provider-adapter.ts` | 프로바이더 추상화 인터페이스 |
| `src/core/session/providers/` | 각 프로바이더별 어댑터 구현 |
| `src/core/session/providers/opencode-adapter.ts` | `opencode run` 서브커맨드 래핑 |
| `src/core/session/provider-factory.ts` | 프로바이더 생성 팩토리 + 프리셋 |
| `src/core/session/concurrency-limiter.ts` | 모델별 동시성 리미터 + 큐잉 |
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
| `ZAI_API_KEY` | ZAI API 키 | ZAI HTTP API 사용 시 |
| `OPENAI_API_KEY` | OpenAI API 키 | OpenAI 사용 시 |
| `ANTHROPIC_API_KEY` | Anthropic API 키 | Claude 사용 시 |

> OpenCode 코딩플랜 사용 시에는 별도 환경변수가 필요하지 않습니다.

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
perpetual-engine task run <id>   # 태스크 강제 실행
perpetual-engine task suspend <id>  # 태스크 일시 중단
perpetual-engine task resume <id>   # 중단된 태스크 재개
perpetual-engine task list [-s status]  # 태스크 목록 (상태 필터)
```

## 테스트

```bash
npm run test:unit   # 단위 테스트
npm run test:e2e    # E2E 테스트
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
- [OpenCode](https://github.com/code-yeongyu/oh-my-openagent) — 멀티 프로바이더 CLI
