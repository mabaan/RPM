from __future__ import annotations

import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Path
from pydantic import BaseModel

from .agents.llm_client import warm_start_models
from .pipeline import process_incident
from .rag.retrieve import build_indexes, load_events
from .schemas import CleanDemoCard, DashboardCard, EventRecord

app = FastAPI(title="Customer Incident Radar", version="0.1.0")


class ProcessRequest(BaseModel):
    limit: Optional[int] = 5


@app.get("/health")
async def health() -> dict:
    """Health check endpoint"""
    return {"status": "ok"}


@app.on_event("startup")
async def load_models() -> None:
    auto_load = os.getenv("AUTO_LOAD_MODELS", "false").lower() in {"1", "true", "yes"}
    if auto_load:
        warm_start_models()


# ========== Core Processing Endpoints ==========


@app.post("/process", response_model=CleanDemoCard)
async def process_custom_incident(incident: EventRecord) -> CleanDemoCard:
    """Process a custom incident and return structured analysis"""
    card = process_incident(incident)
    return _format_clean_card(card)


@app.get("/process/{event_id}", response_model=CleanDemoCard)
async def process_by_event_id(
    event_id: str = Path(..., description="Event ID from samples")
) -> CleanDemoCard:
    """Process a specific event by its ID from the samples"""
    events = load_events()
    event_data = next((e for e in events if e.get("event_id") == event_id), None)
    
    if not event_data:
        raise HTTPException(
            status_code=404,
            detail=f"Event '{event_id}' not found in samples"
        )
    
    incident = EventRecord(**event_data)
    card = process_incident(incident)
    return _format_clean_card(card)


@app.post("/process/batch", response_model=List[CleanDemoCard])
async def process_multiple(request: ProcessRequest) -> List[CleanDemoCard]:
    """Process multiple sample incidents (demo mode)"""
    events = load_events()
    if not events:
        raise HTTPException(status_code=404, detail="No sample events found")
    
    limit = request.limit or 5
    clean_cards = []
    
    for event in events[:limit]:
        card = process_incident(EventRecord(**event))
        clean_cards.append(_format_clean_card(card))
    
    return clean_cards


# ========== Utility Endpoints ==========


@app.get("/samples", response_model=List[dict])
async def list_available_samples() -> List[dict]:
    """List all available sample events with their IDs"""
    events = load_events()
    return [
        {
            "event_id": e.get("event_id"),
            "source": e.get("source"),
            "text": e.get("text", "")[:100] + "..." if len(e.get("text", "")) > 100 else e.get("text", ""),
        }
        for e in events
    ]


@app.post("/models/download")
async def download_models() -> dict:
    """Download and load AI models into memory"""
    try:
        warm_start_models()
        return {"status": "success", "message": "Models downloaded and loaded successfully"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/indexes/build")
async def build_rag_indexes() -> dict:
    """Build RAG indexes from playbooks and sample data"""
    try:
        event_count, playbook_count = build_indexes()
        return {"events": event_count, "playbooks": playbook_count}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ========== Helper Functions ==========


def _format_clean_card(card: DashboardCard) -> CleanDemoCard:
    """Format a DashboardCard into clean output format"""
    title = card.signals.summary[:80] + "..." if len(card.signals.summary) > 80 else card.signals.summary
    
    evidence_snippets = [
        f"[{ev.source} @ {ev.timestamp}] {ev.quote}"
        for ev in card.signals.evidence
    ]
    
    policy_refs = card.reverse_prompt.citations.get("playbook_references", [])
    policy_references = [ref for ref in policy_refs if ref]
    
    return CleanDemoCard(
        title=title,
        category=card.signals.topic,
        priority=card.routing.priority,
        risk_scores=card.scores,
        reverse_prompt=card.reverse_prompt.employee_prompt,
        evidence_snippets=evidence_snippets,
        policy_references=policy_references,
        similar_cases=card.reverse_prompt.employee_prompt.similar_cases,
    )
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
