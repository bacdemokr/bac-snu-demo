# INSTALL.md — bac-snu-demo on a fresh NVIDIA Spark

This guide gets the demo running on a **new** Spark. It assumes you (or an AI assistant
helping you, e.g. Opus) can run shell commands and edit a JSON config.

There are **5 parts**:

1. Prerequisites
2. Get the code + Node deps
3. Set up the OpenClaw gateway + agents (the brains)
4. Secrets you must provide (tokens) — *these are NOT in the repo*
5. Set up the live Chromium (browser agents) and run it

Optional extras (Telegram, GitHub multi-agent details) are at the end.

---

## 1. Prerequisites

```bash
node --version      # need >= 20
nvidia-smi          # HealthAgent reads this; should print your GPU (GB10)
which chromium || snap list | grep chromium   # need snap Chromium for browser agents
docker --version    # needed for the GitHub MCP server (GitHubAgent / multi-agent)
```

If `chromium` is missing: `sudo snap install chromium`.
You also need an X display available as `:1` (the Spark desktop session usually provides it).

---

## 2. Get the code + Node dependencies

```bash
git clone https://github.com/<owner>/bac-snu-demo.git
cd bac-snu-demo
npm install          # installs playwright-core@1.60.0 into ./node_modules
```

**Layout (important):**

```
bac-snu-demo/
├── app/                 # the web server + UI
│   ├── server.js
│   ├── public/          # canvas UI; live screenshots are written here at runtime
│   ├── systemd/snu-chromium.service
│   └── nemoclaw-index.json
├── scripts/             # browser-automation helpers (called by server.js)
│   ├── ensure-cdp.sh
│   ├── naver-search-general.mjs
│   └── snu-map.mjs
├── agent-workspaces/    # TEMPLATES for the OpenClaw agents you must create
│   └── workspace-snu/
├── node_modules/        # playwright-core (from npm install)
├── .env.example
└── INSTALL.md
```

The server expects `node_modules/playwright-core` and `scripts/` to live at the repo root
(this is the default — `WORKSPACE` resolves to the repo root automatically). If you put
node_modules elsewhere, set `WORKSPACE=/abs/path` in your environment.

---

## 3. OpenClaw gateway + agents (the brains)

The bots do **not** contain an LLM. They call a local **OpenClaw gateway** at
`http://127.0.0.1:18789/v1/chat/completions`, routing each character to a named OpenClaw
**agent**. You must have OpenClaw installed and a gateway running.

> New to OpenClaw? Install + docs: https://github.com/openclaw/openclaw and https://docs.openclaw.ai

### 3a. Agents this demo needs

In your OpenClaw config (`~/.openclaw/openclaw.json`), under `agents.list`, define:

| Agent id | Purpose | Needs GitHub MCP? |
|----------|---------|-------------------|
| `snu` | Generic single-purpose demo bot (HealthAgent, NaverAgent, SNUMapAgent, ArxivAgent) | No |
| `git` | GitHub actions for GitHubAgent | **Yes** |
| `pm`  | Multi-agent: the "PM" teammate | No |
| `dev` | Multi-agent: the "Dev" teammate (opens the PR via gateway HTTP, not MCP) | No |

Example `agents.list` entries (each just needs an id + its own workspace dir):

```jsonc
"agents": {
  "list": [
    { "id": "main", "workspace": "/home/<you>/.openclaw/workspace" },
    { "id": "snu",  "workspace": "/home/<you>/.openclaw/workspace-snu" },
    { "id": "git",  "workspace": "/home/<you>/.openclaw/workspace-git" },
    { "id": "pm",   "workspace": "/home/<you>/.openclaw/workspace-pm" },
    { "id": "dev",  "workspace": "/home/<you>/.openclaw/workspace-dev" }
  ]
}
```

Also enable cross-agent/session visibility (used by the orchestrator):

```jsonc
"tools": { "sessions": { "visibility": "all" } }
```

### 3b. The `snu` agent workspace (persona guard)

The small/local models tend to "fall back" to the default OpenClaw assistant persona
(session-status cards, "I can't access that", etc.). The demo prevents this with a
**bare-bones** workspace whose `AGENTS.md`/`SOUL.md` tell the model to obey the per-request
system messages only.

Copy the template into place:

```bash
cp -r agent-workspaces/workspace-snu /home/<you>/.openclaw/workspace-snu
```

(`server.js` already injects a hard guard system message on every request, but the bare
workspace makes weak models behave reliably.)

You can create empty workspaces for `pm`, `dev`, `git` (they don't need special personas):

```bash
mkdir -p /home/<you>/.openclaw/workspace-{pm,dev,git}
```

### 3c. Models (edit in `app/server.js` → `AGENTS`)

Each character has a `model:` field. Use whatever you have available on your gateway. The
demo's defaults:

- Local model `ollama/gemma4:latest` → NaverAgent, SNUMapAgent
- A stronger model (e.g. Claude Opus) → HealthAgent, GitHubAgent, ArxivAgent, multi-agent

Change these strings to model ids your gateway actually serves. If you only have a local
model, set them all to it (some replies will be simpler but it works).

### 3d. GitHub MCP for the `git` agent

GitHubAgent and the multi-agent PR flow need the GitHub MCP server. In `openclaw.json`:

```jsonc
"mcp": {
  "servers": {
    "github": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN",
               "ghcr.io/github/github-mcp-server"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_GITHUB_PAT>" }
    }
  }
}
```

Make sure the `git` agent is allowed to use this MCP server (per your OpenClaw config).
The PAT's account must match `GH_OWNER` (see §4). Restart the gateway after editing:

```bash
openclaw gateway restart
```

---

## 4. Secrets you must provide (NOT in the repo)

Nothing sensitive is committed. Create these at runtime:

### 4a. Gateway token  — **required**

The server authenticates to the gateway with its token (your `openclaw.json`
`gateway.auth.token`). Provide it one of two ways:

```bash
# Preferred: a file the server reads automatically (gitignored):
echo "YOUR_GATEWAY_TOKEN" > app/.gw_token
chmod 600 app/.gw_token
# OR via env:
export GATEWAY_TOKEN="YOUR_GATEWAY_TOKEN"
```

> Why a file? `/tmp` gets wiped on reboot, so don't store tokens there. The repo-local
> `app/.gw_token` survives reboots and is `.gitignore`d.

### 4b. GitHub — **required for GitHubAgent / multi-agent**

- Put your GitHub username (the PAT's account) in `GH_OWNER`.
- Set `GH_REPO` to the repo the multi-agent demo opens PRs against (default `NemoClaw`).
  This repo must exist on that account and have a `main` branch and a `demo-features/` dir
  (see `app/nemoclaw-index.json` for the convention the Dev agent follows).
- The PAT itself lives in the **GitHub MCP** config (§3d), and needs `repo` scope (and
  `delete_repo` only if you later want deletion — not used by this demo).

```bash
export GH_OWNER="your-github-username"
export GH_REPO="NemoClaw"
```

### 4c. Telegram bridge — **optional**

Create a **separate** bot with @BotFather (separate from any OpenClaw Telegram bot, so
polling doesn't collide). Then:

```bash
echo "123456:ABC-yourBotToken" > app/.tg_token   # gitignored
chmod 600 app/.tg_token
# optional: a default chat id to message before anyone DMs the bot
export TG_CHAT_ID="<your-chat-id>"
```

If you skip this, TelegramAgent just won't bridge — the rest of the demo works fine.

---

## 5. Live Chromium (browser agents) + run

NaverAgent and SNUMapAgent drive a **real Chromium** over CDP on port `9222`. A systemd
**user** service keeps it alive.

```bash
# 1) install the user service (edit DISPLAY if your X display isn't :1)
mkdir -p ~/.config/systemd/user
cp app/systemd/snu-chromium.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now snu-chromium

# 2) verify CDP is up
curl -s http://127.0.0.1:9222/json/version | head -c 200; echo
# or:  bash scripts/ensure-cdp.sh   -> prints CDP_UP / CDP_ALREADY_UP
```

`scripts/ensure-cdp.sh` is also called automatically by the server before each browser
action, and self-heals the service if Chromium died.

### Run the server

```bash
# from the repo root, with your env/tokens in place:
node app/server.js
# then open:  http://127.0.0.1:8080
```

Recommended persistent launch (survives terminal close):

```bash
cd /path/to/bac-snu-demo
setsid env GH_OWNER="$GH_OWNER" GH_REPO="$GH_REPO" \
  node app/server.js >/tmp/snu-demo.log 2>&1 </dev/null & disown
tail -f /tmp/snu-demo.log
```

To restart: find the PID on port 8080 (`ss -lptn 'sport = :8080'`) and kill **just that
PID** (don't `pkill -f "node server.js"` if you're inside another node-driven shell).

---

## Verifying each agent

- **HealthAgent** — click it, ask "status". Should report GPU temp/util + disk %.
- **NaverAgent** — ask anything; a Naver screenshot should appear under the reply.
- **SNUMapAgent** — say "show me the map"; SNU campus map screenshot appears.
- **GitHubAgent** — "list my repos" → lists `GH_OWNER`'s repos.
- **OrchestratorAgent** — "add a small feature X" → PM plans, Dev opens a real PR on
  `GH_OWNER/GH_REPO`.
- **ArxivAgent** — pops a bubble on its own ~every minute; click for Top 3 papers.
- **TelegramAgent** — type here; it appears in your Telegram chat and replies bridge back.

---

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| All bots say *Unauthorized* / 401 | Wrong/missing gateway token. Recreate `app/.gw_token` from `gateway.auth.token`. |
| Local model gives empty reply or a "session status" card | Make sure the bot routes to the `snu` agent with the bare `workspace-snu`; the server's hard-guard system message also helps. |
| NaverAgent/Map screenshot never appears | CDP down. Run `bash scripts/ensure-cdp.sh`; check `systemctl --user status snu-chromium` and that `DISPLAY=:1` is correct. |
| `cannot find module playwright-core` | Run `npm install` at the repo root, or set `WORKSPACE` to wherever `node_modules` lives. |
| GitHubAgent can't act / `Bad credentials` | The GitHub MCP PAT (§3d) is missing/expired or doesn't match `GH_OWNER`. |
| Multi-agent PR fails | `GH_REPO` must exist under `GH_OWNER` with a `main` branch and a `demo-features/` dir. |

---

## What you must customize (summary checklist)

- [ ] `npm install` at repo root
- [ ] OpenClaw agents `snu`, `git`, `pm`, `dev` created in `openclaw.json`
- [ ] `tools.sessions.visibility: "all"`
- [ ] `workspace-snu` copied from `agent-workspaces/workspace-snu`
- [ ] Models in `app/server.js` set to ids your gateway serves
- [ ] GitHub MCP configured with your PAT (`git` agent)
- [ ] `app/.gw_token` written (gateway token)
- [ ] `GH_OWNER` / `GH_REPO` set to your account + demo repo
- [ ] (optional) `app/.tg_token` for Telegram
- [ ] Chromium user service installed + `curl :9222` works
- [ ] `node app/server.js` → http://127.0.0.1:8080
