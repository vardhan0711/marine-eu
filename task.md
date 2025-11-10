# FuelEU Maritime — AI Build Plan

## Requirements
- Hexagonal architecture
- Backend: Node, TS, Express, Prisma, Postgres
- Frontend: Vite React TS, Tailwind, React Query
- Testing: Vitest + Supertest
- AI Agent logs in AGENT_WORKFLOW.md

## Build Order
1) Backend core (domain + ports + use cases)
2) DB schema + Prisma models
3) Adapters (DB + HTTP)
4) Tests (unit + integration)
5) Frontend core layers
6) UI components + tabs
7) Docs

## Rules
- No framework imports in core
- Use Prisma only in adapter layer
- Express only in http layer
- React only in UI layer
- TypeScript strict mode
