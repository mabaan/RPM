# Reverse Prompt Mashreq

A multi-agent AI system that detects customer issues across internal channels and social media, routes incidents to the correct team, and generates a **reverse prompt** that guides employees on what to do next.

This repository follows a strict implementation guide and keeps the AI pipeline **read-only**.
No external actions, no commitments, no automated refunds.

---

## Architecture overview

**Architecture diagram (10:16 aspect ratio)**


<div align="center">
  <img width="495" height="986" alt="image" src="https://github.com/user-attachments/assets/1006d2fe-222c-432c-95c2-10f07459e09b" />
</div>

---

## 1) Inputs

The system continuously collects customer-related signals from two categories of sources:

* **Internal sources**

  * AI chat logs
  * Support emails
  * Call center transcriptions
  * CRM notes and tickets
  * Internal communications related to customer cases

* **External sources (SNS)**

  * Social media posts
  * Comments and replies
  * Brand mentions
  * Public reviews

---

## 2) Ingest and normalize (software only, no agents)

All sources feed into an ingestion layer built using standard software connectors. This layer:

* Maps each source into a **fixed canonical schema**
* Applies basic cleaning and normalization

  * timestamps
  * channel tags
  * customer identifiers when available
* Removes or masks sensitive information as required

All normalized records are stored in a **central data warehouse**, which acts as the system of record.

---

## 3) Retrieval layer (RAG)

From the data warehouse, the system builds a retrievable corpus for the AI layer:

* Customer conversation history and case context
* Team playbooks, policies, and approved templates

  * what each team is allowed to say
  * what actions are permitted

This corpus is used for **retrieval augmented generation (RAG)** so the AI operates on grounded context rather than assumptions.

---

## 4) AI block (read-only multi-agent pipeline)

The AI block is a small chain of read-only agents that transforms raw incidents into actionable guidance.

### 1. Signal Extraction Agent (read-only)

* Extracts structured signals:

  * topic
  * intent
  * sentiment
  * urgency
  * escalation indicators
* Attaches **evidence snippets** for each key claim

  * short quotes
  * source
  * timestamp

### 2. Scoring and Routing Agent (read-only)

* Computes risk and priority scores:

  * escalation risk
  * virality risk
  * compliance risk
  * financial risk
* Selects the most relevant destination team from:

  * HR
  * Customer Service
  * Development / IT
  * Finance
  * Product
  * Marketing
  * Management
  * Legal
* If confidence is low, routes the case to a human triage queue.

### 3. Reverse Prompt Agent (read-only)

* Generates an employee-ready **reverse prompt** tailored to the routed team
* Includes:

  * concise summary
  * what to say
  * what to ask
  * what to check
  * what not to do
  * when to escalate
* Fully grounded in retrieved playbooks and policies

---

## 5) Guardrails gate (before any output)

Before anything is published, a guardrails gate validates that outputs are safe and compliant:

* Privacy filtering

  * no disallowed sensitive data leakage
* Evidence enforcement

  * no claim without supporting text
* Policy alignment

  * recommendations must match approved playbooks

This gate ensures the system remains advisory and controlled.

---

## 6) Outputs

After passing guardrails, the system writes results to dashboards:

* Evidence snippets for explainability
* Reverse prompts for immediate human use

---

## What this system does

1. Ingests and normalizes signals from internal and external sources into a canonical event schema
2. Retrieves relevant context from event history and team playbooks via RAG
3. Extracts structured signals with evidence
4. Scores and routes incidents using deterministic logic
5. Generates a grounded reverse prompt
6. Runs guardrails before anything is shown to users

---

## Repo layout

```
repo/
  data/
    samples/          # JSONL sample events
    playbooks/        # Team playbooks and global policy
  app/
    main.py           # FastAPI entrypoint
    pipeline.py       # Orchestration
    schemas.py        # Pydantic models
    scoring.py        # Risk scoring
    routing.py        # Team routing
    rag/
      index_build.py  # Build FAISS indexes
      retrieve.py     # Retrieval helpers
    agents/
      signal_extractor.py
      reverse_prompt.py
      guardrails_verifier.py
      llm_client.py
    ui/
      dashboard.py    # Optional Streamlit demo UI
  requirements.txt
  Dockerfile
  docker-compose.yml
  README.md
```

---

## Quickstart

### Option A: Local Python

1. Create a virtual environment and install dependencies:

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

2. Optional: build RAG indexes:

```bash
python -m app.rag.index_build
```

3. Start the API:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

### Option B: Docker Compose

```bash
docker compose up --build
```

The API will be available at:

```
http://localhost:8000
```

---

## Local model loading (no mock mode)

The API loads local Hugging Face models **in-process** at startup.

Important notes:

* Large models require significant RAM or VRAM
* Startup may take time if models need to download

### Pre-download models and use local paths (Windows PowerShell)

```powershell
pip install -U huggingface-hub
huggingface-cli login

huggingface-cli download Qwen/Qwen2.5-32B-Instruct `
  --local-dir C:\models\Qwen2.5-32B-Instruct `
  --local-dir-use-symlinks False

huggingface-cli download Qwen/Qwen2.5-1.5B-Instruct `
  --local-dir C:\models\Qwen2.5-1.5B-Instruct `
  --local-dir-use-symlinks False

$env:AGENT1_MODEL="C:\models\Qwen2.5-32B-Instruct"
$env:AGENT3_MODEL="C:\models\Qwen2.5-32B-Instruct"
$env:GUARDRAILS_MODEL="C:\models\Qwen2.5-1.5B-Instruct"

uvicorn app.main:app --host 0.0.0.0 --port 8000
```

If `huggingface-cli` is not on PATH:

```bash
python3 -m huggingface_hub.commands.huggingface_cli login
```

---

## Configuration

Environment variables and defaults:

* `AGENT1_MODEL=Qwen/Qwen2.5-32B-Instruct`
* `AGENT3_MODEL=Qwen/Qwen2.5-32B-Instruct`
* `GUARDRAILS_MODEL=Qwen/Qwen2.5-1.5B-Instruct`
* `AGENT1_TEMPERATURE=0.2`
* `AGENT3_TEMPERATURE=0.2`
* `GUARDRAILS_TEMPERATURE=0.1`
* `AGENT1_MAX_TOKENS=800`
* `AGENT3_MAX_TOKENS=800`
* `GUARDRAILS_MAX_TOKENS=400`
* `WARM_START_MODELS=true`
* `STRICT_LLM=true`

---

## API Endpoints

### Health

* `GET /health`

### Single incident (full dashboard card)

* `POST /incidents`

### Reverse prompt only

* `POST /incidents/reverse-prompt`

### Batch incidents

* `POST /incidents/batch`

### Sample data

* `GET /samples`

### Demo run

* `POST /demo/run`

  * Body: `{ "limit": 5 }`

### Build indexes

* `POST /indexes/build`

---

## Example request

### Reverse prompt only

```bash
curl -s -X POST http://localhost:8000/incidents/reverse-prompt \
  -H "Content-Type: application/json" \
  -d '{"event_id":"evt_local_001","source":"chat","timestamp":"2026-01-31T12:00:00Z","actor_type":"customer","actor_id":"cust_001","thread_id":"th_001","text":"I was billed twice and need this fixed today.","metadata":{"ticket_id":"T-9001","product":"Card","repeat_contact":true}}'
```

---

## Troubleshooting

**Startup timeout while downloading models**

* Pre-download weights and point to local paths
* Or set `WARM_START_MODELS=false`

**Out of memory**

* Use smaller checkpoints such as 7B
* Consider quantized models

---

## Notes

* Sample events are located in `data/samples`
* Playbooks and policies are located in `data/playbooks`
---
