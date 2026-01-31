from __future__ import annotations

from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .agents.llm_client import warm_start_models
from .pipeline import process_incident
from .rag.retrieve import build_indexes, load_events
from .schemas import DashboardCard, EventRecord, ReversePromptOutput

app = FastAPI(title="Customer Incident Radar", version="0.1.0")


class BatchRequest(BaseModel):
    incidents: List[EventRecord]


class DemoRequest(BaseModel):
    limit: Optional[int] = 5


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.on_event("startup")
async def load_models() -> None:
    warm_start_models()


@app.post("/incidents", response_model=DashboardCard)
async def create_incident(incident: EventRecord) -> DashboardCard:
    return process_incident(incident)


@app.post("/incidents/reverse-prompt", response_model=ReversePromptOutput)
async def create_reverse_prompt(incident: EventRecord) -> ReversePromptOutput:
    card = process_incident(incident)
    return card.reverse_prompt


@app.post("/incidents/batch", response_model=List[DashboardCard])
async def create_incident_batch(batch: BatchRequest) -> List[DashboardCard]:
    return [process_incident(incident) for incident in batch.incidents]


@app.get("/samples", response_model=List[EventRecord])
async def list_samples() -> List[EventRecord]:
    events = load_events()
    return [EventRecord(**event) for event in events]


@app.post("/demo/run", response_model=List[DashboardCard])
async def run_demo(request: DemoRequest) -> List[DashboardCard]:
    events = load_events()
    if not events:
        raise HTTPException(status_code=404, detail="No sample events found.")
    limit = request.limit or 5
    cards = []
    for event in events[:limit]:
        cards.append(process_incident(EventRecord(**event)))
    return cards


@app.post("/indexes/build")
async def build_rag_indexes() -> dict:
    try:
        event_count, playbook_count = build_indexes()
        return {"events": event_count, "playbooks": playbook_count}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
