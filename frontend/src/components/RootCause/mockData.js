export const initialRootCauseData = {
    departments: [
        {
            id: 'depth-0',
            name: 'Mashreq Bank',
            pressure: 65,
            type: 'root',
            summary: 'The overall organizational health score is currently at 65%, indicating moderate systemic pressure. This aggregate metric reflects the weighted average of stress levels across all departments, with critical bottlenecks identified in Customer Service and Development sectors. Immediate attention to these high-pressure zones is recommended to prevent cascading operational failures.',
            children: [
                {
                    id: 'dept-mkt',
                    name: 'Marketing',
                    pressure: 30,
                    type: 'department',
                    summary: 'Marketing operations are stable (30%). Current campaigns are performing within expected KPIs. However, brand sentiment analysis shows a negative trend correlating with the recent account lockout issues, suggesting that operational failures are beginning to tarnish brand reputation.',
                    children: []
                },
                {
                    id: 'dept-hr',
                    name: 'HR',
                    pressure: 20,
                    type: 'department',
                    summary: 'The Human Resources department is operating with relatively low pressure (20%). Recruitment pipelines for general roles are healthy, and employee retention rates are stable. However, there is a developing bottleneck in specialized technical recruitment which, while not yet critical, is contributing to delays in the Dev Team.',
                    children: [
                        {
                            id: 'hr-001',
                            title: 'Recruitment Bottleneck',
                            summary: 'The time-to-fill metric for Senior Backend Engineers and DevOps constraints has increased by 40% over the last quarter. This delay is directly impacting the Dev Team\'s ability to address technical debt and feature backlogs, creating a cross-departmental dependency that requires targeted hiring sprints or agency support.',
                            pressure: 20,
                            type: 'problem',
                            children: []
                        }
                    ]
                },
                {
                    id: 'dept-fin',
                    name: 'Finance',
                    pressure: 45,
                    type: 'department',
                    summary: 'The Finance department is in a moderate state of alert (45%). While core reconciliation processes are stable, the Fraud Risk sub-unit is generating excessive false positives. This over-tuning of risk parameters is protecting the bank but at the cost of genuine customer transaction friction.',
                    children: [
                        {
                            id: 'fin-002',
                            title: 'Fraud Detection Threshold',
                            summary: 'The recently updated fraud detection model is exhibiting a high false-positive rate. The threshold for "suspicious activity" was lowered too aggressively in the last policy update, flagging standard travel transactions as potential fraud. Calibration is needed to balance risk mitigation with user experience.',
                            pressure: 55,
                            type: 'problem',
                            children: []
                        }
                    ]
                },
                {
                    id: 'dept-dev',
                    name: 'Dev Team',
                    pressure: 78,
                    type: 'department',
                    summary: 'The Development Team is facing high pressure (78%) due to a confluence of live site incidents and resource constraints. Critical bugs in the authentication layer and performance regressions in the core API are consuming 60% of engineering bandwidth, delaying the planned roadmap delivery.',
                    children: [
                        {
                            id: 'dev-001',
                            title: 'API Latency',
                            summary: 'Core banking API response times have degraded, with P99 latency exceeding 2 seconds during peak hours. This sluggishness is cascading to the mobile app, causing timeouts and user frustration. Preliminary analysis points to unoptimized database queries introduced in the recent v2.4 deployment.',
                            pressure: 40,
                            type: 'problem',
                            children: []
                        },
                        {
                            id: 'dev-003',
                            title: 'Auth Service Bug',
                            summary: 'A critical race condition has been identified in the token validation microservice. Under high concurrency, legitimate user sessions are being invalidated, triggering the fraud system to lock accounts. This is the primary technical driver behind the surge in Customer Service tickets and requires an immediate hotfix.',
                            pressure: 90,
                            type: 'problem',
                            children: []
                        }
                    ]
                },
                {
                    id: 'dept-cs',
                    name: 'Customer Service',
                    pressure: 85,
                    type: 'department',
                    summary: 'Customer Service is currently under critical strain (85%), primarily driven by a surge in account-related support tickets. The team is exceeding capacity thresholds, leading to increased burnout risk and degraded service level agreements (SLAs). The root cause appears to be technical issues triggering high call volumes.',
                    children: [
                        {
                            id: 'cs-001',
                            title: 'Account Lockout Surge',
                            summary: 'We are observing a massive spike in customer complaints regarding false-positive account lockouts. Approximately 1,500 users have been flagged by the fraud detection system in the last 24 hours, inundating the call center. This issue is identified as a downstream effect of aggressive new fraud rules and a potential race condition in the authentication service.',
                            pressure: 85,
                            type: 'problem',
                            crossLinks: ['dev-003', 'fin-002'],
                            sourceSignals: ['Social Media Complaints', 'Call Center Tickets', 'NPS Drop'],
                            children: [
                                {
                                    id: 'cs-001-a',
                                    title: 'Call Wait Times',
                                    summary: 'Due to the influx of account lockout inquiries, average call wait times have ballooned to over 20 minutes. This is severely impacting customer satisfaction scores and causing high abandonment rates. Immediate relief is dependent on resolving the upstream technical and policy issues causing the lockouts.',
                                    pressure: 60,
                                    type: 'problem',
                                    children: []
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
