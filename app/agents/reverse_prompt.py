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
        relevant_policy_excerpts.append(snippet.get("text", ""))
    
    # Similar cases would come from event retrieval
    similar_cases = [
        "See event history for patterns related to this topic"
    ]
    
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
    client: ChatClient | None = None,
) -> ReversePromptOutput:
    system_prompt = (
        "You create contextual background for an employee to understand a customer situation. "
        "Return JSON only. Provide evidence-based context, not instructions or prescriptive actions. "
        "Think of it as a system prompt for a human - give them the situation, evidence, and relevant policies."
    )

    playbook_text = "\n".join(item.get("text", "") for item in playbook_snippets)
    evidence_text = "\n".join(f"[{e.source} @ {e.timestamp}] {e.quote}" for e in signals.evidence)

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
        '"situation_background":"...describe the overall situation and routing context...",'
        '"customer_context":"...what is the customer experiencing and why they contacted us...",'
        '"evidence_analysis":["...quote with source...", "...another evidence point..."],'
        '"relevant_policy_excerpts":["...policy guidance from playbooks..."],'
        '"similar_cases":["...references to similar historical cases..."],'
        '"key_considerations":["...important context points for the employee..."]'
        "},"
        '"citations":{'
        '"evidence_sources":["source1", "source2"],'
        '"playbook_references":["playbook1", "playbook2"]'
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
