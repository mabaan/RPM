from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field

TEAM_LIST = [
    "HR",
    "Customer Service",
    "Development / IT",
    "Finance",
    "Product",
    "Marketing",
    "Management",
    "Legal",
]


class EventMetadata(BaseModel):
    ticket_id: Optional[str] = None
    product: Optional[str] = None
    follower_count: Optional[int] = None
    engagement_5min: Optional[int] = None
    repeat_contact: Optional[bool] = None


class EventRecord(BaseModel):
    event_id: str
    source: str
    timestamp: str
    actor_type: str
    actor_id: str
    thread_id: str
    text: str
    metadata: Optional[EventMetadata] = None


class EvidenceQuote(BaseModel):
    source: str
    timestamp: str
    quote: str


class SignalFlags(BaseModel):
    virality_threat: bool
    repeat_contact: bool
    high_reach: bool
    compliance_sensitive: bool


class SignalExtraction(BaseModel):
    topic: str
    intent: str
    sentiment: str
    urgency: str
    signals: SignalFlags
    evidence: List[EvidenceQuote]
    summary: str


class RiskScores(BaseModel):
    virality: int = Field(ge=0, le=100)
    churn: int = Field(ge=0, le=100)
    compliance: int = Field(ge=0, le=100)
    financial: int = Field(ge=0, le=100)
    operational: int = Field(ge=0, le=100)


class RoutingDecision(BaseModel):
    primary_team: str
    watchers: List[str]
    priority: str


class ReversePrompt(BaseModel):
    summary: str
    goal: str
    suggested_reply: str
    questions_to_ask: List[str]
    checks_to_perform: List[str]
    do_not_do: List[str]
    escalate_if: List[str]


class ReversePromptOutput(BaseModel):
    employee_prompt: ReversePrompt
    citations: dict


class GuardrailResult(BaseModel):
    passed: bool
    issues: List[str]


class DashboardCard(BaseModel):
    incident: EventRecord
    signals: SignalExtraction
    scores: RiskScores
    routing: RoutingDecision
    reverse_prompt: ReversePromptOutput
    guardrails: GuardrailResult
    status: str


class CleanDemoCard(BaseModel):
    """Formatted output for demo display"""
    event_id: str
    source: str
    text: str
    
    # Routing
    assigned_to: str
    priority: str
    watchers: List[str]
    
    # Risk Scores
    risk_scores: RiskScores
    
    # Signals
    topic: str
    sentiment: str
    urgency: str
    
    # Reverse Prompt
    summary: str
    goal: str
    suggested_reply: str
    questions_to_ask: List[str]
    checks_to_perform: List[str]
    do_not_do: List[str]
    escalate_if: List[str]
    
    # Evidence
    evidence_snippets: List[str]
    
    # Status
    status: str
    guardrails_passed: bool
