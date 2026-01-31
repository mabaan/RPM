# Reverse Prompt Mashreq

A multi-agent AI system that detects customer issues across internal channels and social media, routes incidents to the right team, and generates a **reverse prompt** to guide employees on next steps.

This repo follows the implementation guide and keeps the AI pipeline **read-only**: no external actions, no promises, and no automated refunds.

---

## Architecture overview

**Placeholder for architecture diagram (10:16 aspect ratio)**

![Architecture diagram placeholder (10x16)](https://github.com/user-attachments/assets/b655d082-87be-453e-af4b-c387629e9c92)

### 1) Inputs

The system continuously collects customer related signals from two groups of sources:

- **Internal sources:** AI chat logs, support emails, call center transcriptions, CRM notes and tickets, internal comms related to customer cases.
- **External sources (SNS):** social media posts, comments, replies, brand mentions, reviews.

### 2) Ingest and normalize (software, no agents)

All sources feed into an ingestion layer built with standard software connectors. This layer:

- maps each source into a **fixed canonical schema** (same fields regardless of source)
- applies basic cleaning and normalization (timestamps, channel tags, customer identifiers when available)
- removes or masks sensitive information as needed

The normalized records are stored in a **central data warehouse** as the system of record.

### 3) Retrieval layer (RAG)

From the data warehouse, the system builds a retrievable corpus for the AI layer:

- customer conversation history and case context from the warehouse
- team playbooks, policies, and approved templates (what each team is allowed to say and do)

This corpus is used for **retrieval augmented generation (RAG)** so the AI uses grounded context instead of guessing.

### 4) AI block (read only multi agent pipeline)

The AI block is a small chain of read only agents that transforms raw incidents into actionable guidance:

1. **Signal Extraction Agent (read only)**  
   Extracts structured signals from the retrieved context, such as topic, intent, sentiment, urgency, and escalation indicators. It must attach evidence snippets (short quotes with source and timestamp) for each important claim.

2. **Scoring and Routing Agent (read only)**  
   Uses the extracted signals to compute risk and priority (escalation risk, virality risk, compliance risk, financial risk), then selects the most relevant destination team from: HR, Customer Service, Development/IT, Finance, Product, Marketing, Management, Legal. If confidence is low, it routes the case to a human triage queue.

3. **Reverse Prompt Agent (read only)**  
   Generates an employee ready "reverse prompt" tailored to the routed team. It includes a concise summary, what to say, what to ask, what to check, what not to do, and when to escalate. It is grounded in retrieved playbooks and policies.

### 5) Guardrails gate (before any output)

Before anything is published, a guardrails gate validates that the output is safe and compliant:

- privacy filtering (no disallowed sensitive data leakage)
- evidence requirement (no claim without supporting text)
- policy alignment (recommendations must match playbooks)

This gate ensures the system remains advisory and controlled.

### 6) Outputs

After passing guardrails, the system writes the result to dashboards:

- evidence snippets for explainability
- the reverse prompt for the human employee to use immediately

---

## What this system does

1. **Ingests and normalizes signals** from internal and external sources into a canonical event schema.
2. **Retrieves relevant context** from event history and team playbooks via RAG.
3. **Extracts structured signals** (topic, intent, sentiment, urgency) with evidence.
4. **Scores and routes incidents** using deterministic rules.
5. **Generates a reverse prompt** grounded in evidence and playbooks.
6. **Runs guardrails** before anything is shown on dashboards.

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

1) Create venv and install dependencies:

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

2) (Optional) Build RAG indexes:

```bash
python -m app.rag.index_build
```

3) Start the API:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Option B: Docker Compose

```bash
docker compose up --build
```

API will be available at `http://localhost:8000`.

---

## Local model loading (no mock)

The API loads local Hugging Face models **in-process** at startup. This means:
- Large models require significant RAM/VRAM.
- Startup can take time if models need to download.

### Pre-download models and point to local paths (Windows PowerShell)

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

If `huggingface-cli` is not on PATH, use:

```bash
python3 -m huggingface_hub.commands.huggingface_cli login
```

---

## Configuration

Environment variables (defaults shown):

- `AGENT1_MODEL=Qwen/Qwen2.5-32B-Instruct`
- `AGENT3_MODEL=Qwen/Qwen2.5-32B-Instruct`
- `GUARDRAILS_MODEL=Qwen/Qwen2.5-1.5B-Instruct`
- `AGENT1_TEMPERATURE=0.2`
- `AGENT3_TEMPERATURE=0.2`
- `GUARDRAILS_TEMPERATURE=0.1`
- `AGENT1_MAX_TOKENS=800`
- `AGENT3_MAX_TOKENS=800`
- `GUARDRAILS_MAX_TOKENS=400`
- `WARM_START_MODELS=true` (set false to skip preloading at startup)
- `STRICT_LLM=true` (set false to allow deterministic fallback if JSON parsing fails)

---

## API Endpoints

### Health
- `GET /health` -> `{ "status": "ok" }`

### Single incident (full card)
- `POST /incidents` -> `DashboardCard`

### Single incident (reverse prompt only)
- `POST /incidents/reverse-prompt` -> `ReversePromptOutput`

### Batch incidents
- `POST /incidents/batch` -> `[DashboardCard]`

### Sample data
- `GET /samples` -> `[EventRecord]`

### Demo run
- `POST /demo/run` -> `[DashboardCard]`
  - Body: `{ "limit": 5 }`

### Build indexes
- `POST /indexes/build` -> `{ "events": <count>, "playbooks": <count> }`

---

## Example requests

### Reverse prompt only (curl)

```bash
curl -s -X POST http://localhost:8000/incidents/reverse-prompt \
  -H "Content-Type: application/json" \
  -d '{"event_id":"evt_local_001","source":"chat","timestamp":"2026-01-31T12:00:00Z","actor_type":"customer","actor_id":"cust_001","thread_id":"th_001","text":"I was billed twice and need this fixed today.","metadata":{"ticket_id":"T-9001","product":"Card","repeat_contact":true}}'
```

---

## Troubleshooting

**Startup timeout while downloading models**
- Pre-download weights and point to local paths (see above).
- Or set `WARM_START_MODELS=false` to skip preload while downloads finish.

**Out of memory**
- Use smaller checkpoints (e.g. 7B) or quantized models.

---

## Notes

- Sample data lives in `data/samples` and playbooks in `data/playbooks`.
- This is a demo pipeline intended for hackathons and prototypes.
