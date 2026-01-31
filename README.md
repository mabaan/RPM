## Architecture Description

### 1) Inputs

The system continuously collects customer related signals from two groups of sources:

* **Internal sources:** AI chat logs, support emails, call center transcriptions, CRM notes and tickets, internal comms related to customer cases.
* **External sources (SNS):** social media posts, comments, replies, brand mentions, reviews.

### 2) Ingest and normalize (software, no agents)

All sources feed into an ingestion layer built with standard software connectors. This layer:

* maps each source into a **fixed canonical schema** (same fields regardless of source)
* applies basic cleaning and normalization (timestamps, channel tags, customer identifiers when available)
* removes or masks sensitive information as needed

The normalized records are stored in a **central data warehouse** as the system of record.

### 3) Retrieval layer (RAG)

From the data warehouse, the system builds a retrievable corpus for the AI layer:

* customer conversation history and case context from the warehouse
* team playbooks, policies, and approved templates (what each team is allowed to say and do)

This corpus is used for **retrieval augmented generation (RAG)** so the AI uses grounded context instead of guessing.

### 4) AI block (read only multi agent pipeline)

The AI block is a small chain of read only agents that transforms raw incidents into actionable guidance:

1. **Signal Extraction Agent (read only)**
   Extracts structured signals from the retrieved context, such as topic, intent, sentiment, urgency, and escalation indicators. It must attach evidence snippets (short quotes with source and timestamp) for each important claim.

2. **Scoring and Routing Agent (read only)**
   Uses the extracted signals to compute risk and priority (escalation risk, virality risk, compliance risk, financial risk), then selects the most relevant destination team from: HR, Customer Service, Development/IT, Finance, Product, Marketing, Management, Legal. If confidence is low, it routes the case to a human triage queue.

3. **Reverse Prompt Agent (read only)**
   Generates an employee ready “reverse prompt” tailored to the routed team. It includes a concise summary, what to say, what to ask, what to check, what not to do, and when to escalate. It is grounded in retrieved playbooks and policies.

### 5) Guardrails gate (before any output)

Before anything is published, a guardrails gate validates that the output is safe and compliant:

* privacy filtering (no disallowed sensitive data leakage)
* evidence requirement (no claim without supporting text)
* policy alignment (recommendations must match playbooks)

This gate ensures the system remains advisory and controlled.

### 6) Outputs

After passing guardrails, the system writes the result to dashboards:

* evidence snippets for explainability
* the reverse prompt for the human employee to use immediately


Bank Teams: 

HR

Customer Service

Development / IT

Finance

Product

Marketing

Management

Legal
 
Options
## Quickstart (FastAPI)

### Option A: Local Python

1) Create venv and install requirements:

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

4) Download models (call this before processing incidents):

```bash
curl -X POST http://localhost:8000/models/download
```

5) Process an incident:

```bash
# By event ID
curl http://localhost:8000/process/evt_email_001

# Or run demo batch
curl -X POST http://localhost:8000/process/batch -H "Content-Type: application/json" -d '{"limit": 2}'
```

### Option B: Docker Compose

```bash
docker compose up --build
```

The API will be available at `http://localhost:8000`.

## API Endpoints

### Core Processing
- `POST /process` - Process a custom incident (send EventRecord JSON)
- `GET /process/{event_id}` - Process specific event by ID from samples
- `POST /process/batch` - Process multiple sample incidents (demo mode)

### Utilities
- `GET /health` - Health check
- `GET /samples` - List all available sample event IDs
- `POST /models/download` - Download and load AI models
- `POST /indexes/build` - Build RAG indexes from playbooks and data

## Example Usage

**Process specific event by ID:**
```bash
curl http://localhost:8000/process/evt_email_003
```

**Process custom incident:**
```bash
curl -X POST http://localhost:8000/process \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "custom_001",
    "source": "email",
    "timestamp": "2026-01-31T10:00:00Z",
    "actor_type": "customer",
    "actor_id": "cust_123",
    "thread_id": "thread_001",
    "text": "Your credit card charges 20% interest - is this legal?",
    "metadata": {"ticket_id": "T-999", "product": "Credit Card"}
  }'
```

**Process multiple samples (demo):**
```bash
curl -X POST http://localhost:8000/process/batch \
  -H "Content-Type: application/json" \
  -d '{"limit": 3}'
```

**List available samples:**
```bash
curl http://localhost:8000/samples
```

## Notes

- Local LLM inference requires `torch`, `transformers`, and sufficient RAM/VRAM for selected models.
- **Hugging Face Token**: Set `HF_TOKEN` environment variable with your Hugging Face token for accessing gated or private models.
- **Models are NOT loaded automatically**. You must call `POST /models/download` endpoint first to download models before processing incidents.
- To allow lazy loading (old behavior), set `REQUIRE_MODEL_DOWNLOAD=false` environment variable.
- To enable automatic model loading on startup, set `AUTO_LOAD_MODELS=true` environment variable.
- Models can be configured with:
  - `AGENT1_MODEL`, `AGENT3_MODEL`, `GUARDRAILS_MODEL`
  - `AGENT1_TEMPERATURE`, `AGENT3_TEMPERATURE`, `GUARDRAILS_TEMPERATURE`
  - `AGENT1_MAX_TOKENS`, `AGENT3_MAX_TOKENS`, `GUARDRAILS_MAX_TOKENS`
  - `WARM_START_MODELS=false` to skip model loading when calling `/models/download`
- `STRICT_LLM=true` (default) will fail if the model returns invalid JSON. Set `STRICT_LLM=false` to allow deterministic fallbacks.
- Sample data lives in `data/samples` and playbooks in `data/playbooks`.
