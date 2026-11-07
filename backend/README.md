![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)
![tag:hackathon](https://img.shields.io/badge/hackathon-5F43F1)
![tag:chatprotocol](https://img.shields.io/badge/chatprotocol-3D8BD3)

# InfluenOne backend

uAgents agent. ASI-1 for text. Stripe and FET for payment.

**Agent name:** `InfluenOneAgent`  
**Port:** 8023  
**Chat:** Agent Chat Protocol + ASI:One interactive cards  
**Pay:** Stripe embedded Checkout on `RequestPayment.metadata.stripe` (card) and FET

ASI:One chat: menu card → generate/URL form → review → native Stripe pay card.  
Web app still uses Stripe Checkout redirect (`/api/payment/stripe/checkout`).

```bash
cp .env.example .env
pip install -r requirements.txt
python agent.py
```
