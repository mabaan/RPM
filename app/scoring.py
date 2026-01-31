from __future__ import annotations

from typing import Optional

from .schemas import EventMetadata, RiskScores, SignalExtraction


def _clamp(value: int, low: int = 0, high: int = 100) -> int:
    return max(low, min(high, value))


def score_risk(signals: SignalExtraction, metadata: Optional[EventMetadata]) -> RiskScores:
    metadata = metadata or EventMetadata()

    virality = 0
    churn = 0
    compliance = 0
    financial = 0
    operational = 0

    if signals.signals.virality_threat:
        virality += 40
    if metadata.follower_count is not None and metadata.follower_count >= 50000:
        virality += 30
    if metadata.engagement_5min is not None and metadata.engagement_5min >= 20:
        virality += 10

    if signals.intent == "cancellation_threat":
        churn += 50

    if signals.intent == "legal_threat" or signals.signals.compliance_sensitive:
        compliance += 70

    # Technical issues get high operational risk
    if signals.topic in {"bug", "outage", "account"}:
        operational += 60
    
    # Bug reports affecting financial data get both operational and financial risk
    if signals.topic == "bug" and any(word in signals.summary.lower() for word in ["balance", "payment", "charge", "bill"]):
        operational += 20
        financial += 30

    if signals.topic == "billing" and signals.intent != "bug_report":
        financial += 25
    if signals.intent == "refund_request":
        financial += 15

    return RiskScores(
        virality=_clamp(virality),
        churn=_clamp(churn),
        compliance=_clamp(compliance),
        financial=_clamp(financial),
        operational=_clamp(operational),
    )


def priority_from_scores(scores: RiskScores) -> str:
    highest = max(scores.virality, scores.churn, scores.compliance, scores.financial, scores.operational)
    if highest >= 80:
        return "P0"
    if highest >= 60:
        return "P1"
    if highest >= 30:
        return "P2"
    return "P3"
