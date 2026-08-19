# Medical RAG UI

Next.js 14 App Router + TypeScript + Tailwind CSS frontend for a medical RAG assistant.

## Requirements

- Node.js 18.17+ (Node 20 LTS recommended)
- A backend exposing:
  - `POST /rag`
  - `POST /upload`

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

Set `NEXT_PUBLIC_API_URL` in `.env.local` if your backend is not at `http://127.0.0.1:8000`.

## Routes

- `/chat` — RAG chat
- `/upload` — PDF document upload

## API contracts

See `types/api.ts`. The UI intentionally uses only the fields in the supplied API contract.
