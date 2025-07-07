# gylt‑proto‑v3 – Switch & Save FinTech Prototype

✨ Overview

The gylt‑proto‑v3 repository hosts the functional MVP of gYlt – a "Spotify Wrapped"‑style assistant that analyses open‑banking transactions and suggests one‑click switches to cheaper Telco/Energy/Insurance providers.

Key facts :

Stack : Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion

Data layer : Qdrant vector DB (Docker) for semantic matching of transactions

Tracking : Google Apps Script webhook → Google Sheets for live funnel metrics

Status : Public beta – 30 users onboarded, 20 % completion to switch page

🚀 Quick start

# 1. Clone & install
pnpm i           # or npm install / yarn

# 2. Copy env and add keys
cp .env.example .env.local

# 3. Launch dev server
pnpm dev         # open http://localhost:3000

🔧 Required env variables

Key

Example

Purpose

OPENAI_API_KEY

sk‑…

Embedding & summarisation

QDRANT_URL

http://localhost:6333

Vector search

GOOGLE_SCRIPT_WEBHOOK

https://script.google.com/…

Click tracking

🗃️ Scripts

Command

Action

dev

Run local dev server

build

Compile for production

start

Serve production build

docker:db

Spin up local Qdrant

🌐 Deployment

The current preview is auto‑deployed on Vercel via GitHub Actions (main branch → prototype.gylt.space). Environment secrets are configured in Vercel’s dashboard.

