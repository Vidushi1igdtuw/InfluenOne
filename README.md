![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)
![tag:hackathon](https://img.shields.io/badge/hackathon-5F43F1)
![tag:chatprotocol](https://img.shields.io/badge/chatprotocol-3D8BD3)
![tag:asi1](https://img.shields.io/badge/ASI:One-5F43F1)

# InfluenOne

ASI:One ghostwriter for LinkedIn influencers. Built for **Stranger Builds** (Fetch.ai Innovation Lab).

Influencers draft, schedule, and publish in their own voice. **ASI-1 is the only model.** Stripe or FET unlocks posting.

**Agent name:** InfluenOneAgent  
**Chat protocol:** Agent Chat Protocol (ACP)  
**LLM:** ASI-1 only (`asi1`)

## Challenge fit

[Stranger Builds hackpack](https://innovationlab.fetch.ai/events/hackathons/stranger-builds-1/hackpack) — Challenge 1 (intent to action) and Challenge 2 (ASI-1 as the only model).

| Requirement | Here |
|---|---|
| Real-world problem | LinkedIn influencers: generate, schedule, post |
| Multi-step work | Generate → optional team review → pay → publish |
| ASI-1 only | All text via `https://api.asi1.ai/v1` |
| uAgents + Chat Protocol | `backend/agent.py` + `protocol.py` |
| Monetisation | Stripe Checkout **or** FET on Fetch Network |

## Run locally

Backend:

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
python agent.py
```

Frontend:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

- App: http://localhost:5500
- Agent: http://localhost:8023

## Env

| Key | Where |
|---|---|
| `ASI1_API_KEY` | backend |
| `STRIPE_SECRET_KEY` | backend |
| `FET_WALLET_ADDRESS` | backend |
| `SUPABASE_URL` / keys | backend |
| `NEXT_PUBLIC_API_BASE` | frontend (`http://localhost:8023`) |

## Stack

- **uAgents** + Agent Chat Protocol
- **ASI:One / ASI-1** for generation
- **Stripe** (card) and **FET** (Fetch Network)
- **Supabase** auth + state
- **Next.js** app (same screens, Fetch Lab colours)

## Flow (unchanged)

1. Sign in
2. Connect LinkedIn
3. Generate a post with ASI-1 (or URL-to-post / schedule / templates)
4. Pay with **card** or **FET**
5. Post or schedule
