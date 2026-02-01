import React, { useMemo, useState } from "react";
import { RefreshCcw, Flame, ShieldAlert, AlertTriangle, Clock } from "lucide-react";
import sampleSignals from "../data/sampleSignals.json";
import {
    parseTimestamp,
    getTopicLabel,
    getTeamLabel,
    getChannelLabel,
    computeViralityScore,
    getViralityBucket,
    getAgeMinutes,
    formatAge,
} from "../utils/riskRadar";

const timeOptions = [
    { label: "1h", hours: 1 },
    { label: "6h", hours: 6 },
    { label: "24h", hours: 24 },
    { label: "7d", hours: 168 },
];

const priorityOrder = ["P0", "P1", "P2", "P3"];
const priorityColors = {
    P0: "#D32F2F",
    P1: "#F57C00",
    P2: "#FBC02D",
    P3: "#388E3C",
};

const channelRows = ["X", "Instagram", "TikTok", "Reddit", "Google Reviews", "News Sites", "Internal"];
const riskBuckets = ["Low", "Medium", "High"];
const teamList = ["Customer Service", "Development / IT", "Finance", "Marketing", "Legal", "Product", "HR", "Management"];

const RiskRadar = ({ onNavigate, onOpenSignal }) => {
    const [windowHours, setWindowHours] = useState(24);
    const [refreshTick, setRefreshTick] = useState(0);
    const now = useMemo(() => new Date(), [windowHours, refreshTick]);
    const windowMs = windowHours * 60 * 60 * 1000;

    const signalsInWindow = useMemo(() => {
        return sampleSignals.filter((signal) => {
            const date = parseTimestamp(signal.timestamp);
            if (!date) return false;
            return now.getTime() - date.getTime() <= windowMs;
        });
    }, [now, windowMs, refreshTick]);

    const previousWindowSignals = useMemo(() => {
        return sampleSignals.filter((signal) => {
            const date = parseTimestamp(signal.timestamp);
            if (!date) return false;
            const delta = now.getTime() - date.getTime();
            return delta > windowMs && delta <= windowMs * 2;
        });
    }, [now, windowMs, refreshTick]);

    const applyFilter = (filters) => {
        onNavigate?.("reports", { ...filters, _stamp: Date.now() });
    };

    const openSignals = useMemo(() => {
        return signalsInWindow.filter((signal) => (signal.status || "Open") !== "Unverified");
    }, [signalsInWindow]);

    const summaryStats = useMemo(() => {
        const oldestOpen = openSignals.reduce((acc, signal) => {
            const date = parseTimestamp(signal.timestamp);
            if (!date) return acc;
            if (!acc || date < acc) return date;
            return acc;
        }, null);

        return {
            openCount: openSignals.length,
            highRisk: signalsInWindow.filter((signal) => (signal.riskLevel || "Low") === "High").length,
            viralHigh: signalsInWindow.filter((signal) => getViralityBucket(computeViralityScore(signal)) === "High").length,
            complianceRisk: signalsInWindow.filter((signal) => (signal.risk_scores?.compliance || 0) >= 60).length,
            oldestOpenAge: oldestOpen ? formatAge(getAgeMinutes(oldestOpen, now)) : "-",
        };
    }, [openSignals, signalsInWindow, now]);

    const topicRows = useMemo(() => {
        const current = {};
        signalsInWindow.forEach((signal) => {
            const topic = getTopicLabel(signal);
            if (!current[topic]) {
                current[topic] = { count: 0, maxPriority: "P3", sns: 0, internal: 0 };
            }
            current[topic].count += 1;
            const priority = (signal.priority || "P3").toUpperCase();
            if (priorityOrder.indexOf(priority) < priorityOrder.indexOf(current[topic].maxPriority)) {
                current[topic].maxPriority = priority;
            }
            const channel = getChannelLabel(signal);
            if (channel === "Internal") current[topic].internal += 1;
            else current[topic].sns += 1;
        });

        const previous = {};
        previousWindowSignals.forEach((signal) => {
            const topic = getTopicLabel(signal);
            previous[topic] = (previous[topic] || 0) + 1;
        });

        return Object.entries(current)
            .map(([topic, data]) => {
                const prevCount = previous[topic] || 0;
                const delta = prevCount ? Math.round(((data.count - prevCount) / prevCount) * 100) : data.count ? 100 : 0;
                return {
                    topic,
                    count: data.count,
                    deltaLabel: prevCount ? `${delta >= 0 ? "+" : ""}${delta}%` : "new",
                    maxPriority: data.maxPriority,
                    driver: data.sns >= data.internal ? "SNS" : "Internal",
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [signalsInWindow, previousWindowSignals]);

    const heatmap = useMemo(() => {
        const grid = channelRows.reduce((acc, channel) => {
            acc[channel] = { Low: 0, Medium: 0, High: 0 };
            return acc;
        }, {});
        signalsInWindow.forEach((signal) => {
            const channel = getChannelLabel(signal);
            const bucket = getViralityBucket(computeViralityScore(signal));
            if (!grid[channel]) grid[channel] = { Low: 0, Medium: 0, High: 0 };
            grid[channel][bucket] += 1;
        });
        return grid;
    }, [signalsInWindow]);

    const teamRows = useMemo(() => {
        const rows = teamList.map((team) => ({
            team,
            total: 0,
            counts: { P0: 0, P1: 0, P2: 0, P3: 0 },
        }));
        const teamIndex = rows.reduce((acc, row) => {
            acc[row.team] = row;
            return acc;
        }, {});
        signalsInWindow.forEach((signal) => {
            const team = getTeamLabel(signal);
            const row = teamIndex[team] || teamIndex["Customer Service"];
            const priority = (signal.priority || "P3").toUpperCase();
            row.total += 1;
            row.counts[priority] = (row.counts[priority] || 0) + 1;
        });
        return rows;
    }, [signalsInWindow]);

    const trendingHighlights = useMemo(() => {
        const total = signalsInWindow.length;
        const internalCount = signalsInWindow.filter((signal) => getChannelLabel(signal) === "Internal").length;
        const snsCount = total - internalCount;
        const topicData = {};
        signalsInWindow.forEach((signal) => {
            const topic = getTopicLabel(signal);
            const priority = (signal.priority || "P3").toUpperCase();
            if (!topicData[topic]) {
                topicData[topic] = { maxPriority: priority, count: 0 };
            }
            topicData[topic].count += 1;
            if (priorityOrder.indexOf(priority) < priorityOrder.indexOf(topicData[topic].maxPriority)) {
                topicData[topic].maxPriority = priority;
            }
        });
        const topPriorityTopic = Object.entries(topicData)
            .sort((a, b) => priorityOrder.indexOf(a[1].maxPriority) - priorityOrder.indexOf(b[1].maxPriority))[0];
        const topTeam = teamRows.reduce(
            (acc, row) => (row.total > acc.total ? { team: row.team, total: row.total } : acc),
            { team: "Customer Service", total: 0 },
        );
        return {
            total,
            internalCount,
            snsCount,
            topPriorityTopic: topPriorityTopic?.[0] || "-",
            topPriorityLevel: topPriorityTopic?.[1]?.maxPriority || "P3",
            topTeam,
        };
    }, [signalsInWindow, teamRows]);

    const heatmapHighlights = useMemo(() => {
        let topChannel = { channel: "-", count: 0 };
        let totalHigh = 0;
        channelRows.forEach((channel) => {
            const highCount = heatmap[channel]?.High || 0;
            totalHigh += highCount;
            if (highCount > topChannel.count) {
                topChannel = { channel, count: highCount };
            }
        });
        const internalHigh = heatmap.Internal?.High || 0;
        const snsHigh = totalHigh - internalHigh;
        return { topChannel, totalHigh, internalHigh, snsHigh };
    }, [heatmap]);

    const actionItems = useMemo(() => {
        return [...signalsInWindow]
            .sort((a, b) => {
                const pa = priorityOrder.indexOf((a.priority || "P3").toUpperCase());
                const pb = priorityOrder.indexOf((b.priority || "P3").toUpperCase());
                if (pa !== pb) return pa - pb;
                const va = computeViralityScore(a);
                const vb = computeViralityScore(b);
                if (va !== vb) return vb - va;
                const da = parseTimestamp(a.timestamp);
                const db = parseTimestamp(b.timestamp);
                return (da?.getTime() || 0) - (db?.getTime() || 0);
            })
            .slice(0, 5);
    }, [signalsInWindow]);

    return (
        <div className="h-full flex flex-col animate-fade-in" style={{ paddingBottom: "40px" }}>
            <div className="flex-1 min-h-[5vh]"></div>

            <div className="flex justify-center w-full" style={{ paddingLeft: "40px", paddingRight: "40px" }}>
                <div
                    className="w-full max-w-7xl bg-white/50 backdrop-blur-xl rounded-3xl flex flex-col shadow-2xl border border-white/70"
                    style={{ padding: "26px 30px 30px 30px", minHeight: "660px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Risk Radar</h2>
                            <p className="text-sm text-gray-500" style={{ marginTop: "6px" }}>
                                Signals across Internal + SNS, grouped by impact and spread risk.
                            </p>
                            <div style={{ marginTop: "6px", fontSize: "11px", color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                Window: Last {windowHours === 168 ? "7d" : `${windowHours}h`}
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    background: "rgba(255,255,255,0.75)",
                                    border: "1px solid rgba(226,232,240,0.9)",
                                    padding: "6px",
                                    borderRadius: "999px",
                                }}>
                                {timeOptions.map((option) => (
                                    <button
                                        key={option.label}
                                        type="button"
                                        onClick={() => setWindowHours(option.hours)}
                                        style={{
                                            padding: "6px 12px",
                                            borderRadius: "999px",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            border: option.hours === windowHours ? "1px solid rgba(249,115,22,0.45)" : "1px solid transparent",
                                            background:
                                                option.hours === windowHours
                                                    ? "linear-gradient(135deg, rgba(255,247,237,0.95), rgba(255,236,211,0.9))"
                                                    : "transparent",
                                            color: option.hours === windowHours ? "#9a3412" : "#64748b",
                                            letterSpacing: "0.04em",
                                            textTransform: "uppercase",
                                        }}>
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setRefreshTick((tick) => tick + 1)}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "8px 12px",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(226,232,240,0.9)",
                                    background: "rgba(255,255,255,0.85)",
                                    color: "#0f172a",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                }}>
                                <RefreshCcw size={14} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px", marginBottom: "22px" }}>
                        <button
                            type="button"
                            onClick={() => applyFilter({ status: "Open" })}
                            style={{
                                padding: "6px 12px",
                                borderRadius: "999px",
                                border: "1px solid rgba(226,232,240,0.8)",
                                background: "rgba(255,255,255,0.85)",
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "#0f172a",
                            }}>
                            Open incidents: {summaryStats.openCount}
                        </button>
                        <button
                            type="button"
                            onClick={() => applyFilter({ riskLevel: "High" })}
                            style={{
                                padding: "6px 12px",
                                borderRadius: "999px",
                                border: "1px solid rgba(226,232,240,0.8)",
                                background: "rgba(255,255,255,0.85)",
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "#0f172a",
                            }}>
                            High risk: {summaryStats.highRisk}
                        </button>
                        <button
                            type="button"
                            onClick={() => applyFilter({ riskBucket: "High" })}
                            style={{
                                padding: "6px 12px",
                                borderRadius: "999px",
                                border: "1px solid rgba(226,232,240,0.8)",
                                background: "rgba(255,255,255,0.85)",
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "#0f172a",
                            }}
                            title="Likelihood this spreads publicly based on reach and engagement.">
                            Viral risk: {summaryStats.viralHigh}
                        </button>
                        <button
                            type="button"
                            onClick={() => applyFilter({ complianceRisk: true })}
                            style={{
                                padding: "6px 12px",
                                borderRadius: "999px",
                                border: "1px solid rgba(226,232,240,0.8)",
                                background: "rgba(255,255,255,0.85)",
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "#0f172a",
                            }}
                            title="Potential legal, regulator, or privacy exposure.">
                            Compliance risk: {summaryStats.complianceRisk}
                        </button>
                        <button
                            type="button"
                            onClick={() => applyFilter({ status: "Open", sortBy: "Oldest" })}
                            style={{
                                padding: "6px 12px",
                                borderRadius: "999px",
                                border: "1px solid rgba(226,232,240,0.8)",
                                background: "rgba(255,255,255,0.85)",
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "#0f172a",
                            }}>
                            Oldest open: {summaryStats.oldestOpenAge}
                        </button>
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(280px, 1.2fr) minmax(240px, 1fr) minmax(260px, 1fr)",
                            gap: "16px",
                        }}>
                        <div
                            style={{
                                borderRadius: "18px",
                                border: "1px solid rgba(226,232,240,0.9)",
                                background: "rgba(255,255,255,0.85)",
                                padding: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                            }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", letterSpacing: "0.08em" }}>
                                        WHAT IS TRENDING
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                                        Top topics rising in the selected window.
                                    </div>
                                </div>
                                <Flame size={18} style={{ color: "#f97316" }} />
                            </div>
                            <div style={{ display: "grid", gap: "10px" }}>
                                {topicRows.map((row) => (
                                    <button
                                        key={row.topic}
                                        type="button"
                                        onClick={() => applyFilter({ topic: row.topic })}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1.4fr 0.7fr 0.6fr 0.5fr 0.7fr",
                                            gap: "8px",
                                            alignItems: "center",
                                            padding: "10px 12px",
                                            borderRadius: "12px",
                                            border: "1px solid rgba(226,232,240,0.8)",
                                            background: "rgba(255,255,255,0.9)",
                                            fontSize: "12px",
                                            textAlign: "left",
                                            color: "#0f172a",
                                        }}>
                                        <span style={{ fontWeight: 700 }}>{row.topic}</span>
                                        <span style={{ fontSize: "11px", color: "#475569" }}>{row.count} cases</span>
                                        <span style={{ fontSize: "11px", color: row.deltaLabel.startsWith("+") ? "#16a34a" : "#f97316" }}>
                                            {row.deltaLabel}
                                        </span>
                                        <span
                                            style={{
                                                padding: "4px 8px",
                                                borderRadius: "999px",
                                                fontSize: "10px",
                                                fontWeight: 700,
                                                background: `${priorityColors[row.maxPriority]}20`,
                                                color: priorityColors[row.maxPriority],
                                                textAlign: "center",
                                            }}
                                            title="How fast we should respond to prevent harm and escalation.">
                                            {row.maxPriority}
                                        </span>
                                        <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                            {row.driver}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div
                            style={{
                                borderRadius: "18px",
                                border: "1px solid rgba(226,232,240,0.9)",
                                background: "rgba(255,255,255,0.85)",
                                padding: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                            }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", letterSpacing: "0.08em" }}>
                                        WHERE IT MIGHT EXPLODE
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                                        Virality risk by channel.
                                    </div>
                                </div>
                                <ShieldAlert size={18} style={{ color: "#ef4444" }} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 0.7fr)", gap: "6px", alignItems: "center" }}>
                                <div></div>
                                {riskBuckets.map((bucket) => (
                                    <div
                                        key={bucket}
                                        style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>
                                        {bucket}
                                    </div>
                                ))}
                                {channelRows.map((channel) => (
                                    <React.Fragment key={channel}>
                                        <div style={{ fontSize: "11px", color: "#334155", fontWeight: 600 }}>{channel}</div>
                                        {riskBuckets.map((bucket) => {
                                            const count = heatmap[channel]?.[bucket] || 0;
                                            const bg =
                                                bucket === "High"
                                                    ? "rgba(239,68,68,0.12)"
                                                    : bucket === "Medium"
                                                    ? "rgba(249,115,22,0.12)"
                                                    : "rgba(148,163,184,0.12)";
                                            const color = bucket === "High" ? "#b91c1c" : bucket === "Medium" ? "#c2410c" : "#475569";
                                            return (
                                                <button
                                                    key={`${channel}-${bucket}`}
                                                    type="button"
                                                    onClick={() => applyFilter({ channel, riskBucket: bucket })}
                                                    style={{
                                                        borderRadius: "10px",
                                                        border: "1px solid rgba(226,232,240,0.8)",
                                                        background: bg,
                                                        color,
                                                        fontSize: "11px",
                                                        fontWeight: 700,
                                                        padding: "6px 0",
                                                    }}>
                                                    {count}
                                                </button>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        <div
                            style={{
                                borderRadius: "18px",
                                border: "1px solid rgba(226,232,240,0.9)",
                                background: "rgba(255,255,255,0.85)",
                                padding: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                            }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", letterSpacing: "0.08em" }}>
                                        WHO IS GETTING HIT
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                                        Team load by priority.
                                    </div>
                                </div>
                                <AlertTriangle size={18} style={{ color: "#f59e0b" }} />
                            </div>
                            <div style={{ display: "grid", gap: "10px" }}>
                                {teamRows.map((row) => {
                                    const total = row.total || 1;
                                    return (
                                        <button
                                            key={row.team}
                                            type="button"
                                            onClick={() => applyFilter({ team: row.team })}
                                            style={{
                                                borderRadius: "12px",
                                                border: "1px solid rgba(226,232,240,0.8)",
                                                background: "rgba(255,255,255,0.9)",
                                                padding: "10px 12px",
                                                textAlign: "left",
                                                display: "grid",
                                                gap: "8px",
                                            }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>{row.team}</span>
                                                <span style={{ fontSize: "11px", color: "#64748b" }}>{row.total} cases</span>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    height: "10px",
                                                    borderRadius: "999px",
                                                    overflow: "hidden",
                                                    background: "rgba(226,232,240,0.7)",
                                                }}>
                                                {priorityOrder.map((priority) => {
                                                    const value = row.counts[priority] || 0;
                                                    const width = (value / total) * 100;
                                                    return (
                                                        <div
                                                            key={`${row.team}-${priority}`}
                                                            style={{
                                                                width: `${width}%`,
                                                                background: priorityColors[priority],
                                                            }}
                                                        ></div>
                                                    );
                                                })}
                                            </div>
                                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                {priorityOrder.map((priority) => (
                                                    <span
                                                        key={`${row.team}-${priority}-count`}
                                                        style={{
                                                            fontSize: "10px",
                                                            color: "#475569",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "4px",
                                                        }}>
                                                        <span
                                                            style={{
                                                                width: "6px",
                                                                height: "6px",
                                                                borderRadius: "999px",
                                                                background: priorityColors[priority],
                                                            }}
                                                        ></span>
                                                        {priority} {row.counts[priority] || 0}
                                                    </span>
                                                ))}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            marginTop: "16px",
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: "16px",
                        }}>
                        <div
                            style={{
                                borderRadius: "18px",
                                border: "1px solid rgba(226,232,240,0.9)",
                                background: "rgba(255,255,255,0.85)",
                                padding: "16px",
                                display: "grid",
                                gap: "10px",
                            }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", letterSpacing: "0.08em" }}>
                                    CHANNEL MIX
                                </div>
                                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Internal vs SNS</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#334155" }}>
                                <span>Internal: {trendingHighlights.internalCount}</span>
                                <span>SNS: {trendingHighlights.snsCount}</span>
                            </div>
                            <div style={{ height: "10px", borderRadius: "999px", background: "rgba(226,232,240,0.7)", overflow: "hidden" }}>
                                <div
                                    style={{
                                        width: `${trendingHighlights.total ? (trendingHighlights.internalCount / trendingHighlights.total) * 100 : 0}%`,
                                        height: "100%",
                                        background: "linear-gradient(90deg, #93c5fd, #60a5fa)",
                                    }}
                                ></div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b" }}>
                                <span>Top priority topic</span>
                                <span style={{ fontWeight: 700, color: priorityColors[trendingHighlights.topPriorityLevel] }}>
                                    {trendingHighlights.topPriorityTopic}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b" }}>
                                <span>Most impacted team</span>
                                <span style={{ fontWeight: 700, color: "#0f172a" }}>{trendingHighlights.topTeam.team}</span>
                            </div>
                        </div>
                        <div
                            style={{
                                borderRadius: "18px",
                                border: "1px solid rgba(226,232,240,0.9)",
                                background: "rgba(255,255,255,0.85)",
                                padding: "16px",
                                display: "grid",
                                gap: "10px",
                            }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", letterSpacing: "0.08em" }}>
                                    VIRALITY SUMMARY
                                </div>
                                <span style={{ fontSize: "11px", color: "#94a3b8" }}>High risk focus</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#334155" }}>
                                <span>Highest risk channel</span>
                                <span style={{ fontWeight: 700, color: "#b91c1c" }}>
                                    {heatmapHighlights.topChannel.channel} ({heatmapHighlights.topChannel.count})
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b" }}>
                                <span>High risk total</span>
                                <span style={{ fontWeight: 700, color: "#0f172a" }}>{heatmapHighlights.totalHigh}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b" }}>
                                <span>Internal vs SNS high risk</span>
                                <span style={{ fontWeight: 700, color: "#0f172a" }}>
                                    {heatmapHighlights.internalHigh} / {heatmapHighlights.snsHigh}
                                </span>
                            </div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <div style={{ flex: 1, height: "8px", borderRadius: "999px", background: "rgba(239,68,68,0.12)" }}>
                                    <div
                                        style={{
                                            width: `${heatmapHighlights.totalHigh ? (heatmapHighlights.internalHigh / heatmapHighlights.totalHigh) * 100 : 0}%`,
                                            height: "100%",
                                            borderRadius: "999px",
                                            background: "#ef4444",
                                        }}
                                    ></div>
                                </div>
                                <span style={{ fontSize: "10px", color: "#94a3b8" }}>Internal share</span>
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            marginTop: "18px",
                            borderRadius: "18px",
                            border: "1px solid rgba(226,232,240,0.9)",
                            background: "rgba(255,255,255,0.85)",
                            padding: "16px",
                            display: "grid",
                            gap: "12px",
                        }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", letterSpacing: "0.08em" }}>
                                    IMMEDIATE ACTION LIST
                                </div>
                                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                                    Top incidents needing quick attention.
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                <button
                                    type="button"
                                    onClick={() => applyFilter({ priority: "P0" })}
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: "999px",
                                        border: "1px solid rgba(226,232,240,0.8)",
                                        background: "rgba(255,255,255,0.9)",
                                        fontSize: "10px",
                                        fontWeight: 700,
                                    }}>
                                    View all P0
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyFilter({ riskBucket: "High" })}
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: "999px",
                                        border: "1px solid rgba(226,232,240,0.8)",
                                        background: "rgba(255,255,255,0.9)",
                                        fontSize: "10px",
                                        fontWeight: 700,
                                    }}>
                                    View all High Virality
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyFilter({ complianceRisk: true })}
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: "999px",
                                        border: "1px solid rgba(226,232,240,0.8)",
                                        background: "rgba(255,255,255,0.9)",
                                        fontSize: "10px",
                                        fontWeight: 700,
                                    }}>
                                    View all Legal Risk
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyFilter({ category: "ops" })}
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: "999px",
                                        border: "1px solid rgba(226,232,240,0.8)",
                                        background: "rgba(255,255,255,0.9)",
                                        fontSize: "10px",
                                        fontWeight: 700,
                                    }}>
                                    View all IT Outage
                                </button>
                            </div>
                        </div>

                        <div style={{ display: "grid", gap: "10px" }}>
                            {actionItems.map((signal) => {
                                const priority = (signal.priority || "P3").toUpperCase();
                                const channel = getChannelLabel(signal);
                                const viralityBucket = getViralityBucket(computeViralityScore(signal));
                                const team = getTeamLabel(signal);
                                const age = formatAge(getAgeMinutes(parseTimestamp(signal.timestamp), now));
                                return (
                                    <button
                                        key={signal.id}
                                        type="button"
                                        onClick={() => onOpenSignal?.(signal.id)}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1.4fr 0.4fr 0.4fr 0.5fr 0.7fr 0.4fr",
                                            gap: "8px",
                                            alignItems: "center",
                                            padding: "12px 14px",
                                            borderRadius: "12px",
                                            border: "1px solid rgba(226,232,240,0.8)",
                                            background: "rgba(255,255,255,0.95)",
                                            textAlign: "left",
                                        }}>
                                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
                                            {signal.summary || signal.title}
                                        </span>
                                        <span
                                            style={{
                                                padding: "4px 8px",
                                                borderRadius: "999px",
                                                fontSize: "10px",
                                                fontWeight: 700,
                                                background: `${priorityColors[priority]}20`,
                                                color: priorityColors[priority],
                                                textAlign: "center",
                                            }}
                                            title="How fast we should respond to prevent harm and escalation.">
                                            {priority}
                                        </span>
                                        <span
                                            style={{
                                                padding: "4px 8px",
                                                borderRadius: "999px",
                                                fontSize: "10px",
                                                fontWeight: 700,
                                                background: "rgba(148,163,184,0.2)",
                                                color: "#475569",
                                                textAlign: "center",
                                            }}>
                                            {channel}
                                        </span>
                                        <span
                                            style={{
                                                padding: "4px 8px",
                                                borderRadius: "999px",
                                                fontSize: "10px",
                                                fontWeight: 700,
                                                background:
                                                    viralityBucket === "High"
                                                        ? "rgba(239,68,68,0.15)"
                                                        : viralityBucket === "Medium"
                                                        ? "rgba(249,115,22,0.15)"
                                                        : "rgba(148,163,184,0.2)",
                                                color: viralityBucket === "High" ? "#b91c1c" : viralityBucket === "Medium" ? "#c2410c" : "#475569",
                                                textAlign: "center",
                                            }}>
                                            {viralityBucket}
                                        </span>
                                        <span style={{ fontSize: "11px", color: "#475569" }}>{team}</span>
                                        <span style={{ fontSize: "11px", color: "#64748b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                            <Clock size={12} />
                                            {age}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1"></div>
        </div>
    );
};

export default RiskRadar;
