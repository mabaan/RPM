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
    issues = []

    if not client:
        return GuardrailResult(passed=False, issues=["LLM client not available for guardrails validation"])

    system_prompt = (
        "You are a safety and compliance validator for AI-generated content. "
        "Validate this dashboard card for:\n"
        "1. Evidence grounding - all claims must have supporting evidence with sources\n"
        "2. Policy alignment - recommendations must align with provided playbooks\n"
        "3. Privacy and safety - no PII exposure, no harmful content\n"
        "4. Ethical boundaries - no promises, guarantees, or fault admissions\n"
        "5. Explainability - citations and references must be present\n"
        "\n"
        "Return JSON only: {\"pass\": true/false, \"issues\": [\"issue1\", \"issue2\", ...]}. "
        "Set pass=false if ANY validation fails. "
        "Be strict about evidence citations and policy alignment."
    )
    
    parsed = try_llm_json(
        client,
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": card.model_dump_json()},
        ],
    )
    
    if not parsed:
        return GuardrailResult(passed=False, issues=["Guardrails LLM failed to return valid response"])
    
    passed = parsed.get("pass", False)
    llm_issues = parsed.get("issues", [])
    
    if not passed:
        issues.extend(llm_issues)
    
    # Require citations check (minimal deterministic fallback)
    if not card.reverse_prompt.citations:
        issues.append("Missing citations in reverse prompt output")
    
    return GuardrailResult(passed=len(issues) == 0, issues=issues)
