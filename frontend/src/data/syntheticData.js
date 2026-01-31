export const syntheticSocialData = [
    {
        id: 'SIG-1024',
        source: 'Twitter',
        sourceType: 'Social Media',
        content: "@MashreqHelp I saw a tweet saying your login page is asking for my ATM PIN. Is this real? #security",
        user: "SarahSpace",
        sentiment: "Negative",
        riskLevel: "High",
        type: "Fraud Rumor",
        timestamp: "10:42 AM",
        confidence: 0.89,
        aiAnalysis: "Potential phishing campaign detected. Cross-referenced with 3 similar reports in the last hour.",
        summary: "Multiple users reporting a suspicious login page requesting ATM PINs. Likely a coordinated phishing attempt targeting mobile users.",
        evidence: [
            { source: "Twitter", text: "Login page asking for PIN? #scam", time: "10:40 AM" },
            { source: "Email Support", text: "Subject: Suspicious link in SMS", time: "10:35 AM" }
        ],
        status: "Unverified"
    },
    {
        id: 'SIG-1025',
        source: 'Chatbot',
        sourceType: 'Internal',
        content: "User reported: 'I cannot transfer money to my international beneficiary, getting error 404'.",
        user: "Session_8821 (Bot)",
        sentiment: "Negative",
        riskLevel: "Medium",
        type: "Service Incident",
        timestamp: "10:55 AM",
        confidence: 0.95,
        aiAnalysis: "Repeat functional failure in International Transfers module.",
        summary: "Sustained error rate in international transfers. 12% of chatbot sessions in the last 15 mins relate to 'Transfer Error'.",
        evidence: [
            { source: "Chatbot Logs", text: "Error 404 on API endpoint /transfer/intl", time: "10:50 AM" },
            { source: "Feedback Form", text: "App crashing when sending money to UK", time: "10:52 AM" }
        ],
        status: "Escalated"
    },
    {
        id: 'SIG-1026',
        source: 'Feedback Form',
        sourceType: 'Direct Feedback',
        content: "The new dashboard update is fantastic, love the dark mode!",
        user: "Verified Client",
        sentiment: "Positive",
        riskLevel: "Low",
        type: "Brand Sentiment",
        timestamp: "11:10 AM",
        confidence: 0.98,
        aiAnalysis: "Positive sentiment spike correlated with v4.2 release.",
        summary: "Strong positive reception to the new UI update, specifically Dark Mode.",
        evidence: [],
        status: "Monitored"
    },
    {
        id: 'SIG-1027',
        source: 'Email',
        sourceType: 'Customer Support',
        content: "Subject: URGENT - Account locked without reason. Ticket #9921",
        user: "h.almansoori@gmail.com",
        sentiment: "Negative",
        riskLevel: "Medium",
        type: "Customer Friction",
        timestamp: "11:30 AM",
        confidence: 0.85,
        aiAnalysis: "High-net-worth individual flagging account access issue.",
        summary: "Priority client support ticket regarding account lockout. Potential false positive on fraud check.",
        evidence: [
            { source: "Email", text: "I have been trying to call for 20 mins...", time: "11:25 AM" }
        ],
        status: "Open"
    }
];
