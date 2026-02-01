export const parseTimestamp = (value) => {
    if (!value) return null;
    const normalized = String(value).trim().replace(" ", "T") + "Z";
    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
};

export const formatShortDate = (value) => {
    const date = parseTimestamp(value);
    if (!date) return value || "-";
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);
};

const escalationKeywords = ["scam", "fraud", "lawsuit", "central bank", "police", "exposing", "viral", "insolvency", "regulator", "phishing"];

export const getCombinedText = (signal) =>
    `${signal.title || ""} ${signal.summary || ""} ${signal.content || ""}`.toLowerCase();

export const isSNS = (signal) => {
    const source = (signal.source || "").toLowerCase();
    const sourceType = (signal.sourceType || "").toLowerCase();
    return (
        source.includes("twitter") ||
        source.includes("x") ||
        source.includes("instagram") ||
        source.includes("tiktok") ||
        source.includes("reddit") ||
        source.includes("social") ||
        sourceType.includes("social")
    );
};

export const getChannelLabel = (signal) => {
    const source = (signal.source || "").toLowerCase();
    if (source.includes("twitter") || source === "x") return "X";
    if (source.includes("instagram")) return "Instagram";
    if (source.includes("tiktok")) return "TikTok";
    if (source.includes("reddit")) return "Reddit";
    if (source.includes("review")) return "Google Reviews";
    if (source.includes("news")) return "News Sites";
    if (isSNS(signal)) return "X";
    return "Internal";
};

export const getTopicLabel = (signal) => {
    const text = getCombinedText(signal);
    if (text.includes("login") || text.includes("access")) return "Login / Access";
    if (text.includes("card") && (text.includes("declined") || text.includes("charge"))) return "Card declined";
    if (text.includes("refund") || text.includes("fee dispute") || text.includes("chargeback")) return "Refund / fee dispute";
    if (text.includes("outage") || text.includes("transfer error") || text.includes("404") || text.includes("latency")) return "App outage";
    if (text.includes("fraud") || text.includes("phishing") || text.includes("scam")) return "Fraud allegation";
    if (text.includes("otp")) return "OTP delays";
    if (text.includes("atm")) return "ATM issues";
    if (text.includes("queue") || text.includes("branch")) return "Branch queues";
    if (text.includes("data") || text.includes("privacy") || text.includes("gdpr")) return "Data privacy";
    if (signal.type) return signal.type;
    if (signal.category) return signal.category;
    return "General";
};

export const getTeamLabel = (signal) => {
    const text = getCombinedText(signal);
    const category = (signal.category || "").toLowerCase();
    if (category === "policy" || text.includes("privacy") || text.includes("regulator")) return "Legal";
    if (category === "ops" || text.includes("outage") || text.includes("latency") || text.includes("transfer error")) return "Development / IT";
    if (category === "brand" || text.includes("rumor") || text.includes("reputation")) return "Marketing";
    if (category === "fraud" || text.includes("chargeback") || text.includes("dispute")) return "Finance";
    if (text.includes("ux") || text.includes("app") || text.includes("crash")) return "Product";
    if (text.includes("hr")) return "HR";
    if (text.includes("management")) return "Management";
    return "Customer Service";
};

export const computeViralityScore = (signal) => {
    let score = 0;
    const viralityInput = signal.risk_scores?.virality || 0;
    const sns = isSNS(signal);
    if (sns) score += 25;

    const influencer = sns && viralityInput >= 60;
    if (influencer) score += 20;

    const followers = sns ? (viralityInput >= 60 ? 120000 : viralityInput >= 30 ? 12000 : viralityInput >= 10 ? 1500 : 0) : 0;
    if (followers >= 100000) score += 15;
    else if (followers >= 10000) score += 10;
    else if (followers >= 1000) score += 5;

    const engagement = sns ? (viralityInput >= 70 ? 110 : viralityInput >= 35 ? 25 : viralityInput >= 12 ? 6 : 0) : 0;
    if (engagement >= 100) score += 20;
    else if (engagement >= 20) score += 10;
    else if (engagement >= 5) score += 5;

    const text = getCombinedText(signal);
    if (text.includes("outage") || text.includes("failure") || text.includes("fraud") || text.includes("scam") || text.includes("insolvency")) {
        score += 10;
    }
    if (escalationKeywords.some((keyword) => text.includes(keyword))) {
        score += 20;
    }

    return Math.min(score, 100);
};

export const getViralityBucket = (score) => {
    if (score >= 70) return "High";
    if (score >= 40) return "Medium";
    return "Low";
};

export const getAgeMinutes = (date, now) => {
    if (!date) return null;
    const diff = (now.getTime() - date.getTime()) / 60000;
    return diff < 0 ? 0 : Math.round(diff);
};

export const formatAge = (minutes) => {
    if (minutes === null || minutes === undefined) return "-";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
};
