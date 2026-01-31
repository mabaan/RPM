import React from "react";
import { AlertTriangle, Info, CheckCircle, Clock } from "lucide-react";

const palette = {
    High: { border: "1px solid #FEE2E2", badgeBg: "#FEE2E2", badgeText: "#B91C1C", icon: <AlertTriangle size={14} className="text-red-500" /> },
    Medium: { border: "1px solid #FEF3C7", badgeBg: "#FEF3C7", badgeText: "#B45309", icon: <Info size={14} className="text-mashreq-yellow" /> },
    Low: { border: "1px solid #DCFCE7", badgeBg: "#DCFCE7", badgeText: "#15803D", icon: <CheckCircle size={14} className="text-green-500" /> },
};

const IncomingSignalList = ({ signals, selectedSignal, onSelectSignal, getSourceIcon }) => (
    <div className="flex-1 flex flex-col min-w-[340px]" style={{ marginLeft: "10px" }}>
        <div className="flex justify-between items-end mb-4 px-2">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Incoming Cases</h3>
            <span
                className="text-[10px] text-white bg-mashreq-orange px-2 py-1 rounded-full shadow-sm animate-pulse"
                style={{ marginRight: "15px" }}>
                Live
            </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar h-0 min-h-full pb-4" style={{ marginRight: "15px", display: "grid", gap: "10px" }}>
            {signals.map((signal) => {
                const risk = palette[signal.riskLevel] || palette.Low;
                const isActive = selectedSignal?.id === signal.id;
                return (
                    <div
                        key={signal.id}
                        onClick={() => onSelectSignal(signal)}
                        style={{
                            borderRadius: "16px",
                            padding: "14px 16px",
                            border: isActive ? "1px solid rgba(249,115,22,0.45)" : risk.border,
                            background: isActive ? "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,247,237,0.9))" : "rgba(255,255,255,0.7)",
                            boxShadow: isActive ? "0 8px 18px rgba(15,23,42,0.12)" : "0 4px 10px rgba(15,23,42,0.06)",
                            cursor: "pointer",
                            transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                            transform: isActive ? "translateY(-1px)" : "translateY(0)",
                        }}
                        className="group hover:shadow-md"
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = isActive ? "translateY(-1px)" : "translateY(0)")}>
                        <div className="flex justify-between items-start" style={{ marginBottom: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "6px 10px",
                                        borderRadius: "999px",
                                        background: risk.badgeBg,
                                        color: risk.badgeText,
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        letterSpacing: "0.04em",
                                        textTransform: "uppercase",
                                    }}>
                                    {risk.icon}
                                    {signal.type || "Signal"}
                                </div>
                            </div>
                            <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1">
                                <Clock size={12} /> {signal.timestamp}
                            </span>
                        </div>

                        <h4
                            style={{
                                margin: 0,
                                color: "#111827",
                                fontSize: "15px",
                                lineHeight: 1.4,
                                fontWeight: 700,
                            }}>
                            {signal.summary || signal.content}
                        </h4>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: "12px",
                                paddingTop: "10px",
                                borderTop: "1px solid #E5E7EB",
                            }}>
                            <span className="text-[11px] text-gray-500 flex items-center gap-1 font-medium uppercase tracking-wide">
                                {getSourceIcon(signal.source)} {signal.source}
                            </span>
                            <span
                                style={{
                                    fontSize: "11px",
                                    padding: "5px 8px",
                                    borderRadius: "10px",
                                    background: isActive ? "rgba(249,115,22,0.1)" : "#F3F4F6",
                                    color: isActive ? "#f97316" : "#4B5563",
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
);

export default IncomingSignalList;
