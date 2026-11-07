![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)
![tag:hackathon](https://img.shields.io/badge/hackathon-5F43F1)
![tag:chatprotocol](https://img.shields.io/badge/chatprotocol-3D8BD3)

# InfluenOne Agent

Your AI LinkedIn content engine — powered by ASI:One.

InfluenOneAgent turns a topic or a URL into a polished, publish-ready LinkedIn post **with a matching AI-generated graphic**, lets you pay with Stripe **or** native FET, schedules posts, publishes to LinkedIn, and tracks tasks and analytics — all in one agent.

## Chat with the agent

**ASI:One:** https://asi1.ai/ai/agent1q2yfrx8tg5mynwjcy2ferlkhhw2qq9rdxrplqj6ck4hrravv32dxz9pw4hp

Open the link, hit **Start chat**, and the agent greets you with an interactive menu card. Type a topic or paste a URL to start.

## What the agent can do

- **Post generation with AI graphic** — give a topic (or pick ideas); the agent writes the post and generates a matching graphic, shows a review card, then publishes/saves.
- **URL → post** — paste any article/blog link; the agent extracts the content, rewrites it as a LinkedIn post with a matching graphic.
- **Scheduling** — schedule posts for later; the agent publishes them automatically at the right time.
- **LinkedIn publishing** — connect LinkedIn OAuth and publish directly from chat.
- **Payments (two ways)**
  - **Stripe pack in chat** — a native Stripe Checkout card, **$4.99 for 10 uses** (1 use per card), on the web app.
  - **FET Payment Protocol** — pay in chat with FET via the native Payment Protocol.
- **Tasks** — create/track to-dos (draft, review, publish) right in the conversation.
- **Analytics & health** — quick stats and a health endpoint for monitoring.
- **REST surface** — the same agent powers the InfluenOne web app over REST endpoints.
- **Model** — ASI:One only (`api.asi1.ai/v1`) — the Fetch.ai LLM.

## How a chat flows

1. Say hi → menu card (generate post / URL → post / tasks / health + ASI:One chat link).
2. Send a topic or URL → agent drafts the post + graphic.
3. Review card → tweak or approve.
4. Pay with the Stripe card or FET → post published to LinkedIn or saved to drafts.

## Web app

The full product (dashboard, create, ideas, schedule, templates, transactions, analytics) lives in the sibling `frontend/` and talks to this agent over REST.

## Run locally

```bash
cp .env.example .env   # fill in ASI1_API_KEY, SUPABASE_*, LinkedIn, Stripe keys
pip install -r requirements.txt
python agent.py        # serves on :8023, mailbox enabled
```

**Agent name:** `InfluenOneAgent`
**Port:** 8023
**Chat protocol:** uagents-core chat + interactive cards
**Pay:** Stripe embedded Checkout (`RequestPayment.metadata.stripe`) and FET Payment Protocol