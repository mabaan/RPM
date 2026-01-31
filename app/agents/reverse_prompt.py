from __future__ import annotations

import os
from typing import Dict, List

from .llm_client import ChatClient, try_llm_json
from ..schemas import ReversePrompt, ReversePromptOutput, RoutingDecision, SignalExtraction, RiskScores


def _deterministic_prompt(
    routing: RoutingDecision,
    scores: RiskScores,
    signals: SignalExtraction,
    playbook_snippets: List[Dict[str, str]],
) -> ReversePromptOutput:
    primary_team = routing.primary_team
    playbook_point = playbook_snippets[0]["text"] if playbook_snippets else "Follow standard playbook guidance."
    evidence_quote = signals.evidence[0].quote if signals.evidence else ""

    summary = f"Route to {primary_team} with priority {routing.priority}. {signals.summary}"
    goal = "Provide a safe, empathetic response and gather the minimum information needed to resolve the issue."
    suggested_reply = (
        "Thanks for bringing this to our attention. I can help with this and will review the details "
        "from your report. To make sure we address it correctly, could you confirm the relevant account "
        "details and timeline?"
    )

    questions = [
        "Which account or order is affected?",
        "When did this start and what have you already tried?",
        "Is there any error message or reference ID?",
    ]

    checks = [
        "Review recent account activity and internal incident logs.",
        "Validate against current policies before making any commitments.",
    ]

    do_not_do = [
        "Do not promise refunds or specific outcomes.",
        "Do not admit fault or speculate on root cause.",
        "Do not request or expose sensitive personal data.",
    ]

    escalate_if = [
        "Legal or compliance threats are mentioned.",
        "Multiple customers report the same issue in a short time.",
        "The incident becomes public and high reach.",
    ]

    prompt = ReversePrompt(
        summary=summary,
        goal=goal,
        suggested_reply=suggested_reply,
        questions_to_ask=questions,
        checks_to_perform=checks,
        do_not_do=do_not_do,
        escalate_if=escalate_if,
    )

    return ReversePromptOutput(
        employee_prompt=prompt,
        citations={
            "evidence_quotes_used": [evidence_quote],
            "playbook_points_used": [playbook_point],
        },
    )


def generate_reverse_prompt(
    routing: RoutingDecision,
    scores: RiskScores,
    signals: SignalExtraction,
    playbook_snippets: List[Dict[str, str]],
    client: ChatClient | None = None,
) -> ReversePromptOutput:
    system_prompt = (
        "You create an employee-ready reverse prompt grounded in playbooks and evidence. "
        "Return JSON only. No promises, no admissions of fault, advisory only."
    )

    playbook_text = "\n".join(item.get("text", "") for item in playbook_snippets)
    evidence_text = "\n".join(f"{e.source}: {e.quote}" for e in signals.evidence)

    user_prompt = (
        "Routing decision:\n"
        f"{routing.model_dump()}\n\n"
        "Risk scores:\n"
        f"{scores.model_dump()}\n\n"
        "Signal summary:\n"
        f"{signals.summary}\n\n"
        "Evidence quotes:\n"
        f"{evidence_text}\n\n"
        "Playbook excerpts:\n"
        f"{playbook_text}\n\n"
        "Output JSON schema:\n"
        "{"
        '"employee_prompt":{'
        '"summary":"...",'
        '"goal":"...",'
        '"suggested_reply":"...",'
        '"questions_to_ask":["..."],'
        '"checks_to_perform":["..."],'
        '"do_not_do":["..."],'
        '"escalate_if":["..."]'
        "},"
        '"citations":{'
        '"evidence_quotes_used":["..."],'
        '"playbook_points_used":["..."]'
        "}"
        "}"
    )

    parsed = try_llm_json(client, [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}])
    if parsed:
        try:
            return ReversePromptOutput(**parsed)
        except Exception:
            pass

    strict = os.getenv("STRICT_LLM", "true").lower() in {"1", "true", "yes"}
    if strict:
        raise RuntimeError("LLM did not return valid JSON for reverse prompt generation.")

    return _deterministic_prompt(routing, scores, signals, playbook_snippets)
