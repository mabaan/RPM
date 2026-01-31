# Customer Service Playbook

Version: 1.0
Owner: Customer Service Lead (demo)
Applies to: All customer facing channels (chat, email, phone, social DMs)

## 1) Mission
Resolve customer issues quickly, fairly, and safely while protecting the bank and the customer. Use the reverse prompt as guidance, then apply human judgment.

## 2) Input From Dashboard
You will receive:
- incident summary and evidence quotes
- priority (P0 to P3) and routing rationale
- recommended next steps
- reverse prompt draft response
- what to ask, what to check, and escalation criteria

## 3) Core Rules
- Be empathetic without admitting fault.
- Never request OTP, PIN, CVV, password.
- Verify identity before discussing account specifics.
- Provide a reference number and clear next step.
- If the customer threatens social media, treat as reputational risk and escalate per Section 8.

## 4) Standard Triage Workflow (SOP)
### Step 1: Read and confirm scope
- Read incident summary and evidence quotes.
- Confirm the topic (billing, service, fraud, access, complaint, other).

### Step 2: Determine if identity verification is required
If the customer requests account specific details or actions:
- ask for minimal identifiers through the approved channel (example: last 4 digits, registered phone confirmation, ticket id)
- follow existing verification script

If it is a general status update (outage info) with no account details:
- you can respond without identity verification

### Step 3: Acknowledge and set expectations
- acknowledge the issue
- state the immediate action you will take
- provide an estimated timeline without guarantees

### Step 4: Gather missing info (only what is necessary)
Common minimal questions:
- product type (card, account, app, transfer, loan)
- date/time of issue
- error message or screenshot (if applicable)
- channel used (app, web, ATM, branch)
- location and device type (for app issues)

### Step 5: Use internal checks
- check ticket history for repeat contact
- check incident status board for known outages
- check case notes for previous commitments or deadlines

### Step 6: Resolve or escalate
- resolve if within scope and low risk
- escalate if triggers match Section 8 and Section 9

### Step 7: Close loop
- summarize what was done
- confirm next step and follow up plan
- document the outcome in the case record

## 5) Complaint Handling (Customer Protection Mindset)
If the customer says they are making a complaint:
- acknowledge the complaint
- provide a complaint reference id
- explain the complaint handling process and expected timelines (as estimates)
- do not charge for complaint handling
- if unresolved, provide the escalation path (Management and the official complaint resolution path)

## 6) High Risk Patterns and How to Respond
### 6.1 Cancellation or churn threat
- acknowledge
- prioritize immediate resolution or escalations
- avoid defensive language

### 6.2 Social media threat
Example: "I will post this on X"
- respond calmly
- confirm you will investigate
- escalate to Marketing + Management if reach is high or sentiment is extreme

### 6.3 Legal threat
Example: "I will sue"
- acknowledge
- do not debate
- escalate to Legal + Management
- do not provide legal conclusions

### 6.4 Fraud or unauthorized transaction
- instruct customer not to share credentials
- advise safe steps (freeze card, change password) only if official process exists
- escalate to Legal / Fraud handling function and Finance as needed
- document evidence

## 7) Approved Response Templates (Use and adapt)
### 7.1 Generic acknowledgement
"Thank you for reaching out. I understand this has been frustrating. I am reviewing the details now and will update you with the next step. To proceed safely, I may ask for minimal verification information through this channel."

### 7.2 Known outage update
"Thank you for reporting this. We are aware of a service issue affecting some customers. Our technical team is working on it. I will keep your case open and update you as soon as we have confirmed progress."

### 7.3 Billing dispute
"Thank you for flagging this. I will review the billing records and confirm what happened. If additional details are needed, I will request the minimum required to investigate."

### 7.4 Complaint confirmation
"I have recorded your complaint and created reference ID: {ID}. We will review it and update you. If you would like, I can share the steps of our complaint handling process and what information we may need."

## 8) Escalation Triggers
Escalate to Management immediately (P0/P1):
- high reach SNS mention, verified account, influencer
- repeated unresolved contact, churn threat
- system wide outage confirmed or suspected
- data privacy concern or suspected data exposure

Escalate to Legal:
- legal threat, regulator mention, press mention
- allegations of discrimination, harassment, or serious misconduct
- requests about personal data deletion, access, or automated decision objections

Escalate to Development/IT:
- app access issues with widespread pattern
- repeated errors with reproduction steps
- suspected security incident or account takeover

Escalate to Finance:
- fee disputes, payment failures, refund requests, chargebacks indicators

## 9) What Not To Do
- do not promise refunds, reversals, compensation
- do not state root cause unless confirmed by IT and approved for sharing
- do not request sensitive credentials
- do not argue with the customer
- do not redirect customers to post publicly

## 10) How Agent 3 Should Use This Playbook
- produce a reverse prompt using this structure:
  - summary, goal, draft response, questions, checks, do not do, escalate if
- cite the exact evidence quotes and reference the relevant sections above
