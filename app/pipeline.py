from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

from .agents.guardrails_verifier import verify_guardrails
from .agents.llm_client import get_local_client
from .agents.reverse_prompt import generate_reverse_prompt
from .agents.signal_extractor import extract_signals
from .rag.retrieve import retrieve_events, retrieve_playbooks
from .routing import route_incident
from .scoring import score_risk
from .schemas import DashboardCard, EventRecord, GuardrailResult

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = (ROOT_DIR / ".." / "data").resolve()


def _load_global_policy() -> str:
    policy_path = (DATA_DIR / "playbooks" / "GlobalPolicy.md").resolve()
    if policy_path.exists():
        return policy_path.read_text(encoding="utf-8")
    return ""


_GLOBAL_POLICY = _load_global_policy()


def _client_from_env(prefix: str, default_model: str, default_temperature: float, default_max_tokens: int):
    model = os.getenv(f"{prefix}_MODEL", default_model)
    temperature = float(os.getenv(f"{prefix}_TEMPERATURE", str(default_temperature)))
    max_tokens = int(os.getenv(f"{prefix}_MAX_TOKENS", str(default_max_tokens)))
    return get_local_client(model=model, temperature=temperature, max_tokens=max_tokens)


def process_incident(incident: EventRecord) -> DashboardCard:
    event_snippets = retrieve_events(incident.text, top_k=6)
    global_policy = _GLOBAL_POLICY

    signal_client = _client_from_env("AGENT1", "Qwen/Qwen2.5-32B-Instruct", 0.2, 800)
    signals = extract_signals(incident, event_snippets, global_policy, client=signal_client)

    scores = score_risk(signals, incident.metadata)
    routing = route_incident(signals, scores)

    # Retrieve playbooks from multiple relevant teams for better context
    relevant_teams = [routing.primary_team]
    
    # Add Finance playbook for billing-related issues
    if signals.topic == "billing" and routing.primary_team != "Finance":
        relevant_teams.append("Finance")
    
    # Add Legal playbook for compliance/legal risks
    if scores.compliance >= 60 and routing.primary_team != "Legal":
        relevant_teams.append("Legal")
    
    # Retrieve from all relevant teams
    playbook_snippets = []
    for team in relevant_teams:
        team_snippets = retrieve_playbooks(incident.text, team=team, top_k=3)
        playbook_snippets.extend(team_snippets)

    reverse_client = _client_from_env("AGENT3", "Qwen/Qwen2.5-32B-Instruct", 0.2, 800)
    reverse_prompt = generate_reverse_prompt(routing, scores, signals, playbook_snippets, client=reverse_client)

    temp_card = DashboardCard(
        incident=incident,
        signals=signals,
        scores=scores,
        routing=routing,
        reverse_prompt=reverse_prompt,
        guardrails=GuardrailResult(passed=True, issues=[]),
        status="pending",
    )

    guard_client = _client_from_env("GUARDRAILS", "Qwen/Qwen2.5-1.5B-Instruct", 0.1, 400)
    guardrails = verify_guardrails(temp_card, client=guard_client)

    status = "ready" if guardrails.passed else "blocked"

    return DashboardCard(
        incident=incident,
        signals=signals,
        scores=scores,
        routing=routing,
        reverse_prompt=reverse_prompt,
        guardrails=guardrails,
        status=status,
    )
