from __future__ import annotations

from .schemas import RoutingDecision, SignalExtraction, TEAM_LIST
from .scoring import priority_from_scores
from .schemas import RiskScores


def route_incident(signals: SignalExtraction, scores: RiskScores) -> RoutingDecision:
    priority = priority_from_scores(scores)
    watchers = []

    if scores.compliance >= 60 or signals.intent == "legal_threat":
        primary = "Legal"
        watchers = ["Management"]
    elif signals.topic == "bug" or signals.intent == "bug_report":
        primary = "Development / IT"
        watchers = ["Product", "Customer Service"]
    elif signals.topic in {"outage", "account"}:
        primary = "Development / IT"
        watchers = ["Customer Service"]
    elif signals.topic == "billing":
        primary = "Finance"
        watchers = ["Customer Service"]
    elif scores.virality >= 60:
        primary = "Marketing"
        watchers = ["Legal", "Management"]
    else:
        primary = "Customer Service"

    watchers = [team for team in watchers if team in TEAM_LIST and team != primary]

    return RoutingDecision(
        primary_team=primary,
        watchers=watchers,
        priority=priority,
    )
