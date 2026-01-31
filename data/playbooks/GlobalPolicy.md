# Global Policy (Applies to All Teams)

Version: 1.0
Owner: Management + Legal (demo)
Applies to: AI assisted incident triage and reverse prompts
Mode: Advisory only (read only). No automated external actions.

## 1) Purpose
This policy defines the global guardrails for how incidents are analyzed and how reverse prompts are generated and used by employees. It ensures:
- consumer protection and fair treatment
- privacy and data minimization
- evidence based, explainable recommendations
- controlled escalation for high risk cases

## 2) What This System Is
- A triage assistant that summarizes, routes, and drafts employee guidance.
- It does not take actions on behalf of customers.
- It does not approve refunds, reversals, or fee waivers.
- It does not make legal determinations.
- It does not contact regulators.

## 3) Evidence Requirement (Explainability)
All important claims in dashboards and reverse prompts must be supported by evidence:
- use short quotes from the incident thread or retrieved history
- include source and timestamp
- never infer facts that are not supported by evidence

If evidence is missing, the reverse prompt must say: "Not enough evidence. Ask for X" or "Investigate in system Y".

## 4) Data Handling and Privacy
### 4.1 Data minimization
- request the minimum information needed to resolve the issue
- avoid collecting sensitive personal data unless mandatory for the process

### 4.2 Never ask for or store
- OTPs, PINs, CVV, full card numbers
- passwords or security answers
- full national ID images unless the official process explicitly requires it (and only through approved channels)

### 4.3 Masking and redaction
- the ingestion layer should mask obvious identifiers when not required
- the dashboard should display only partial identifiers (example: last 4 digits)

### 4.4 Personal data rights (PDPL awareness)
If the customer asks about their personal data, access, deletion, or correction:
- acknowledge
- route to Legal (and Data Privacy owner if applicable)
- do not promise immediate deletion or outcomes

## 5) Communication Rules (All Teams)
### 5.1 Allowed language
- neutral and helpful
- acknowledge impact without admitting fault
- provide clear next steps and timelines as estimates

### 5.2 Not allowed language
- admissions of fault (example: "We caused this")
- guarantees (example: "This will never happen again")
- promises (example: "Refund will be approved")
- speculation (example: "It is probably a system bug")
- statements that could be interpreted as legal advice

### 5.3 Public statements
- only Marketing + Management can post externally, with Legal approval for high risk cases
- never disclose internal incidents, root cause, or security details publicly

## 6) Complaint Handling Baselines (Operational Targets)
These are operational baselines for the demo and should be aligned with internal policy:
- acknowledge receipt of complaints quickly (target within 2 business days)
- provide a reference ID and explain the complaint process
- document actions and outcomes for auditability

## 7) AML and Fraud Safety
If the incident includes suspected fraud, unauthorized transactions, or suspicious activity:
- do not ask the customer to share sensitive credentials
- route to Legal (and Fraud/Compliance function if your org has one)
- if internal reporting is required, follow the internal suspicious activity workflow and approved reporting channels

## 8) Technology and Security Incidents
If there is:
- suspected data leakage
- account takeover
- phishing or malware
- major service outage
Then:
- route to Development/IT and Management immediately (P0)
- preserve evidence
- avoid public details, avoid blaming third parties
- Legal must review any customer facing language for high impact incidents

## 9) Escalation Matrix (High Level)
P0 triggers (immediate escalation):
- high reach social post with strong negative sentiment
- legal threat, regulator mention, press mention
- large scale outage or widespread payment failure
- suspected data breach or account takeover
- customer harm or safety risk
- repeated unresolved contact with churn threat

P1 triggers (rapid escalation):
- fee dispute with high value impact
- multiple customers reporting the same defect
- influencer or verified account complaint
- product defect with reputational risk

## 10) Reverse Prompt Standard Output Shape
Every reverse prompt must include:
- 1 sentence summary
- employee goal
- what to say (draft message)
- what to ask (questions)
- what to check (internal systems)
- do not do list
- escalate if conditions
- citations (evidence quotes and playbook sections)

## 11) Audit Logging
For each incident card, store:
- inputs (source, timestamp, thread id)
- retrieved snippets ids
- agent outputs (JSON)
- scoring and routing rationale
- guardrails verdict and issues (if any)

## 12) If This Conflicts With Any Team Playbook
GlobalPolicy overrides. If uncertain, route to Legal + Management.
