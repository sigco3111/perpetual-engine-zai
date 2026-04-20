# Perpetual Engine ZAI

> AI Agent Startup Framework — Multi-provider support (ZAI GLM, Claude Code, OpenCode, any OpenAI-compatible API)

[English](README.md) | 한국어

## 🆕 원본과의 차이점

[원본 Perpetual Engine](https://github.com/greatsk55/perpetual-engine)을 포크하여 **ZAI GLM API**를 비롯한 다양한 AI 런타임을 지원하도록 개조했습니다.

| 기능 | 원본 | ZAI 포크 |
|------|------|---------|
| AI 런타임 | Claude Code CLI만 | Claude Code, OpenCode, HTTP API (ZAI, OpenAI 등) |
| 동시성 관리 | tmux 세션 제한만 | **프로바이더별/모델별 동시성 리미터** |
| 스킬 시스템 | Claude Code 전용 슬래시 커맨드 | **프로바이더 독립 프롬프트 기반 스킬** |
| 에이전트 모델 | Claude 고정 | **에이전트별로 다른 모델 설정 가능** |

## 🚀 빠른 시작

```bash
# 1. 클론 & 빌드
git clone https://github.com/sigco3111/perpetual-engine-zai.git
cd perpetual-engine-zai
npm install && npm run build

# 2. 프로젝트 생성
node dist/bin/cli.js init my-startup
cd my-startup

# 3. ZAI API 키 설정
export ZAI_API_KEY=your-key

# 4. 실행
node /path/to/perpetual-engine-zai/dist/bin/cli.js start
# 대시보드: http://localhost:3000
```

## ⚡ ZAI 동시성 가이드

코딩 에이전트(CTO)와 일반 에이전트를 분리하면 최대 효율로 병렬 실행 가능:

```yaml
# CTO (코딩) → GLM-5-Turbo (동시 1)
# 나머지 → GLM-4.5 (동시 10)
# 합계: 최대 11개 에이전트 병렬 실행
```

자세한 설정은 [README.md](README.md)를 참조하세요.

## 📄 라이선스

MIT License
