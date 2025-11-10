
# 🤖 AI Agent Workflow Log

This project was built using Cursor AI, GPT-5, and GitHub Copilot in a structured agent-assisted workflow.
The goal was to leverage AI for productivity while maintaining correctness for the FuelEU Maritime regulation requirements.


## 🧠Agents Used
| Agent / Tool                    | Purpose                                                          |
| ------------------------------- | ---------------------------------------------------------------- |
| **Cursor AI**                   | Main AI coding assistant — file generation & refactors           |
| **GPT-5 (ChatGPT)**             | Regulatory logic, architecture guidance, calculations, debugging |
| **GitHub Copilot**              | Inline code suggestions & boilerplate                            |
| **Browser Search + FuelEU PDF** | Validation against actual maritime compliance rules              |

## 📌 Workflow Strategy
| Step                | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| Planning            | Used GPT and Cursor to outline features from the spec            |
| Architecture        | Asked GPT to generate ports/adapters folder structure            |
| Backend Scaffolding | Cursor Agent tasks to scaffold Express + Prisma hexagonal design |
| Frontend UI         | Cursor + Copilot for React + Tailwind components                 |
| Testing & Debug     | GPT & Cursor terminal prompts for fixes                          |
| DB & Migrations     | Prisma guided by GPT queries                                     |
| Validation          | Cross-checked banking & pooling logic with spec PDF              |

## 📎 Prompt Samples & Outputs

**✅ Prompt Example 1 — Architecture Setup**

Create backend folder structure using Clean Hexagonal Architecture:
src/core/domain, core/application, core/ports, adapters, infrastructure/server
Add Prisma and Express entry point.

**AI Output:**

Generated folder tree

Created placeholder domain & ports

Scaffoled src/infrastructure/server/index.ts

Verification:
Reviewed imports, ensured no core ↔ framework coupling.

**✅ Prompt Example 2 — Regulatory Logic Deep Dive**

Implement compliance balance formula from FuelEU regulation:
CB = (Target - ActualIntensity) × (Fuel × 41,000 MJ/ton)
Include positive surplus banking and pooling constraints.

**AI Output:**

Computed CB formula

Added adjustment layer for banking & pooling

Recommended greedy pool allocation

**Manual Correction:**

Verified against Article 20–21 PDF

Ensured deficit never worsens & surplus never becomes negative

**✅ Prompt Example 3 — Debugging with Cursor Terminal**

**Fix:** prisma.routes is undefined. Update import and call schema model name.

**Fix Applied:**

Corrected Prisma client import

Ensured migrations created routes table


## ✅ Validation & Corrections

Re-created Prisma migrations when API changed

Manually tested /routes, /banking, /compliance, /pools

Verified baseline calculation logic

Confirmed docker compose up initializes Postgres

Debugged frontend axios URL .env mismatch with GPT guidance

Ensured npm run dev & npm run test both work
## 📊 Observations

**💡Where AI Helped**

Rapid folder + config scaffolding

TypeScript + Prisma code generation

React & Tailwind component boilerplate

Faster debugging via terminal + GPT hints


## ⚠️ Where AI Struggled

| Issue                              | Fix                               |
| ---------------------------------- | --------------------------------- |
| ESM vs CJS confusion               | Manually adjusted tsx/dev scripts |
| Prisma model assumption mismatch   | Regenerated schema                |
| Overly abstract patterns           | Simplified via manual review      |
| Cursor mis-generated Docker config | Re-checked services manually      |

## 🧩 Best Practices Followed

✅ Used tasks.md for structured Cursor generation

✅ Committed incrementally — no AI code dump commits

✅ AI suggestions reviewed before applying

✅ Validated compliance formulas using external PDF

✅ Used Copilot only for low-risk boilerplate

✅ Manual overrides for business logic & database operations

✅ Logged agent role in commit messages where relevant
## ✅ Final Notes

AI significantly accelerated setup and routine coding, but:

Core regulation logic was validated manually

Banking & pooling logic cross-checked with EU documentation

Critical paths were reviewed before commit

This document reflects transparency in using AI responsibly.