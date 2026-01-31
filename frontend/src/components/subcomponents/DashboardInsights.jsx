import React from "react";

const DashboardInsights = ({ stats, priorityPie }) => (
    <div className="flex justify-center w-full px-10" style={{ marginTop: "18px" }}>
        <div className="w-full max-w-7xl">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                <div
                    className="insight-card"
                    style={{
                        background: "rgba(255,255,255,0.78)",
                        border: "1px solid rgba(226,232,240,0.7)",
                        borderRadius: "16px",
                        padding: "16px",
                        boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
                    }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
                        <span className="uppercase text-[11px] font-semibold tracking-wide text-gray-500">Incident Volume by Category</span>
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                        {Object.entries(stats.byCategory)
                            .sort((a, b) => b[1] - a[1])
                            .map(([cat, count]) => {
                                const max = Math.max(...Object.values(stats.byCategory));
                                const pct = max ? Math.round((count / max) * 100) : 0;
                                return (
                                    <div key={cat}>
                                        <div className="flex justify-between text-[11px] text-gray-600 mb-1">
                                            <span className="font-semibold capitalize">{cat}</span>
                                            <span>{count}</span>
                                        </div>
                                        <div style={{ height: "10px", background: "#F1F5F9", borderRadius: "999px", overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #f97316, #fb923c)" }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                <div
                    className="insight-card"
                    style={{
                        background: "rgba(255,255,255,0.78)",
                        border: "1px solid rgba(226,232,240,0.7)",
                        borderRadius: "16px",
                        padding: "16px",
                        boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
                    }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
                        <span className="uppercase text-[11px] font-semibold tracking-wide text-gray-500">Priority Distribution</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                        <div
                            style={{
                                width: "150px",
                                height: "150px",
                                borderRadius: "50%",
                                background: priorityPie.gradient,
                                position: "relative",
                                boxShadow: "inset 0 0 0 12px rgba(255,255,255,0.75)",
                            }}>
                            <div
                                style={{
                                    position: "absolute",
                                    inset: "22px",
                                    background: "rgba(255,255,255,0.92)",
                                    borderRadius: "50%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center",
                                }}>
                                <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>{stats.total}</div>
                                <div style={{ fontSize: "11px", color: "#64748b" }}>Total incidents</div>
                            </div>
                        </div>
                        <div style={{ display: "grid", gap: "6px", minWidth: "90px", paddingLeft: "90px" }}>
                            {priorityPie.segments.map((seg) => (
                                <div key={seg.key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: seg.color }}></span>
                                    <span className="text-[10px] text-gray-600">{seg.key}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div
                    className="insight-card"
                    style={{
                        background: "rgba(255,255,255,0.78)",
                        border: "1px solid rgba(226,232,240,0.7)",
                        borderRadius: "16px",
                        padding: "16px",
                        boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
                    }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
                        <span className="uppercase text-[11px] font-semibold tracking-wide text-gray-500">Status Snapshot</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0px, 1fr))", gap: "10px", marginTop: "25px" }}>
                        {[
                            ["Open", stats.status.Open || 0, "#F97316", "In progress"],
                            ["Escalated", stats.status.Escalated || 0, "#f59e0b", "High priority"],
                            ["Unverified", stats.status.Unverified || 0, "#94a3b8", "Needs review"],
                        ].map(([label, val, color, note]) => (
                            <div
                                key={label}
                                style={{
                                    background: "rgba(248,250,252,0.95)",
                                    borderRadius: "12px",
                                    padding: "12px 10px",
                                    border: "1px solid rgba(226,232,240,0.7)",
                                    display: "grid",
                                    gap: "6px",
                                }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }}></span>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: "18px", color: "#0f172a" }}>{val}</div>
                                <div style={{ fontSize: "10px", color: "#94a3b8" }}>{note}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: "20px", fontSize: "13px", color: "rgb(100, 116, 139)", fontWeight: 600 }}>
                        Average confidence: <span style={{ fontWeight: 800, color: "rgb(15, 23, 42)" }}>{stats.avgConfidence}%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default DashboardInsights;
