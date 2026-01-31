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
    event_snippets: List[Dict[str, str]],
) -> ReversePromptOutput:
    primary_team = routing.primary_team
    
    # Build contextual background
    situation_background = (
        f"This {signals.topic} case has been routed to {primary_team} with {routing.priority} priority. "
        f"Customer sentiment appears {signals.sentiment} with {signals.urgency} urgency. "
        f"Risk profile: virality={scores.virality}, churn={scores.churn}, compliance={scores.compliance}."
    )
    
    customer_context = signals.summary
    
    # Extract evidence with references
    evidence_analysis = []
    for ev in signals.evidence:
        evidence_analysis.append(f"[{ev.source} @ {ev.timestamp}] {ev.quote}")
    
    # Policy excerpts from RAG
    relevant_policy_excerpts = []
    for snippet in playbook_snippets[:3]:
        text = snippet.get("text", "")
        if text:
            relevant_policy_excerpts.append(text[:300])  # Truncate long policies
    
    # Extract event IDs from similar events retrieved by RAG
    similar_cases = []
    for event in event_snippets[:5]:
        event_id = event.get("event_id")
        if event_id:
            similar_cases.append(event_id)
    
    if not similar_cases:
        similar_cases.append("No similar historical events found")
    
    # Key considerations based on routing and signals
    key_considerations = [
        f"Case routed to {primary_team} based on {signals.topic} topic",
        f"Priority set to {routing.priority} due to risk factors",
        f"Watchers: {', '.join(routing.watchers) if routing.watchers else 'None'}",
    ]
    
    prompt = ReversePrompt(
        situation_background=situation_background,
        customer_context=customer_context,
        evidence_analysis=evidence_analysis,
        relevant_policy_excerpts=relevant_policy_excerpts,
        similar_cases=similar_cases,
        key_considerations=key_considerations,
    )
    
    return ReversePromptOutput(
        employee_prompt=prompt,
        citations={
            "evidence_sources": [ev.source for ev in signals.evidence],
            "playbook_references": [s.get("source", "") for s in playbook_snippets],
        },
    )


def generate_reverse_prompt(
    routing: RoutingDecision,
    scores: RiskScores,
    signals: SignalExtraction,
    playbook_snippets: List[Dict[str, str]],
    event_snippets: List[Dict[str, str]],
    client: ChatClient | None = None,
) -> ReversePromptOutput:
    system_prompt = (
        "You create contextual background for an employee to understand a customer situation. "
        "This is like writing a system prompt for a human - give them the full context they need.\n\n"
        "CRITICAL ANALYSIS REQUIRED:\n"
        "1. Check if customer statements reveal POLICY VIOLATIONS (e.g., interest rates exceeding legal caps, fee violations)\n"
        "2. Compare customer claims against regulatory constraints in playbooks (look for COUNTRY_LAW_, GDPR_, etc.)\n"
        "3. Highlight any discrepancies between what customer says and what policies allow\n"
        "4. For bugs/technical issues: assess potential widespread impact and urgency\n\n"
        "Provide evidence-based context, not prescriptive instructions. "
        "Return ONLY valid JSON."
    )

    playbook_text = "\n".join(item.get("text", "") for item in playbook_snippets)
    evidence_text = "\n".join(f"[{e.source} @ {e.timestamp}] {e.quote}" for e in signals.evidence)
    
    # Extract event IDs from similar historical events
    similar_event_ids = [event.get("event_id", "") for event in event_snippets[:5] if event.get("event_id")]

    user_prompt = (
        "Routing decision:\n"
        f"{routing.model_dump()}\n\n"
        "Risk scores:\n"
        f"{scores.model_dump()}\n\n"
        "Signal summary:\n"
        f"{signals.summary}\n\n"
        "Evidence quotes:\n"
        f"{evidence_text}\n\n"
        "Playbook excerpts (CHECK FOR REGULATORY CONSTRAINTS):\n"
        f"{playbook_text}\n\n"
        "Similar historical event IDs (from RAG retrieval):\n"
        f"{', '.join(similar_event_ids) if similar_event_ids else 'None'}\n\n"
        "Analyze and return JSON:\n"
        "{\n"
        '  "employee_prompt": {\n'
        '    "situation_background": "Describe routing, priority, risk profile, and WHY (cite specific risk factors)",\n'
        '    "customer_context": "What is the customer experiencing and claiming? Be specific.",\n'
        '    "evidence_analysis": ["Direct quotes with sources supporting key claims"],\n'
        '    "relevant_policy_excerpts": ["Key policies/constraints from playbooks - INCLUDE REGULATORY LIMITS"],\n'
        f'    "similar_cases": {similar_event_ids if similar_event_ids else ["No similar events"]},\n'
        '    "key_considerations": ["Critical context points - flag violations, compliance risks, escalation triggers"]\n'
        '  },\n'
        '  "citations": {\n'
        '    "evidence_sources": ["source1", "source2"],\n'
        '    "playbook_references": ["playbook1", "playbook2"]\n'
        '  }\n'
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

    return _deterministic_prompt(routing, scores, signals, playbook_snippets, event_snippets)
