from __future__ import annotations

import re
from typing import List, Optional

from .llm_client import ChatClient, try_llm_json
from ..schemas import DashboardCard, GuardrailResult, TEAM_LIST


FORBIDDEN_PHRASES = [
    "guarantee",
    "promise",
    "admit",
    "fault",
    "refund",
    "chargeback",
]

EMAIL_PATTERN = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.IGNORECASE)
PHONE_PATTERN = re.compile(r"\b\+?\d[\d\s\-().]{8,}\d\b")


def _deterministic_checks(card: DashboardCard) -> List[str]:
    issues: List[str] = []
    prompt = card.reverse_prompt.employee_prompt

    check_text = " ".join(
        [
            prompt.summary,
            prompt.goal,
            prompt.suggested_reply,
            " ".join(prompt.questions_to_ask),
            " ".join(prompt.checks_to_perform),
            " ".join(prompt.escalate_if),
        ]
    ).lower()

    for phrase in FORBIDDEN_PHRASES:
        if phrase in check_text:
            issues.append(f"Forbidden phrase detected: {phrase}")

    pii_text = " ".join(
        [
            check_text,
            " ".join(prompt.do_not_do).lower(),
        ]
    )
    if EMAIL_PATTERN.search(pii_text) or PHONE_PATTERN.search(pii_text):
        issues.append("Potential PII detected in output.")

    if not card.reverse_prompt.citations.get("evidence_quotes_used"):
        issues.append("Missing evidence citations.")

    if not prompt.do_not_do:
        issues.append("Missing do_not_do guidance.")

    if card.routing.primary_team not in TEAM_LIST:
        issues.append("Routing team not in allowed list.")

    return issues


def verify_guardrails(
    card: DashboardCard,
    client: Optional[ChatClient] = None,
) -> GuardrailResult:
    issues = _deterministic_checks(card)

    if client:
        prompt = (
            "Validate this dashboard card for safety, evidence, and policy. "
            "Return JSON only: {\"pass\": true/false, \"issues\": [..]}. "
            "Fail if any suggestion implies taking action outside read-only scope, "
            "if claims lack evidence, or if language is overly certain for legal/marketing."
        )
        parsed = try_llm_json(
            client,
            [
                {"role": "system", "content": prompt},
                {"role": "user", "content": card.model_dump_json()},
            ],
        )
        if parsed:
            if not parsed.get("pass", True):
                issues.extend(parsed.get("issues", []))

    return GuardrailResult(passed=len(issues) == 0, issues=issues)
