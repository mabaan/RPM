import React from "react";
import { ChevronLeft, Shield, Gauge, ScrollText, ListChecks, Sparkles, FileText, Link2, AlertCircle } from "lucide-react";

const toPercent = (val) => Math.max(0, Math.min(100, Math.round(Number(val) || 0)));

const styles = {
    sectionCard: {
        background: "rgba(255,255,255,0.72)",
        border: "1px solid rgba(226,232,240,0.7)",
        borderRadius: "18px",
        padding: "18px 20px",
        boxShadow: "0 4px 14px rgba(15,23,42,0.05)",
        marginBottom: "14px",
    },
    pill: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 600,
        border: "1px solid rgba(0,0,0,0.06)",
    },
    badgeRed: { background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" },
    badgeAmber: { background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" },
    badgeGreen: { background: "#ECFDF3", color: "#15803D", border: "1px solid #BBF7D0" },
    riskGrid: { display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: "10px", marginBottom: "16px" },
    twoCol: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "14px", flex: 1 },
    barOuter: { height: "8px", background: "#F1F5F9", borderRadius: "999px", overflow: "hidden", flex: 1 },
    barInner: { height: "100%", background: "linear-gradient(90deg,#f97316,#ea580c)" },
    row: { display: "flex", alignItems: "center" },
    between: { display: "flex", alignItems: "center", justifyContent: "space-between" },
};

const priorityStyle = (priority) => {
    const up = String(priority || "").toUpperCase();
    if (up === "P1" || up === "HIGH") return { ...styles.pill, ...styles.badgeRed };
    if (up === "P2" || up === "MEDIUM") return { ...styles.pill, ...styles.badgeAmber };
    return { ...styles.pill, ...styles.badgeGreen };
};

const SignalDetail = ({ selectedSignal, onBack, getSourceIcon }) => {
    if (!selectedSignal) return null;

    const title = selectedSignal.title || selectedSignal.summary || selectedSignal.content || "Case detail";
    const category = selectedSignal.category || selectedSignal.type || "General";
    const priority = selectedSignal.priority || selectedSignal.riskLevel || "P2";
    const confidence = selectedSignal.confidence ? toPercent(selectedSignal.confidence * 100) : null;
    const riskScores = selectedSignal.risk_scores || {
        virality: selectedSignal.virality || 0,
        churn: selectedSignal.churn || 0,
        compliance: selectedSignal.compliance || 0,
        financial: selectedSignal.financial || 0,
        operational: selectedSignal.operational || 0,
    };
    const reversePrompt = selectedSignal.reverse_prompt || {};
    const evidenceAnalysis = reversePrompt.evidence_analysis || [];
    const policyExcerpts = reversePrompt.relevant_policy_excerpts || [];
    const keyConsiderations = reversePrompt.key_considerations || [];
    const similarCases = reversePrompt.similar_cases || [];
    const totalEvidence = (selectedSignal.evidence?.length || 0) + (evidenceAnalysis.length || 0) + (selectedSignal.content ? 1 : 0);

    return (
        <div className="flex-1 flex flex-col animate-fade-in" style={{ gap: "10px" }}>
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-mashreq-orange text-sm font-medium"
                style={{ width: "fit-content", marginBottom: "6px" }}>
                <ChevronLeft size={16} /> Back to Overview
            </button>

            <div style={styles.sectionCard}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <span style={priorityStyle(priority)}>{priority}</span>
                            <span style={{ ...styles.pill, background: "#F8FAFC", color: "#334155" }}>{category}</span>
                            {selectedSignal.status ? <span style={{ ...styles.pill, background: "#F1F5F9", color: "#475569" }}>{selectedSignal.status}</span> : null}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-snug" style={{ margin: 0 }}>{title}</h3>
                        {selectedSignal.aiAnalysis ? (
                            <div
                                style={{
                                    background: "rgba(249,115,22,0.08)",
                                    borderLeft: "3px solid #f97316",
                                    padding: "10px 12px",
                                    borderRadius: "10px",
                                }}>
                                <span style={{ textTransform: "uppercase", fontSize: "11px", fontWeight: 700, color: "#f97316", marginRight: "6px" }}>
                                    AI Analysis
                                </span>
                                <span className="text-sm text-gray-800">{selectedSignal.aiAnalysis}</span>
                            </div>
                        ) : null}
                        {reversePrompt.situation_background ? (
                            <div
                                style={{
                                    background: "#F8FAFC",
                                    border: "1px solid #E2E8F0",
                                    borderRadius: "12px",
                                    padding: "12px",
                                }}>
                                <span className="font-semibold text-gray-800">Background: </span>
                                <span className="text-sm text-gray-700">{reversePrompt.situation_background}</span>
                            </div>
                        ) : null}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                        {confidence !== null ? (
                            <div style={{ textAlign: "right" }}>
                                <div className="font-bold text-mashreq-orange" style={{ fontSize: "38px", lineHeight: "1" }}>
                                    {confidence}%
                                </div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider" style={{ marginTop: "4px" }}>
                                    AI Confidence
                                </div>
                            </div>
                        ) : null}
                        <div style={{ width: "1px", height: "46px", background: "#E2E8F0" }}></div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={styles.row} className="text-sm text-gray-600 gap-2">
                                <Shield size={16} className="text-mashreq-orange" />
                                <span>Risk focus</span>
                            </div>
                            <span className="font-semibold text-gray-900">
                                {reversePrompt?.risk_focus || "Data privacy / compliance"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.riskGrid}>
                {[
                    ["Compliance", riskScores.compliance],
                    ["Virality", riskScores.virality],
                    ["Churn", riskScores.churn],
                    ["Financial", riskScores.financial],
                    ["Operational", riskScores.operational],
                ].map(([label, value]) => (
                    <div key={label} style={{ ...styles.sectionCard, marginBottom: 0, padding: "10px 12px" }}>
                        <div style={styles.between} className="text-xs text-gray-500">
                            <span className="uppercase tracking-wide font-semibold">{label}</span>
                            <Gauge size={14} className="text-gray-400" />
                        </div>
                        <div style={{ ...styles.row, gap: "8px", marginTop: "8px" }}>
                            <div style={styles.barOuter}>
                                <div style={{ ...styles.barInner, width: `${toPercent(value)}%` }}></div>
                            </div>
                            <span className="text-xs font-semibold text-gray-800" style={{ width: "32px", textAlign: "right" }}>
                                {toPercent(value)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div style={styles.twoCol}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={styles.sectionCard}>
                        <div style={styles.row} className="gap-2" >
                            <ScrollText size={16} className="text-mashreq-orange" />
                            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700" style={{ margin: 0 }}>
                                Customer Context
                            </h4>
                        </div>
                        <div style={{ marginTop: "10px" }}>
                            {reversePrompt.customer_context ? (
                                <p className="text-sm text-gray-700 leading-relaxed" style={{ margin: 0 }}>
                                    {reversePrompt.customer_context}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-500" style={{ margin: 0 }}>
                                    No explicit customer context provided.
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={styles.sectionCard}>
                        <div style={styles.row} className="gap-2">
                            <ListChecks size={16} className="text-mashreq-orange" />
                            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700" style={{ margin: 0 }}>
                                Key Considerations
                            </h4>
                        </div>
                        <div style={{ marginTop: "10px" }}>
                            {keyConsiderations.length ? (
                                <ul style={{ margin: 0, paddingLeft: "14px", display: "grid", gap: "6px" }}>
                                    {keyConsiderations.map((item, idx) => (
                                        <li key={idx} className="text-sm text-gray-700">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500" style={{ margin: 0 }}>
                                    No key considerations supplied.
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={styles.sectionCard}>
                        <div style={styles.row} className="gap-2">
                            <Sparkles size={16} className="text-mashreq-orange" />
                            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700" style={{ margin: 0 }}>
                                Guidance
                            </h4>
                        </div>
                        <div style={{ marginTop: "10px" }}>
                            {policyExcerpts.length ? (
                                <ul style={{ margin: 0, paddingLeft: "14px", display: "grid", gap: "6px" }}>
                                    {policyExcerpts.map((item, idx) => (
                                        <li key={idx} className="text-sm text-gray-700">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500" style={{ margin: 0 }}>
                                    No policy excerpts provided.
                                </p>
                            )}
                        </div>

                        {similarCases.length ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                                {similarCases.map((caseId) => (
                                    <span
                                        key={caseId}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            padding: "6px 10px",
                                            borderRadius: "14px",
                                            border: "1px solid #E2E8F0",
                                            background: "#F8FAFC",
                                            fontSize: "11px",
                                            color: "#475569",
                                        }}>
                                        <Link2 size={12} className="text-mashreq-orange" /> {caseId}
                                    </span>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={styles.sectionCard}>
                        <div style={{ ...styles.row, gap: "8px", alignItems: "center" }}>
                            <FileText size={16} className="text-mashreq-orange" />
                            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700" style={{ margin: 0 }}>
                                Evidence Trail
                            </h4>
                            <span
                                className="text-[10px] text-gray-500"
                                style={{ marginLeft: "auto", background: "#F8FAFC", padding: "4px 8px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                                Total Sources: {totalEvidence || 0}
                            </span>
                        </div>

                        {evidenceAnalysis.length ? (
                            <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                                {evidenceAnalysis.map((line, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: "flex",
                                            gap: "8px",
                                            alignItems: "flex-start",
                                            background: "rgba(255,255,255,0.8)",
                                            border: "1px solid #E2E8F0",
                                            borderRadius: "10px",
                                            padding: "8px 10px",
                                        }}>
                                        <AlertCircle size={14} className="text-mashreq-orange" style={{ marginTop: "2px" }} />
                                        <span className="text-sm text-gray-700">{line}</span>
                                    </div>
                                ))}
                            </div>
                        ) : null}

                        {selectedSignal.content ? (
                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "flex-start",
                                    background: "linear-gradient(90deg, rgba(249,115,22,0.1), rgba(249,115,22,0.02))",
                                    border: "1px solid rgba(249,115,22,0.25)",
                                    borderRadius: "12px",
                                    padding: "10px 12px",
                                    marginTop: "12px",
                                }}>
                                <div style={{ color: "#f97316", padding: "6px", background: "#fff", borderRadius: "50%", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                                    {getSourceIcon(selectedSignal.source)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p className="text-sm text-gray-800 font-medium" style={{ margin: 0 }}>
                                        "{selectedSignal.content}"
                                    </p>
                                    {selectedSignal.user ? (
                                        <div className="text-[11px] text-gray-500" style={{ marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                            @{selectedSignal.user}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}

                        {selectedSignal.evidence && selectedSignal.evidence.length > 0 ? (
                            <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                                {selectedSignal.evidence.map((ev, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            alignItems: "center",
                                            background: "rgba(255,255,255,0.72)",
                                            border: "1px solid #E2E8F0",
                                            borderRadius: "12px",
                                            padding: "10px 12px",
                                        }}>
                                        <div style={{ color: "#94A3B8" }}>{getSourceIcon(ev.source)}</div>
                                        <div style={{ flex: 1 }}>
                                            <p className="text-sm text-gray-700" style={{ margin: 0 }}>
                                                {ev.text}
                                            </p>
                                        </div>
                                        <span className="text-[11px] text-gray-400" style={{ fontFamily: "ui-monospace", whiteSpace: "nowrap" }}>
                                            {ev.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                style={{
                                    textAlign: "center",
                                    border: "1px dashed #E2E8F0",
                                    borderRadius: "12px",
                                    padding: "14px",
                                    marginTop: "12px",
                                }}>
                                <p className="text-xs text-gray-400" style={{ margin: 0 }}>
                                    No correlated cross-channel evidence found.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignalDetail;
