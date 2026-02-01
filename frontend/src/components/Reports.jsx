import React, { useMemo, useState } from "react";
import { Search, ArrowDownUp, AlertTriangle, Info, CheckCircle, Clock, Mail, MessageSquare, Activity, FileText } from "lucide-react";
import sampleSignals from "../data/sampleSignals.json";

const priorityOrder = ["P0", "P1", "P2", "P3"];
const priorityPalette = {
    P0: "#D32F2F",
    P1: "#F57C00",
    P2: "#FBC02D",
    P3: "#388E3C",
};

const parseTimestamp = (value) => {
    if (!value) return null;
    const normalized = String(value).trim().replace(" ", "T") + "Z";
    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
};

const formatShortDate = (value) => {
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

const riskBadge = {
    High: { bg: "#FEE2E2", text: "#B91C1C", border: "1px solid #FEE2E2", icon: AlertTriangle },
    Medium: { bg: "#FEF3C7", text: "#B45309", border: "1px solid #FEF3C7", icon: Info },
    Low: { bg: "#DCFCE7", text: "#15803D", border: "1px solid #DCFCE7", icon: CheckCircle },
};

const getSourceIcon = (source) => {
    if (source === "Email") return Mail;
    if (source === "Chatbot") return MessageSquare;
    if (source === "Twitter" || source === "Social") return Activity;
    return FileText;
};

const Reports = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("Latest");

    const categories = useMemo(() => {
        const set = new Set(sampleSignals.map((item) => item.category || "uncategorized"));
        return ["All", ...Array.from(set)];
    }, []);

    const statuses = useMemo(() => {
        const set = new Set(sampleSignals.map((item) => item.status || "Open"));
        return ["All", ...Array.from(set)];
    }, []);

    const filtered = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        let list = sampleSignals.filter((item) => {
            const matchesTerm =
                !term ||
                item.title?.toLowerCase().includes(term) ||
                item.summary?.toLowerCase().includes(term) ||
                item.content?.toLowerCase().includes(term);
            const matchesPriority = priorityFilter === "All" || item.priority === priorityFilter;
            const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
            const matchesStatus = statusFilter === "All" || (item.status || "Open") === statusFilter;
            return matchesTerm && matchesPriority && matchesCategory && matchesStatus;
        });

        if (sortBy === "Latest") {
            list = [...list].sort((a, b) => (parseTimestamp(b.timestamp)?.getTime() || 0) - (parseTimestamp(a.timestamp)?.getTime() || 0));
        } else if (sortBy === "Priority") {
            list = [...list].sort(
                (a, b) => priorityOrder.indexOf(a.priority || "P3") - priorityOrder.indexOf(b.priority || "P3"),
            );
        } else if (sortBy === "Confidence") {
            list = [...list].sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        }

        return list;
    }, [searchTerm, priorityFilter, categoryFilter, statusFilter, sortBy]);

    return (
        <div className="h-full flex flex-col animate-fade-in" style={{ paddingBottom: "40px" }}>
            <div className="flex-1 min-h-[5vh]"></div>

            <div className="flex justify-center w-full" style={{ paddingLeft: "40px", paddingRight: "40px" }}>
                <div
                    className="w-full max-w-7xl bg-white/50 backdrop-blur-xl rounded-3xl flex flex-col shadow-2xl border border-white/70"
                    style={{ padding: "28px 30px 32px 30px", minHeight: "620px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "14px" }}>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Incident Reports</h2>
                            <p className="text-sm text-gray-500" style={{ marginTop: "6px" }}>
                                Browse all incoming cases with filters and sorting.
                            </p>
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em" }}>
                            {filtered.length} results
                        </div>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                            gap: "12px",
                            alignItems: "center",
                            marginBottom: "20px",
                        }}>
                        <div style={{ position: "relative" }}>
                            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                            <input
                                type="text"
                                placeholder="Search by summary, title, or content"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: "100%",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(226,232,240,0.8)",
                                    padding: "10px 12px 10px 36px",
                                    fontSize: "12px",
                                    color: "#0f172a",
                                    background: "rgba(255,255,255,0.8)",
                                }}
                            />
                        </div>

                        <div>
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                style={{
                                    width: "100%",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(226,232,240,0.8)",
                                    padding: "10px 12px",
                                    fontSize: "12px",
                                    color: "#0f172a",
                                    background: "rgba(255,255,255,0.8)",
                                }}>
                                {["All", ...priorityOrder].map((p) => (
                                    <option key={p} value={p}>
                                        {p === "All" ? "All Priorities" : p}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                style={{
                                    width: "100%",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(226,232,240,0.8)",
                                    padding: "10px 12px",
                                    fontSize: "12px",
                                    color: "#0f172a",
                                    background: "rgba(255,255,255,0.8)",
                                }}>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat === "All" ? "All Categories" : cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{
                                    width: "100%",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(226,232,240,0.8)",
                                    padding: "10px 12px",
                                    fontSize: "12px",
                                    color: "#0f172a",
                                    background: "rgba(255,255,255,0.8)",
                                }}>
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status === "All" ? "All Statuses" : status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <ArrowDownUp size={16} style={{ color: "#94a3b8" }} />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{
                                        width: "100%",
                                        borderRadius: "12px",
                                        border: "1px solid rgba(226,232,240,0.8)",
                                        padding: "10px 12px",
                                        fontSize: "12px",
                                        color: "#0f172a",
                                        background: "rgba(255,255,255,0.8)",
                                    }}>
                                    <option value="Latest">Latest</option>
                                    <option value="Priority">Priority</option>
                                    <option value="Confidence">Confidence</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                        {filtered.map((signal) => {
                            const risk = riskBadge[signal.riskLevel] || riskBadge.Low;
                            const RiskIcon = risk.icon;
                            const SourceIcon = getSourceIcon(signal.source);
                            return (
                                <div
                                    key={signal.id}
                                    className="report-card"
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        borderRadius: "16px",
                                        padding: "14px 16px",
                                        border: risk.border,
                                        background: "rgba(255,255,255,0.78)",
                                        boxShadow: "0 8px 16px rgba(15,23,42,0.08)",
                                    }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span
                                                style={{
                                                    padding: "4px 10px",
                                                    borderRadius: "999px",
                                                    fontSize: "10px",
                                                    fontWeight: 700,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.04em",
                                                    background: risk.bg,
                                                    color: risk.text,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                }}>
                                                <RiskIcon size={12} />
                                                {signal.type}
                                            </span>
                                            <span
                                                style={{
                                                    padding: "4px 8px",
                                                    borderRadius: "999px",
                                                    fontSize: "10px",
                                                    fontWeight: 700,
                                                    background: `${priorityPalette[signal.priority] || "#94a3b8"}20`,
                                                    color: priorityPalette[signal.priority] || "#64748b",
                                                }}>
                                                {signal.priority}
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                color: "#94a3b8",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "4px",
                                                marginLeft: "12px",
                                                whiteSpace: "nowrap",
                                                minWidth: "90px",
                                                justifyContent: "flex-end",
                                            }}>
                                            <Clock size={12} /> {formatShortDate(signal.timestamp)}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
                                        {signal.summary}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>{signal.content}</div>

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            borderTop: "1px solid #E5E7EB",
                                            paddingTop: "10px",
                                            marginTop: "auto",
                                        }}>
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                color: "#94a3b8",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.06em",
                                                fontWeight: 600,
                                            }}>
                                            <SourceIcon size={12} />
                                            {signal.sourceType || signal.source}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                fontWeight: 700,
                                                color: "#4B5563",
                                                background: "#F3F4F6",
                                                padding: "4px 7px",
                                                borderRadius: "8px",
                                                fontFamily: "ui-monospace",
                                            }}>
                                            {(signal.confidence * 100).toFixed(0)}% Conf
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex-1"></div>
        </div>
    );
};

export default Reports;
