# Perpetual Engine ZAI

> AI Agent Startup Framework — ZAI (GLM) 멀티 프로바이더 지원 포크

[원본 Perpetual Engine](https://github.com/greatsk55/perpetual-engine)을 포크하여 **ZAI GLM API, OpenCode, Claude Code** 등 다양한 AI 런타임을 사용할 수 있도록 개조한 프레임워크입니다.

## 🆕 원본과의 차이점

| 기능 | 원본 Perpetual Engine | Perpetual Engine ZAI |
|------|----------------------|---------------------|
| AI 런타임 | Claude Code CLI만 | Claude Code, OpenCode, HTTP API (ZAI, OpenAI 등) |
| 동시성 관리 | tmux 세션 제한만 | **프로바이더별/모델별 동시성 리미터** |
| 스킬 시스템 | Claude Code 전용 슬래시 커맨드 | **프로바이어 독립 프롬프트 기반 스킬** |
| 에이전트 모델 | Claude 고정 | **에이전트별로 다른 모델 설정 가능** |
| 설정 | 단일 config.yaml | **멀티 프로바이더 + 동시성 규칙** |

## 🚀 Quick Start

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

`.perpetual-engine/config.yaml`을 다음과 같이 설정합니다:

```yaml
# ─── ZAI 프로바이더 설정 ───
default_provider: zai-glm4-5

providers:
  # 코딩 에이전트용 (고성능, 동시 1)
  zai-glm5-turbo:
    type: http-api
    api:
      baseUrl: https://open.bigmodel.cn/api/paas/v4/chat/completions
      model: glm-5-turbo
      apiKey: ${ZAI_API_KEY}  # 환경 변수 사용 권장
    maxConcurrency: 1

  # 일반 에이전트용 (고동시성)
  zai-glm4-5:
    type: http-api
    api:
      baseUrl: https://open.bigmodel.cn/api/paas/v4/chat/completions
      model: glm-4.5
      apiKey: ${ZAI_API_KEY}
    maxConcurrency: 10

# ─── 에이전트별 프로바이더 매핑 ───
agent_providers:
  mapping:
    cto: zai-glm5-turbo        # 코딩은 고성능 모델
    ceo: zai-glm4-5            # 나머지는 고동시성 모델
    po: zai-glm4-5
    designer: zai-glm4-5
    qa: zai-glm4-5
    marketer: zai-glm4-5

# ─── 동시성 관리 ───
concurrency:
  rules:
    - model: glm-5-turbo      # GLM-5 계열 동시성 제한
      limit: 1
    - model: glm-4.5          # GLM-4.5 동시성
      limit: 10
    - model: glm-4-plus       # GLM-4-Plus 동시성
      limit: 20

# ─── 기존 설정 ───
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

## 📋 지원 프로바이더

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
    binary: opencode          # CLI 바이너리 경로
    maxConcurrency: 1
```

### ZAI GLM (HTTP API)
```yaml
providers:
  zai:
    type: http-api
    api:
      baseUrl: https://open.bigmodel.cn/api/paas/v4/chat/completions
      model: glm-4.5          # glm-4-flash, glm-4.5, glm-5-turbo 등
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

## ⚡ ZAI Rate Limits 참고

ZAI API의 모델별 동시성 제한 (2026년 4월 기준):

| 모델 | 동시성 | 추천 용도 |
|------|--------|----------|
| GLM-5-Turbo | 1 | 코딩 (CTO) |
| GLM-5V-Turbo | 1 | 비전 코딩 |
| GLM-5.1 | 1 | 최신 코딩 |
| GLM-5 | 2 | 코딩 보조 |
| GLM-4.7 | 2 | 복잡한 추론 |
| GLM-4.5 | 10 | 일반 작업 (Writer, Researcher 등) |
| GLM-4-Plus | 20 | 가벼운 작업 (PM, Ops 등) |

> 💡 **팁:** 코딩 에이전트(CTO)는 GLM-5-Turbo(동시 1), 나머지 에이전트는 GLM-4.5(동시 10)로 설정하면 동시성 충돌 없이 최대 11개 에이전트를 병렬 실행할 수 있습니다.

## 🏗️ 아키텍처

```
┌──────────────────────────────────────────────┐
│              Orchestrator                     │
│  (태스크 라우팅, 에이전트 조율, 스프린트 관리)  │
└──────────────────┬───────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌─────────┐  ┌──────────┐  ┌──────────┐
│ Claude  │  │ OpenCode │  │ HTTP API │
│ Adapter │  │ Adapter  │  │ Adapter  │
└────┬────┘  └────┬─────┘  └────┬─────┘
     │            │             │
     └────────────┼─────────────┘
                  ▼
     ┌────────────────────────┐
     │  Concurrency Limiter   │
     │  (모델별 동시성 관리)   │
     └────────────────────────┘
                  │
     ┌────────────┼────────────┐
     ▼            ▼            ▼
  tmux 세션   tmux 세션    HTTP 요청
```

### 핵심 변경 파일

| 파일 | 설명 |
|------|------|
| `src/core/session/provider-adapter.ts` | 프로바이어 추상화 인터페이스 |
| `src/core/session/providers/` | 각 프로바이어별 어댑터 구현 |
| `src/core/session/provider-factory.ts` | 프로바이어 생성 팩토리 |
| `src/core/session/concurrency-limiter.ts` | 모델별 동시성 리미터 |
| `src/core/project/config.ts` | 확장된 설정 스키마 (ZAI 지원) |
| `src/core/agent/agent-skills.ts` | 프로바이어 독립 스킬 시스템 |
| `src/core/agent/agent-types.ts` | 확장된 에이전트 타입 |

## 🔧 환경 변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `ZAI_API_KEY` | ZAI API 키 | ZAI 사용 시 |
| `OPENAI_API_KEY` | OpenAI API 키 | OpenAI 사용 시 |
| `ANTHROPIC_API_KEY` | Anthropic API 키 | Claude 사용 시 |

## 📝 CLI 명령어

```bash
# 프로젝트 관리
perpetual-engine init [name]     # 프로젝트 생성
perpetual-engine setup           # 설정
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

## 🤝 기여

기여를 환영합니다! 다른 ZAI 사용자도 이 프레임워크를 사용할 수 있도록:

1. 새로운 프로바이더 어댑터 추가 (`src/core/session/providers/`)
2. 동시성 규칙 업데이트 (ZAI Rate Limits 변경 시)
3. 스킬 라이브러리 확장
4. 버그 리포트 및 수정

## 📄 라이선스

MIT License — 원본 [Perpetual Engine](https://github.com/greatsk55/perpetual-engine)과 동일

## 🙏 크레딧

- [Perpetual Engine](https://github.com/greatsk55/perpetual-engine) — 원본 프레임워크
- [Z.ai](https://z.ai) — GLM API 제공
