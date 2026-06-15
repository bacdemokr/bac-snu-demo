# Demo Speech (~5 minutes) — Easy English

> Tip: Speak slowly. Pause at each "..." Take a breath between sections.
> Words are kept short and simple so they are easy to say.
> We call them "agents" — each one does a real task on its own, and they can
> even work together.

---

## 1. Opening (~40s)

Hello everyone. Thank you for being here.

This demo is a simple, hands-on way to show what AI agents can do.

And here is the fun part — we did not write any code to build this demo. Not one line. We built the whole thing just by chatting with OpenClaw and an LLM model.

Oh, and the background you see — it's a very simple tribute to this building, the one we are standing in right now.

On the screen, you can see a few little claws. Each claw is an agent — and each one does its own task.

Let me show you what they can do.

---

## 2. OrchestratorAgent — the star (~70s)

Let's start with the most interesting one — the OrchestratorAgent.

Agents can work *with* other agents. They can even create their own helper agents — we call those "sub-agents." This one shows exactly that.

Here is its job. It works on a real fork of a project called NemoClaw. When I ask for a feature, it calls a **PM** and a **Dev**, and they open a real pull request on GitHub.

I can type any feature I want... or just click one of these suggested features to ask for it.

(Click a suggested feature)

When I click, two sub-agents wake up. First, the **PM** thinks about how to build it — a short plan. Then the PM hands that plan to the **Dev**. The Dev writes the code, finishes the feature, and opens the pull request.

Today I used just two sub-agents to keep it simple. But in real life, you can spin up many more — a Security agent, a Policy agent, and others — and let them discuss together and ship a meaningful pull request as a team.

---

## 3. ArxivAgent (~40s)

Next is the ArxivAgent. This one is here to show a **cron job** — a task that runs on a schedule.

Once every minute, it wakes up on its own and scans arXiv for the most interesting new Agentic-AI papers.

(Click ArxivAgent)

So it pops up by itself with fresh picks — no one has to ask. That's the power of a scheduled agent: it keeps working in the background, even when you are not looking.

---

## 4. GitHubAgent (~40s)

This one is the GitHubAgent. It is here to show a feature called **MCP**.

MCP is how we connect an agent to other apps and tools. The more we connect — and the more permission we give — the more the agent can do for us.

This agent is connected to a real GitHub account. So right from the chat, I can ask "what repositories do I have?" or even ask it to fork a repo.

(Ask: "list my repos")

See — real projects, real actions, all from a simple chat message.

---

## 5. HealthAgent (~40s)

Now the HealthAgent.

Agentic AI can also run system commands — right on the machine.

Here, it gives us a quick summary of the system right now — things like temperature and disk space. And we can ask follow-up questions for any extra info we need.

(Click HealthAgent)

This is the real machine, this second — not fake data.

---

## 6. NaverAgent (~40s)

This is the NaverAgent. It shows an agent **controlling a real Chrome browser**.

Here we use Naver, but think bigger — it could order something on Amazon, or do almost anything we need on the internet.

For example, I can search for a restaurant — like the place where we had samgyeopsal last week — and check the reviews and info live.

(Type a search)

It opens a real browser, finds the answer, and even shows a screenshot.

---

## 7. SNUMapAgent (~30s)

Last one — the SNUMapAgent.

Under the hood, it works just like the NaverAgent. But here's the nice part — this one was added by a student here at this event.

We can search the campus with simple keywords — the library, a parking lot, and more — and even see it on the map.

---

## 8. Closing (~30s)

So, the bottom line is simple.

With the right harness, AI agents can do real work — check the system, search the web, manage code, and even work as a team.

And the best part — you can build your own. We invite all of you, SNU students, to try it: build your own agent right on this server, with just a few chat messages.

Thank you so much. I'm happy to take any questions.

---

## Quick cue card (if you get lost)

1. Opening — built with zero code, only chatting with OpenClaw + LLM; background = tribute to this building; claws = agents
2. OrchestratorAgent (STAR) — agents make sub-agents; PM + Dev open a real PR on NemoClaw fork; click a feature; could add Security/Policy agents
3. ArxivAgent — cron job; every minute scans arXiv, pops up on its own
4. GitHubAgent — MCP; connected to real GitHub; "list my repos", fork
5. HealthAgent — runs system commands; live temp / disk summary
6. NaverAgent — controls real Chrome; Naver now, but could order on Amazon etc.
7. SNUMapAgent — same as Naver under the hood; added by a student; search campus + map
8. Closing — with the right harness, agents do real work; SNU students, build your own here!
