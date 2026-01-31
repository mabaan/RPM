from __future__ import annotations

import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .agents.llm_client import warm_start_models
from .pipeline import process_incident
from .rag.retrieve import build_indexes, load_events
from .schemas import CleanDemoCard, DashboardCard, EventRecord, ReversePromptOutput

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
    auto_load = os.getenv("AUTO_LOAD_MODELS", "false").lower() in {"1", "true", "yes"}
    if auto_load:
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


@app.post("/demo/run", response_model=List[CleanDemoCard])
async def run_demo(request: DemoRequest) -> List[CleanDemoCard]:
    events = load_events()
    if not events:
        raise HTTPException(status_code=404, detail="No sample events found.")
    limit = request.limit or 5
    
    clean_cards = []
    for event in events[:limit]:
        card = process_incident(EventRecord(**event))
        
        clean_card = CleanDemoCard(
            event_id=card.incident.event_id,
            source=card.incident.source,
            text=card.incident.text,
            assigned_to=card.routing.primary_team,
            priority=card.routing.priority,
            watchers=card.routing.watchers,
            risk_scores=card.scores,
            topic=card.signals.topic,
            sentiment=card.signals.sentiment,
            urgency=card.signals.urgency,
            situation_background=card.reverse_prompt.employee_prompt.situation_background,
            customer_context=card.reverse_prompt.employee_prompt.customer_context,
            evidence_analysis=card.reverse_prompt.employee_prompt.evidence_analysis,
            relevant_policy_excerpts=card.reverse_prompt.employee_prompt.relevant_policy_excerpts,
            similar_cases=card.reverse_prompt.employee_prompt.similar_cases,
            key_considerations=card.reverse_prompt.employee_prompt.key_considerations,
            status=card.status,
            guardrails_passed=card.guardrails.passed,
        )
        clean_cards.append(clean_card)
    
    return clean_cards


@app.post("/models/download")
async def download_models() -> dict:
    try:
        warm_start_models()
        return {"status": "success", "message": "Models downloaded and loaded successfully"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/indexes/build")
async def build_rag_indexes() -> dict:
    try:
        event_count, playbook_count = build_indexes()
        return {"events": event_count, "playbooks": playbook_count}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
