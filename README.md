# bac-snu-demo

A live, interactive **multi-agent demo** built for an **NVIDIA Spark (DGX Spark / GB10)**,
shown at a Seoul National University event. It's a small Node web server that serves a
Canvas "office" where clickable characters are real AI agents, each backed by an
[OpenClaw](https://github.com/openclaw/openclaw) gateway running on the same machine.

> 🧰 Setting this up on a new Spark? See **[INSTALL.md](./INSTALL.md)** for a step-by-step
> guide. It's written so you can hand the whole thing to an AI assistant (e.g. Opus) and
> have it walk you through, including the pieces you must fill in by hand (tokens, agents).

## What's in the demo

Clickable agents on the canvas (`app/server.js` → `AGENTS`):

| Agent | Role | What it does live |
|-------|------|-------------------|
| **HealthAgent** | System health | Reads live `nvidia-smi` + `df -h` on this Spark and reports GPU/disk health |
| **NaverAgent** | Live web search | Drives a **real Chromium** (via CDP) to search Naver, summarizes + screenshots |
| **SNUMapAgent** | Campus map | Opens the live SNU campus map in a real browser, screenshots it |
| **GitHubAgent** | GitHub assistant | Lists repos / forks / opens PRs on a real GitHub account (via OpenClaw `git` agent) |
| **OrchestratorAgent** | Multi-agent | Spawns a PM + Dev agent that hand off work and open a **real PR** |
| **ArxivAgent** | Paper radar | A cron job refreshes the top-3 Agentic-AI arXiv papers every minute |
| **TelegramAgent** | Two-way bridge | Chat here ↔ a real Telegram chat, in real time |

## Architecture (one paragraph)

`app/server.js` is a dependency-free Node HTTP server. It serves the canvas UI from
`app/public/`, exposes a few `/api/*` endpoints, and proxies chat to a local **OpenClaw
gateway** (`/v1/chat/completions`) — routing each character to a specific OpenClaw agent
id (`snu`, `git`, …) and model. Browser-driven agents talk to a **persistent Chromium**
listening on CDP port `9222` (managed by a systemd user service). The multi-agent and
GitHub agents perform **real** GitHub actions through the gateway's `git` agent (GitHub MCP).

## Requirements

- An **NVIDIA Spark / GB10** (or any Linux box with `nvidia-smi` for HealthAgent)
- **Node.js ≥ 20**
- A running **OpenClaw gateway** with a few agents configured (see INSTALL.md)
- **snap Chromium** + an X display (`:1`) for the browser agents
- A **GitHub PAT** (for GitHubAgent / multi-agent) and optionally a **Telegram bot token**

## Quick start

```bash
git clone https://github.com/<owner>/bac-snu-demo.git
cd bac-snu-demo
npm install                      # installs playwright-core
cp .env.example .env             # then fill in the values (see INSTALL.md)
# ...configure OpenClaw agents + tokens (INSTALL.md) ...
node app/server.js               # open http://127.0.0.1:8080
```

**Read [INSTALL.md](./INSTALL.md) first** — the demo will not work until the OpenClaw
gateway, agents, tokens, and Chromium service are set up.

## Security

No secrets are committed. Tokens are read at runtime from files you create
(`app/.gw_token`, `app/.gh_token`, `app/.tg_token`) or environment variables, all of
which are `.gitignore`d. See INSTALL.md → "Secrets you must provide".
