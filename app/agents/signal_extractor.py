from __future__ import annotations

import os
from typing import Dict, List

from .llm_client import ChatClient, try_llm_json
from ..schemas import EvidenceQuote, EventRecord, SignalExtraction, SignalFlags


def _heuristic_signals(incident: EventRecord) -> SignalExtraction:
    text = incident.text.lower()

    topic = "other"
    # Check for bugs/technical issues first (more specific)
    if any(word in text for word in ["bug", "error", "crash", "broken", "not working", "incorrect", "wrong", "glitch"]):
        topic = "bug"
    elif any(word in text for word in ["bill", "charge", "invoice", "price"]) and "bug" not in text and "error" not in text:
        topic = "billing"
    elif any(word in text for word in ["outage", "down", "offline", "service unavailable"]):
        topic = "outage"
    elif any(word in text for word in ["account", "login", "password", "locked"]):
        topic = "account"
    elif any(word in text for word in ["fraud", "scam", "unauthorized", "stolen"]):
        topic = "fraud"
    elif "policy" in text:
        topic = "policy"
    elif any(word in text for word in ["support", "service", "agent", "help"]):
        topic = "service"

    intent = "other"
    if any(word in text for word in ["bug", "error", "broken", "crash", "glitch"]):
        intent = "bug_report"
    elif any(word in text for word in ["refund", "chargeback", "money back"]):
        intent = "refund_request"
    elif any(word in text for word in ["cancel", "close my account", "leaving"]):
        intent = "cancellation_threat"
    elif any(word in text for word in ["lawyer", "legal", "regulator", "lawsuit"]):
        intent = "legal_threat"
    elif any(word in text for word in ["why", "how", "can you", "what is"]):
        intent = "information_request"

    sentiment = "neutral"
    if any(word in text for word in ["angry", "upset", "terrible", "unacceptable", "frustrated"]):
        sentiment = "negative"
    elif any(word in text for word in ["thanks", "appreciate", "great", "love"]):
        sentiment = "positive"

    urgency = "low"
    if any(word in text for word in ["urgent", "immediately", "asap", "now", "right away"]):
        urgency = "high"
    elif any(word in text for word in ["soon", "quick", "today"]):
        urgency = "medium"

    metadata = incident.metadata
    follower_count = metadata.follower_count if metadata else 0
    high_reach = follower_count is not None and follower_count >= 50000

    signals = SignalFlags(
        virality_threat=high_reach or "viral" in text or "share" in text,
        repeat_contact=(metadata.repeat_contact if metadata else False) or "again" in text,
        high_reach=high_reach,
        compliance_sensitive=any(word in text for word in ["regulator", "gdpr", "privacy", "compliance", "law"]),
    )

    quote = incident.text[:240]
    evidence = [EvidenceQuote(source=incident.source, timestamp=incident.timestamp, quote=quote)]

    summary = " ".join(incident.text.split()[:18])
    if len(summary) < len(incident.text):
        summary = summary.rstrip(".") + "..."

    return SignalExtraction(
        topic=topic,
        intent=intent,
        sentiment=sentiment,
        urgency=urgency,
        signals=signals,
        evidence=evidence,
        summary=summary,
    )


def extract_signals(
    incident: EventRecord,
    event_snippets: List[Dict[str, str]],
    global_policy: str,
    client: ChatClient | None = None,
) -> SignalExtraction:
    system_prompt = (
        "You are an expert analyst extracting structured signals from customer incidents. "
        "Analyze the incident carefully and classify it correctly:\n"
        "- 'bug': Software errors, incorrect displays, crashes, glitches, broken features\n"
        "- 'billing': Payment disputes, charges, invoices (NOT if it's a bug showing wrong amounts)\n"
        "- 'outage': Service down, offline, unavailable\n"
        "- 'account': Login, password, access issues\n"
        "- 'fraud': Scams, unauthorized transactions, stolen data\n"
        "- 'policy': Policy questions, compliance, legal matters\n"
        "- 'service': General support requests\n"
        "\n"
        "Intent classification:\n"
        "- 'bug_report': Customer reporting a technical issue or malfunction\n"
        "- 'legal_threat': Mentions lawyer, lawsuit, regulator\n"
        "- 'cancellation_threat': Threatening to leave or close account\n"
        "- 'refund_request': Asking for money back\n"
        "- 'complaint': General dissatisfaction\n"
        "- 'information_request': Asking questions\n"
        "\n"
        "Return ONLY valid JSON matching the schema."
    )

    snippets_text = "\n".join(
        f"[{item.get('source','')}] {item.get('timestamp','')}: {item.get('text','')}" for item in event_snippets
    )

    user_prompt = (
        "Incident:\n"
        f"{incident.model_dump()}\n\n"
        "Event snippets (historical context):\n"
        f"{snippets_text}\n\n"
        "Global policy excerpt:\n"
        f"{global_policy}\n\n"
        "Analyze the incident and return JSON:\n"
        "{\n"
        '  "topic": "bug|billing|outage|account|fraud|policy|service|other",\n'
        '  "intent": "bug_report|complaint|refund_request|cancellation_threat|legal_threat|information_request|other",\n'
        '  "sentiment": "positive|neutral|negative",\n'
        '  "urgency": "low|medium|high",\n'
        '  "signals": {\n'
        '    "virality_threat": true/false,\n'
        '    "repeat_contact": true/false,\n'
        '    "high_reach": true/false,\n'
        '    "compliance_sensitive": true/false\n'
        '  },\n'
        '  "evidence": [{"source": "email", "timestamp": "2026-01-31T10:05:00Z", "quote": "exact quote from incident"}],\n'
        '  "summary": "One sentence summarizing the issue."\n'
        "}"
    )

    parsed = try_llm_json(client, [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}])
    if parsed:
        try:
            return SignalExtraction(**parsed)
        except Exception:
            pass

    strict = os.getenv("STRICT_LLM", "true").lower() in {"1", "true", "yes"}
    if strict:
        raise RuntimeError("LLM did not return valid JSON for signal extraction.")

    return _heuristic_signals(incident)
