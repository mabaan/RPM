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
    """Process multiple sample incidents individually (for simple demo)"""
    events = load_events()
    if not events:
        raise HTTPException(status_code=404, detail="No sample events found")
    
    limit = request.limit or 5
    clean_cards = []
    
    for event in events[:limit]:
        card = process_incident(EventRecord(**event))
        clean_cards.append(_format_clean_card(card))
    
    return clean_cards


@app.post("/process/batch/collective")
async def process_collective_batch(request: ProcessRequest) -> dict:
    """Process multiple incidents collectively with pattern detection and aggregate analysis"""
    from .schemas import BatchAnalysis, IncidentCluster
    from collections import defaultdict
    
    events = load_events()
    if not events:
        raise HTTPException(status_code=404, detail="No sample events found")
    
    limit = request.limit or 5
    selected_events = events[:limit]
    
    # Process all events individually first
    dashboard_cards = []
    clean_cards = []
    for event in selected_events:
        card = process_incident(EventRecord(**event))
        dashboard_cards.append(card)
        clean_cards.append(_format_clean_card(card))
    
    # Collective analysis
    from .agents.llm_client import get_local_client
    client = get_local_client()
    
    # Build comprehensive incident summaries with all analysis data
    incident_summaries = []
    for i, card in enumerate(dashboard_cards):
        clean = clean_cards[i]
        rp = clean.reverse_prompt
        
        # Extract key policy excerpts and similar cases
        policy_excerpts = "\n      - ".join(rp.relevant_policy_excerpts[:3]) if rp.relevant_policy_excerpts else "None"
        similar = ", ".join(rp.similar_cases[:3]) if rp.similar_cases else "None"
        
        incident_summaries.append(
            f"""Event {i+1} [{card.incident.event_id}]:
    Text: {card.incident.text[:120]}...
    Classification: {card.signals.topic} | {card.signals.intent} | {card.signals.sentiment} | Urgency: {card.signals.urgency}
    Risk Scores: Virality={clean.risk_scores.virality}, Churn={clean.risk_scores.churn}, Compliance={clean.risk_scores.compliance}, Financial={clean.risk_scores.financial}, Operational={clean.risk_scores.operational}
    Routing: {card.routing.primary_team} (Priority: {card.routing.priority})
    Situation: {rp.situation_background[:150]}...
    Policy Excerpts:
      - {policy_excerpts}
    Similar Cases: {similar}
    Key Considerations: {"; ".join(rp.key_considerations[:2]) if rp.key_considerations else "None"}"""
        )
    
    pattern_prompt = f"""You are analyzing {len(incident_summaries)} customer incidents that have already been individually processed. Each incident has been classified, risk-scored, and analyzed for policy compliance.

INCIDENTS WITH COMPLETE ANALYSIS:
{chr(10).join(incident_summaries)}

COLLECTIVE ANALYSIS REQUIRED:
Analyze these incidents as a group to identify:

1. **INCIDENT CLUSTERS**: Group incidents with shared root causes or patterns. Look for:
   - Common topics/intents appearing multiple times
   - Similar policy violations across events
   - Shared keywords or phrases in customer complaints
   - Events routed to the same teams with similar risk profiles

2. **SYSTEMIC PATTERNS**: Identify organizational or technical issues affecting multiple customers:
   - Are multiple incidents caused by the same system bug/outage?
   - Do policy violations suggest non-compliance at company level?
   - Are high virality scores indicating brewing PR crisis?
   - Do similar_cases overlaps suggest recurring unresolved issues?

3. **POLICY VIOLATIONS**: Cross-reference all policy excerpts mentioned:
   - Which regulatory constraints (COUNTRY_LAW_, GDPR_, SLA_) are being violated?
   - Are violations isolated or widespread?
   - What's the compliance risk if not addressed immediately?

4. **IMMEDIATE ACTIONS**: Based on collective severity and patterns:
   - What urgent steps must be taken right now?
   - Should any systems be halted for investigation?
   - Do any customers need immediate outreach?
   - What preventive measures are needed?

5. **TEAM ALERTS**: Which teams need urgent notification and why:
   - Consider teams in routing decisions and watchers
   - Factor in risk scores (compliance, financial, operational)
   - Note which teams appear most frequently

Respond in this exact JSON format (use event indices 0-{len(incident_summaries)-1}):
{{
  "clusters": [
    {{"pattern": "duplicate billing charges", "event_indices": [0, 3, 5], "severity": "High", "teams": ["Finance", "Development/IT"], "keywords": ["billed twice", "duplicate charge"]}}
  ],
  "systemic_patterns": ["Multiple duplicate billing incidents with similar_cases overlaps suggest unresolved payment processor bug affecting recurring customers"],
  "policy_violations": [{{"event_index": 2, "violation": "Interest rate 20% exceeds COUNTRY_LAW_MAX_INTEREST_RATE cap of 15%"}}],
  "immediate_actions": ["Halt payment processor for emergency audit and duplicate charge investigation", "Issue proactive refunds to all affected customers", "Escalate to Legal for regulatory compliance review"],
  "team_alerts": {{"Finance": "5 billing incidents with High/Critical priority", "Development/IT": "System bug causing duplicate charges", "Legal": "2 policy violations requiring immediate remediation"}}
}}"""
    
    import json
    response = client.chat.completions.create(
        model="local-model",
        messages=[{"role": "user", "content": pattern_prompt}],
        temperature=0.3,
        max_tokens=1500,
    )
    
    try:
        analysis_json = json.loads(response.choices[0].message.content.strip())
    except:
        # Fallback if LLM doesn't return valid JSON
        analysis_json = {
            "clusters": [],
            "systemic_patterns": [],
            "policy_violations": [],
            "immediate_actions": [],
            "team_alerts": {}
        }
    
    # Build clusters with actual event IDs
    clusters = []
    for cluster_data in analysis_json.get("clusters", []):
        event_ids = [selected_events[i]["event_id"] for i in cluster_data.get("event_indices", []) if i < len(selected_events)]
        if event_ids:
            clusters.append(IncidentCluster(
                pattern=cluster_data.get("pattern", "Unknown pattern"),
                event_ids=event_ids,
                severity=cluster_data.get("severity", "Medium"),
                affected_teams=cluster_data.get("teams", []),
                common_keywords=cluster_data.get("keywords", [])
            ))
    
    # Calculate aggregates
    priority_breakdown = defaultdict(int)
    category_breakdown = defaultdict(int)
    aggregate_risks = {"virality": 0, "churn": 0, "compliance": 0, "financial": 0, "operational": 0}
    
    for card in clean_cards:
        priority_breakdown[card.priority] += 1
        category_breakdown[card.category] += 1
        for key in aggregate_risks:
            aggregate_risks[key] += getattr(card.risk_scores, key)
    
    # Average the risks
    for key in aggregate_risks:
        aggregate_risks[key] = round(aggregate_risks[key] / len(clean_cards))
    
    # Find highest risk events
    risk_scores_per_event = []
    for i, card in enumerate(clean_cards):
        total_risk = (card.risk_scores.virality + card.risk_scores.churn + 
                     card.risk_scores.compliance + card.risk_scores.financial + 
                     card.risk_scores.operational)
        risk_scores_per_event.append((selected_events[i]["event_id"], total_risk))
    
    risk_scores_per_event.sort(key=lambda x: x[1], reverse=True)
    highest_risk_event_ids = [event_id for event_id, _ in risk_scores_per_event[:5]]
    
    # Parse policy violations from LLM response
    policy_violations = []
    for violation_data in analysis_json.get("policy_violations", []):
        event_idx = violation_data.get("event_index")
        if event_idx is not None and event_idx < len(selected_events):
            policy_violations.append({
                "event_id": selected_events[event_idx]["event_id"],
                "violation": violation_data.get("violation", "Unknown violation")
            })
    
    batch_analysis = BatchAnalysis(
        incidents=clean_cards,
        total_processed=len(clean_cards),
        priority_breakdown=dict(priority_breakdown),
        category_breakdown=dict(category_breakdown),
        incident_clusters=clusters,
        aggregate_risks=aggregate_risks,
        highest_risk_event_ids=highest_risk_event_ids,
        systemic_patterns=analysis_json.get("systemic_patterns", []),
        policy_violations=policy_violations,
        immediate_actions=analysis_json.get("immediate_actions", []),
        team_alerts=analysis_json.get("team_alerts", {})
    )
    
    return batch_analysis.dict()


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
    
    return CleanDemoCard(
        title=title,
        category=card.signals.topic,
        priority=card.routing.priority,
        risk_scores=card.scores,
        reverse_prompt=card.reverse_prompt.employee_prompt,
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
