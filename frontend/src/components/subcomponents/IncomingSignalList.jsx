import React from "react";
import { AlertTriangle, Info, CheckCircle, Clock } from "lucide-react";

const palette = {
    High: { border: "1px solid #FEE2E2", badgeBg: "#FEE2E2", badgeText: "#B91C1C", icon: <AlertTriangle size={14} className="text-red-500" /> },
    Medium: { border: "1px solid #FEF3C7", badgeBg: "#FEF3C7", badgeText: "#B45309", icon: <Info size={14} className="text-mashreq-yellow" /> },
    Low: { border: "1px solid #DCFCE7", badgeBg: "#DCFCE7", badgeText: "#15803D", icon: <CheckCircle size={14} className="text-green-500" /> },
};

const IncomingSignalList = ({ signals, selectedSignal, onSelectSignal, getSourceIcon, onSeeAll, isLoadingAPI, apiError }) => (
    <div className="flex-1 flex flex-col min-w-[340px]" style={{ marginLeft: "10px" }}>
        <div className="flex justify-between items-end mb-4 px-2">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Incoming Cases
                {isLoadingAPI && <span className="ml-2 text-xs text-mashreq-orange">● Loading Live Data...</span>}
                {apiError && <span className="ml-2 text-xs text-gray-500">● Using Sample Data</span>}
            </h3>
        </div>

        <div
            className={`flex-1 pr-2 ${selectedSignal ? "no-scrollbar" : "custom-scrollbar"}`}
            style={{
                marginRight: "10px",
                display: "grid",
                gap: "6px",
                minHeight: 0,
                paddingBottom: "6px",
            }}>
            {(() => {
                const mainLimit = 3;
                const detailLimit = 6;
                const visible = selectedSignal ? signals.slice(0, detailLimit) : signals.slice(0, mainLimit);
                return visible.map((signal, idx) => {
                    const risk = palette[signal.riskLevel] || palette.Low;
                    const isActive = selectedSignal?.id === signal.id;
                return (
                    <div
                        key={signal.id}
                        onClick={() => onSelectSignal(signal)}
                        style={{
                            borderRadius: "12px",
                            padding: "10px 12px",
                            marginTop: idx === 0 ? "10px" : "0px",
                            border: isActive ? "1px solid rgba(249,115,22,0.45)" : risk.border,
                            background: isActive ? "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,247,237,0.9))" : "rgba(255,255,255,0.7)",
                            boxShadow: isActive ? "0 6px 14px rgba(15,23,42,0.1)" : "0 3px 8px rgba(15,23,42,0.06)",
                            cursor: "pointer",
                            transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                            transform: isActive ? "translateY(-1px)" : "translateY(0)",
                        }}
                        className="group hover:shadow-md"
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = isActive ? "translateY(-1px)" : "translateY(0)")}>
                        <div className="flex justify-between items-start" style={{ marginBottom: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "5px 8px",
                                        borderRadius: "999px",
                                        background: risk.badgeBg,
                                        color: risk.badgeText,
                                        fontSize: "10px",
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
                                fontSize: "13.5px",
                                lineHeight: 1.32,
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
                                    fontSize: "10px",
                                    padding: "4px 7px",
                                    borderRadius: "8px",
                                    background: isActive ? "rgba(249,115,22,0.1)" : "#F3F4F6",
                                    color: isActive ? "#f97316" : "#4B5563",
                                    fontFamily: "ui-monospace",
                                }}>
                                {(signal.confidence * 100).toFixed(0)}% Conf
                            </span>
                        </div>
                    </div>
                );
                });
            })()}
            {signals.length > 3 ? (
                <button
                    type="button"
                    onClick={onSeeAll}
                    style={{
                        marginTop: "4px",
                        marginBottom: "25px",
                        padding: "10px 12px 12px 12px",
                        borderRadius: "12px",
                        border: "1px solid rgba(249,115,22,0.25)",
                        background: "linear-gradient(135deg, #fff7ed, #ffe6d5)",
                        color: "#9a3412",
                        fontWeight: 800,
                        fontSize: "10.5px",
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        width: "100%",
                        boxShadow: "0 5px 10px rgba(249,115,22,0.12)",
                    }}>
                    See All
                </button>
            ) : null}
        </div>
    </div>
);

export default IncomingSignalList;
