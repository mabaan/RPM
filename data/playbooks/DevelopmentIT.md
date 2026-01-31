# Development / IT Playbook

Version: 1.0
Owner: IT Operations Lead (demo)
Applies to: outages, defects, security events, integration failures, performance issues

## 1) Mission
Restore service, reduce customer impact, and provide accurate status updates to customer facing teams with minimal speculation.

## 2) Inputs From Dashboard
- incident summary and evidence
- affected product and channel
- priority level and risk indicators
- suspected scope (single customer vs widespread)
- reproduction details (if available)

## 3) Core Rules
- No guarantees on uptime or fix timelines.
- Do not share security sensitive details outside the incident channel.
- Write status updates in plain language for Customer Service and Marketing.
- Preserve evidence for suspected cyber incidents.

## 4) Standard Incident Workflow (SOP)
### Step 1: Classify the incident
- category: outage, degradation, bug, security, third party dependency
- scope: single customer, segment, global

### Step 2: Assign severity
Suggested mapping:
- Sev 0 (P0): widespread outage, payments blocked, security breach suspected
- Sev 1 (P1): major degradation, high volume errors
- Sev 2 (P2): limited impact bug
- Sev 3 (P3): cosmetic or low impact

### Step 3: Start incident record
- incident id
- start time and detection source
- impacted services and metrics
- initial hypothesis (marked as unconfirmed)

### Step 4: Triage and containment
- confirm issue using logs, monitoring, synthetic checks
- isolate blast radius
- apply safe mitigations (feature flag rollback, rate limit, failover)

### Step 5: Customer impact statement (for Customer Service)
Provide a short update:
- what is impacted (example: card payments, login)
- who is impacted (some customers, all customers)
- when it started (approx)
- current status (investigating, mitigation applied, monitoring)

### Step 6: Resolution and validation
- confirm fix in monitoring
- validate key customer journeys
- coordinate with Customer Service to close affected tickets

### Step 7: Post incident review (RCA)
- timeline
- root cause
- corrective actions
- prevention tasks
- communications review

## 5) Security Incident Mini SOP
Triggers:
- account takeover pattern
- unusual login spikes
- data exposure suspicion
- phishing campaigns impersonating the bank
Actions:
- contain immediately
- preserve logs and evidence
- notify Management and Legal
- limit internal access to need to know
- prepare customer facing safe language with Marketing and Legal if public

## 6) Technology Risk and Reporting Readiness
- maintain a plan for major security breaches and technology related fraud
- document decisions, mitigations, and confirmations
- coordinate with Management for any regulatory reporting obligations

## 7) Handoffs
To Customer Service:
- provide an approved status update every 30 to 60 minutes for P0/P1 (or per management guidance)

To Product:
- share validated defect details, affected versions, and user impact

To Marketing:
- only share customer safe statements, no internal root cause unless approved

To Finance:
- share confirmed payment failure windows and impacted transaction types

## 8) What Not To Do
- do not disclose internal architecture publicly
- do not claim the issue is resolved until monitoring and user journey tests confirm
- do not provide timelines as promises
- do not blame vendors without evidence and management approval

## 9) How Agent 3 Should Use This Playbook
- generate reverse prompt focused on:
  - reproduction steps request
  - logging checklist
  - immediate containment actions
  - status update text for Customer Service
  - escalation and incident command suggestions
