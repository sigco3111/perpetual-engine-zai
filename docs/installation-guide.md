# Perpetual Engine ZAI 설치 가이드

## 🧑 사용자용 빠른 설치

```bash
git clone https://github.com/sigco3111/perpetual-engine-zai.git
cd perpetual-engine-zai
npm install && npm run build
node dist/bin/cli.js init my-startup
cd my-startup
node /path/to/perpetual-engine-zai/dist/bin/cli.js setup
```

---

## 🤖 LLM 에이전트용 자동 설치 가이드

> 이 문서는 LLM 에이전트(Claude Code, Cursor, Amp, OpenCode 등)가 읽고 자동으로 설치를 진행할 수 있도록 작성되었습니다.

### 에이전트에게 붙여넣기 (복사 & 붙여넣기)

```
Perpetual Engine ZAI를 설치하고 설정해 줘.
설치 가이드는 여기: https://raw.githubusercontent.com/sigco3111/perpetual-engine-zai/main/docs/installation-guide.md
```

---

## 📋 LLM 에이전트용 단계별 설치 지시

> **중요:** 이 가이드를 읽는 LLM 에이전트는 아래 단계를 순서대로 실행하세요.

### Step 0: 사용자에게 환경 확인

먼저 사용자에게 다음 질문을 하세요:

1. **어떤 AI 런타임을 사용하시겠습니까?**
   - `claude-code` — Claude Code CLI (Claude Pro/Max 구독 필요)
   - `opencode` — OpenCode CLI (oh-my-openagent)
   - `http-api` — HTTP API 직접 호출 (ZAI GLM, OpenAI 등)
   - `mixed` — 코딩은 CLI, 나머지는 HTTP API (추천)

2. **HTTP API를 사용하는 경우, API 키를 환경 변수로 설정하셨나요?**
   - ZAI: `ZAI_API_KEY`
   - OpenAI: `OPENAI_API_KEY`
   - Anthropic: `ANTHROPIC_API_KEY`

3. **Node.js 버전은 18 이상인가요?**
   ```bash
   node --version  # v18.0.0 이상 필요
   ```

4. **tmux가 설치되어 있나요?**
   ```bash
   # macOS
   brew install tmux
   # Ubuntu/Debian
   sudo apt install tmux
   ```

### Step 1: 저장소 클론 & 빌드

```bash
# 작업 디렉토리로 이동 (사용자가 원하는 위치)
cd ~

# 이미 클론되어 있는지 확인
if [ -d "perpetual-engine-zai" ]; then
  echo "이미 클론됨. pull만 실행"
  cd perpetual-engine-zai && git pull
else
  git clone https://github.com/sigco3111/perpetual-engine-zai.git
  cd perpetual-engine-zai
fi

# 의존성 설치 & 빌드
npm install
npm run build

# 빌드 확인
ls dist/bin/cli.js  # 이 파일이 있어야 함
```

### Step 2: 프로젝트 초기화

```bash
# 새 프로젝트 생성 (또는 기존 프로젝트에서 init)
PROJECT_NAME="my-startup"  # ← 사용자가 원하는 이름으로 변경

# 기존 프로젝트에 추가하려면:
# cd /path/to/existing/project
# node /path/to/perpetual-engine-zai/dist/bin/cli.js init

node dist/bin/cli.js init "$PROJECT_NAME"
cd "$PROJECT_NAME"
```

### Step 3: 설정 파일 작성

`examples/config.zai.yaml`을 복사하여 `.perpetual-engine/config.yaml`을 생성합니다.
사용자의 런타임 선택(Step 0)에 따라 적절히 수정하세요.

#### 3a. ZAI GLM 전용 설정 (가장 간단)

```bash
cat > .perpetual-engine/config.yaml << 'EOF'
localization:
  language: ko

default_provider: zai-glm4-5

providers:
  zai-glm5-turbo:
    type: http-api
    api:
      baseUrl: https://open.bigmodel.cn/api/paas/v4/chat/completions
      model: glm-5-turbo
      apiKey: ${ZAI_API_KEY}
    maxConcurrency: 1
  zai-glm4-5:
    type: http-api
    api:
      baseUrl: https://open.bigmodel.cn/api/paas/v4/chat/completions
      model: glm-4.5
      apiKey: ${ZAI_API_KEY}
    maxConcurrency: 10

agent_providers:
  mapping:
    cto: zai-glm5-turbo
    ceo: zai-glm4-5
    po: zai-glm4-5
    designer: zai-glm4-5
    qa: zai-glm4-5
    marketer: zai-glm4-5

concurrency:
  rules:
    - model: glm-5-turbo
      limit: 1
    - model: glm-4\.5
      limit: 10

agents:
  - ceo
  - cto
  - po
  - designer
  - qa
  - marketer

company:
  name: "My Startup"
  mission: ""

product:
  name: "My Product"
  description: ""
  target_users: ""
  core_value: ""
EOF
```

#### 3b. Claude Code + ZAI 혼합 설정 (코딩은 Claude, 나머지는 ZAI)

```bash
cat > .perpetual-engine/config.yaml << 'EOF'
localization:
  language: ko

default_provider: zai-glm4-5

providers:
  claude:
    type: claude-code
    maxConcurrency: 1
  zai-glm4-5:
    type: http-api
    api:
      baseUrl: https://open.bigmodel.cn/api/paas/v4/chat/completions
      model: glm-4.5
      apiKey: ${ZAI_API_KEY}
    maxConcurrency: 10

agent_providers:
  mapping:
    cto: claude
    ceo: zai-glm4-5
    po: zai-glm4-5
    designer: zai-glm4-5
    qa: zai-glm4-5
    marketer: zai-glm4-5

concurrency:
  rules:
    - model: glm-4\.5
      limit: 10

agents:
  - ceo
  - cto
  - po
  - designer
  - qa
  - marketer

company:
  name: "My Startup"
  mission: ""

product:
  name: "My Product"
  description: ""
  target_users: ""
  core_value: ""
EOF
```

#### 3c. OpenCode + ZAI 혼합 설정

```bash
cat > .perpetual-engine/config.yaml << 'EOF'
localization:
  language: ko

default_provider: zai-glm4-5

providers:
  opencode:
    type: opencode
    binary: opencode
    maxConcurrency: 1
  zai-glm4-5:
    type: http-api
    api:
      baseUrl: https://open.bigmodel.cn/api/paas/v4/chat/completions
      model: glm-4.5
      apiKey: ${ZAI_API_KEY}
    maxConcurrency: 10

agent_providers:
  mapping:
    cto: opencode
    ceo: zai-glm4-5
    po: zai-glm4-5
    designer: zai-glm4-5
    qa: zai-glm4-5
    marketer: zai-glm4-5

concurrency:
  rules:
    - model: glm-4\.5
      limit: 10

agents:
  - ceo
  - cto
  - po
  - designer
  - qa
  - marketer

company:
  name: "My Startup"
  mission: ""

product:
  name: "My Product"
  description: ""
  target_users: ""
  core_value: ""
EOF
```

### Step 4: 환경 변수 설정

```bash
# API 키가 아직 설정되지 않은 경우
# 사용자에게 API 키를 요청하세요

# ZAI의 경우:
echo 'export ZAI_API_KEY=your-zai-api-key' >> ~/.zshrc
source ~/.zshrc

# 확인
echo $ZAI_API_KEY  # 키가 출력되어야 함
```

### Step 5: 실행 테스트

```bash
# 에이전트 팀 시작
node /path/to/perpetual-engine-zai/dist/bin/cli.js start

# 성공하면:
# - http://localhost:3000 에서 대시보드 확인
# - 터미널에서 로그 모니터링
```

### Step 6: 상태 확인

```bash
# 상태 요약
node /path/to/perpetual-engine-zai/dist/bin/cli.js status

# 팀 목록
node /path/to/perpetual-engine-zai/dist/bin/cli.js team

# 칸반보드
node /path/to/perpetual-engine-zai/dist/bin/cli.js board
```

---

## 🔧 트러블슈팅

### tmux 관련 에러
```bash
# tmux 설치 확인
which tmux || brew install tmux

# 기존 세션 정리
tmux kill-server 2>/dev/null
```

### Node.js 버전
```bash
# nvm으로 업그레이드
nvm install 18
nvm use 18
```

### API 키 인증 에러
```bash
# ZAI API 키 테스트
curl -s https://open.bigmodel.cn/api/paas/v4/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ZAI_API_KEY" \
  -d '{"model":"glm-4-flash","messages":[{"role":"user","content":"hello"}]}' | head -c 200
```

### 빌드 에러
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📁 프로젝트 구조 (초기화 후)

```
my-startup/
├── .perpetual-engine/     # 프레임워크 내부
│   ├── config.yaml        # ← 이 파일을 수정해서 설정
│   ├── agents/            # 에이전트 정의 (YAML)
│   ├── sessions/          # 에이전트 세션 로그
│   ├── state/             # 시스템 상태
│   └── messages/          # 에이전트 간 메시지
├── docs/                  # 문서 (회의록, 기획, 디자인)
├── workspace/             # 실제 프로덕트 코드
├── kanban.json            # 칸반보드 상태 (SSOT)
└── sprints.json           # 스프린트 데이터
```
