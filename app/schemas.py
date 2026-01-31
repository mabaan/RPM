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
    situation_background: str
    customer_context: str
    evidence_analysis: List[str]
    relevant_policy_excerpts: List[str]
    similar_cases: List[str]
    key_considerations: List[str]


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
    
    # Title and metadata
    title: str  # Brief incident title
    category: str  # Topic/category
    priority: str  # P1, P2, P3
    
    # Metrics
    risk_scores: RiskScores
    
    # Reverse Prompt - Contextual background for employee
    reverse_prompt: ReversePrompt
    
    # Supporting evidence and references
    evidence_snippets: List[str]  # Evidence with sources
    policy_references: List[str]  # Relevant policies from RAG
    similar_cases: List[str]  # Similar historical cases
