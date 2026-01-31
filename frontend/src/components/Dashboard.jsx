import React, { useState } from "react";
import {
    Activity,
    Shield,
    CheckCircle,
    AlertTriangle,
    Info,
    Clock,
    Mail,
    MessageSquare,
    FileText,
    ChevronLeft,
    BarChart,
    ExternalLink,
} from "lucide-react";
import { syntheticSocialData } from "../data/syntheticData";

const sentimentCountries = [
    { iso: "PAK", name: "Pakistan", sentiment: -0.35, label: "Rising Concerns" },
    { iso: "EGY", name: "Egypt", sentiment: 0.1, label: "Mixed Signals" },
    { iso: "ARE", name: "UAE", sentiment: 0.55, label: "Positive Momentum" },
];

const mapRegions = [
    {
        iso: "EGY",
        name: "Egypt",
        sentiment: 0.1,
        label: "Mixed Signals",
        points: "60,95 92,85 112,105 95,128 62,120",
        labelPos: { x: 55, y: 78 },
    },
    {
        iso: "PAK",
        name: "Pakistan",
        sentiment: -0.35,
        label: "Rising Concerns",
        points: "125,62 150,50 175,70 168,112 132,122 108,92",
        labelPos: { x: 112, y: 46 },
    },
    {
        iso: "ARE",
        name: "UAE",
        sentiment: 0.55,
        label: "Positive Momentum",
        points: "190,102 220,95 236,112 210,128 186,118",
        labelPos: { x: 186, y: 90 },
    },
];

const getSentimentColor = (value) => {
    if (value === undefined || value === null) return "#E5E7EB";
    if (value >= 0.5) return "#16A34A";
    if (value >= 0.15) return "#86EFAC";
    if (value <= -0.5) return "#DC2626";
    if (value <= -0.15) return "#FCA5A5";
    return "#F59E0B";
};

const Dashboard = () => {
    const [selectedSignal, setSelectedSignal] = useState(null);
    const [hoveredCountry, setHoveredCountry] = useState(null);
    const [activeCountry, setActiveCountry] = useState(null);

    // Function to render source icon
    const getSourceIcon = (source) => {
        if (source === "Email") return <Mail size={14} />;
        if (source === "Chatbot") return <MessageSquare size={14} />;
        if (source === "Twitter" || source === "Social") return <Activity size={14} />;
        return <FileText size={14} />;
    };

    return (
        <div className="h-full flex flex-col pb-10">
            <div className="flex-1 min-h-[5vh]"></div>

            <div className="flex justify-center w-full px-10">
                {/* Main Container - Scaled for 'Zoomed Out' feel */}
                <div className="w-full max-w-7xl bg-white/40 backdrop-blur-xl rounded-3xl p-8 min-h-[600px] flex flex-col relative overflow-hidden shadow-2xl border border-white/60">
                    {/* Header */}
                    <div
                        className="flex justify-between items-start mb-6 z-10 pt-2 px-2"
                        style={{ marginLeft: "15px", marginRight: "15px" }}>
                        <div className="flex flex-col gap-1">
                            <h2
                                className="text-3xl font-bold text-gray-900 tracking-tight"
                                style={{ marginLeft: "15px", marginTop: "10px" }}>
                                Social Signal Intelligence
                            </h2>
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-2 h-2 bg-mashreq-orange rounded-full animate-pulse"
                                    style={{ marginLeft: "15px" }}></span>
                                <span className="text-xs text-gray-500 uppercase tracking-widest">
                                    Live Monitoring Active
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Area: Split View */}
                    <div
                        className="flex flex-col lg:flex-row gap-8 flex-1 relative z-10"
                        style={{ marginLeft: "15px", marginRight: "15px", marginTop: "15px" }}>
                        {/* Left: Interactive Main Panel (Detail or Heatmap) */}
                        <div
                            className="flex-[2] flex flex-col relative transition-all duration-500"
                            style={{ marginRight: "10px" }}>
                            {selectedSignal ? (
                                // DETAIL VIEW
                                <div className="flex-1 flex flex-col animate-fade-in">
                                    <button
                                        onClick={() => setSelectedSignal(null)}
                                        className="flex items-center gap-2 text-gray-500 hover:text-mashreq-orange mb-4 transition-colors w-fit text-sm font-medium">
                                        <ChevronLeft size={16} /> Back to Overview
                                    </button>

                                    <div className="bg-white/60 border border-white/60 rounded-2xl p-6 mb-6 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span
                                                    className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase mb-2 ${
                                                        selectedSignal.riskLevel === "High"
                                                            ? "bg-red-50 text-red-600 border border-red-100"
                                                            : selectedSignal.riskLevel === "Medium"
                                                              ? "bg-yellow-50 text-yellow-600 border border-yellow-100"
                                                              : "bg-green-50 text-green-600 border border-green-100"
                                                    }`}>
                                                    {selectedSignal.type}
                                                </span>
                                                <h3 className="text-2xl font-bold text-gray-900 leading-snug">
                                                    {selectedSignal.summary}
                                                </h3>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-4xl font-bold text-mashreq-orange">
                                                    {(selectedSignal.confidence * 100).toFixed(0)}%
                                                </div>
                                                <div className="text-xs text-gray-400 uppercase tracking-wider">
                                                    AI Confidence
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed text-sm border-l-2 border-mashreq-orange pl-4 bg-mashreq-orange/5 py-2 pr-2 rounded-r">
                                            <span className="font-semibold text-mashreq-orange block mb-1 text-xs uppercase">
                                                AI Analysis
                                            </span>
                                            {selectedSignal.aiAnalysis}
                                        </p>
                                    </div>

                                    {/* Charts / Analysis - Filled Empty Space */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white/40 rounded-xl p-4 border border-white/40 h-32 flex flex-col justify-center items-center relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 to-transparent"></div>
                                            <BarChart className="text-gray-300 mb-2 group-hover:text-mashreq-orange transition-colors" />
                                            <span className="text-xs text-gray-500 relative z-10">Sentiment Trend</span>
                                            {/* Fake bars */}
                                            <div className="flex items-end gap-1 mt-2 h-8">
                                                <div className="w-1 h-3 bg-gray-300 rounded-t"></div>
                                                <div className="w-1 h-5 bg-gray-300 rounded-t"></div>
                                                <div className="w-1 h-8 bg-mashreq-orange rounded-t"></div>
                                                <div className="w-1 h-4 bg-gray-300 rounded-t"></div>
                                            </div>
                                        </div>
                                        <div className="bg-white/40 rounded-xl p-4 border border-white/40 h-32 flex flex-col justify-center items-center relative">
                                            <Activity className="text-gray-300 mb-2" />
                                            <span className="text-xs text-gray-500">Volume Spike</span>
                                            <div className="text-xl font-bold text-gray-700 mt-1">+124%</div>
                                        </div>
                                    </div>

                                    {/* Evidence Section - Expanded */}
                                    <div className="bg-white/40 rounded-xl p-4 border border-white/50 flex-1">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                                <FileText size={14} /> Supporting Evidence (RAG)
                                            </h4>
                                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-400">
                                                Total Sources: {selectedSignal.evidence?.length + 1 || 1}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Primary Source */}
                                            <div className="bg-gradient-to-r from-mashreq-orange/5 to-transparent border border-mashreq-orange/20 rounded-lg p-3 flex gap-3 items-center">
                                                <div className="text-mashreq-orange p-1.5 bg-white rounded-full shadow-sm">
                                                    {getSourceIcon(selectedSignal.source)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-800 font-medium">
                                                        "{selectedSignal.content}"
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] text-mashreq-orange uppercase font-bold tracking-wider">
                                                            Primary Trigger
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">
                                                            @{selectedSignal.user}
                                                        </span>
                                                    </div>
                                                </div>
                                                <a href="#" className="text-gray-300 hover:text-mashreq-orange">
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>

                                            {selectedSignal.evidence && selectedSignal.evidence.length > 0 ? (
                                                selectedSignal.evidence.map((ev, i) => (
                                                    <div
                                                        key={i}
                                                        className="bg-white/60 border border-white/80 rounded-lg p-3 flex gap-3 items-center hover:bg-white transition-colors">
                                                        <div className="text-gray-400">{getSourceIcon(ev.source)}</div>
                                                        <div className="flex-1">
                                                            <p className="text-xs text-gray-600">{ev.text}</p>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 font-mono">
                                                            {ev.time}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
                                                    <p className="text-gray-400 text-xs">
                                                        No correlated cross-channel evidence found.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // OVERVIEW VIEW (Heatmap Placeholder)
                                <div
                                    className="flex-1 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-2xl bg-white/30 backdrop-blur-sm relative overflow-hidden group transition-all hover:bg-white/50"
                                    style={{ marginLeft: "15px", marginBottom: "10px" }}>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-mashreq-orange/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                    <div className="w-full px-6 pt-6 pb-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
                                                Sentiment Heatmap
                                            </p>
                                            <h3 className="text-xl font-semibold text-gray-900 mt-1">
                                                Regional Signal Pulse
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400">
                                            <span className="w-2 h-2 rounded-full bg-mashreq-orange animate-pulse"></span>
                                            Live
                                        </div>
                                    </div>

                                    <div className="w-full px-6 pb-6">
                                        <div className="bg-white/70 border border-white/80 rounded-2xl shadow-sm p-4 relative">
                                            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-mashreq-orange/10 blur-2xl"></div>
                                            <div className="absolute -left-8 bottom-0 w-32 h-32 rounded-full bg-gray-200/40 blur-3xl"></div>

                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
                                                    <Activity size={14} className="text-mashreq-orange" />
                                                    Focus Countries
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                        Negative
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                                        Mixed
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                        Positive
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <svg
                                                    className="w-full h-[260px]"
                                                    viewBox="0 0 300 180"
                                                    role="img"
                                                    aria-label="Stylized sentiment map for Pakistan, Egypt, and UAE">
                                                    <defs>
                                                        <linearGradient id="heat-bg" x1="0" y1="0" x2="1" y2="1">
                                                            <stop offset="0%" stopColor="#F3F4F6" />
                                                            <stop offset="100%" stopColor="#FFFFFF" />
                                                        </linearGradient>
                                                    </defs>
                                                    <rect x="0" y="0" width="300" height="180" fill="url(#heat-bg)" />
                                                    <path
                                                        d="M20 40 C 60 10, 140 10, 180 40 S 260 70, 290 50"
                                                        fill="none"
                                                        stroke="#E5E7EB"
                                                        strokeWidth="2"
                                                    />
                                                    <path
                                                        d="M10 120 C 70 150, 170 150, 250 120"
                                                        fill="none"
                                                        stroke="#F3F4F6"
                                                        strokeWidth="2"
                                                    />

                                                    {mapRegions.map((region) => {
                                                        const isActive = activeCountry?.iso === region.iso;
                                                        return (
                                                            <g key={region.iso}>
                                                                <polygon
                                                                    points={region.points}
                                                                    fill={getSentimentColor(region.sentiment)}
                                                                    stroke={isActive ? "#111827" : "#FFFFFF"}
                                                                    strokeWidth={isActive ? 2 : 1}
                                                                    onMouseEnter={() => setHoveredCountry(region)}
                                                                    onMouseLeave={() => setHoveredCountry(null)}
                                                                    onClick={() => setActiveCountry(region)}
                                                                    style={{ cursor: "pointer" }}
                                                                />
                                                                <circle
                                                                    cx={region.labelPos.x + 6}
                                                                    cy={region.labelPos.y + 6}
                                                                    r="3"
                                                                    fill="#111827"
                                                                    opacity="0.6"
                                                                />
                                                                <text
                                                                    x={region.labelPos.x}
                                                                    y={region.labelPos.y}
                                                                    fill="#374151"
                                                                    fontSize="7"
                                                                    fontWeight="600"
                                                                    letterSpacing="0.08em">
                                                                    {region.name.toUpperCase()}
                                                                </text>
                                                            </g>
                                                        );
                                                    })}
                                                </svg>

                                                {hoveredCountry ? (
                                                    <div className="absolute left-4 bottom-4 bg-gray-900 text-white text-[11px] px-3 py-2 rounded-xl shadow-lg">
                                                        <div className="font-semibold">{hoveredCountry.name}</div>
                                                        <div className="text-gray-300 uppercase tracking-wider text-[9px]">
                                                            {hoveredCountry.label}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="absolute left-4 bottom-4 bg-white/80 text-gray-500 text-[11px] px-3 py-2 rounded-xl shadow-sm border border-white">
                                                        Hover a country for details
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 grid grid-cols-3 gap-3">
                                                {sentimentCountries.map((country) => (
                                                    <button
                                                        key={country.iso}
                                                        onClick={() => setActiveCountry(country)}
                                                        className={`flex flex-col gap-1 p-3 rounded-xl border text-left transition-all ${
                                                            activeCountry?.iso === country.iso
                                                                ? "border-mashreq-orange bg-mashreq-orange/10"
                                                                : "border-white/80 bg-white/60 hover:bg-white"
                                                        }`}>
                                                        <span className="text-xs font-semibold text-gray-800">
                                                            {country.name}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                                                            {country.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Incoming Signal Stream */}
                        <div className="flex-1 flex flex-col min-w-[340px]" style={{ marginLeft: "10px" }}>
                            <div className="flex justify-between items-end mb-4 px-2">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                    Incoming Cases
                                </h3>
                                <span
                                    className="text-[10px] text-white bg-mashreq-orange px-2 py-1 rounded-full shadow-sm animate-pulse"
                                    style={{ marginRight: "15px" }}>
                                    Live
                                </span>
                            </div>

                            <div
                                className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar h-0 min-h-full pb-4"
                                style={{ marginRight: "15px" }}>
                                {syntheticSocialData.map((signal) => (
                                    <div
                                        key={signal.id}
                                        onClick={() => setSelectedSignal(signal)}
                                        className={`p-5 rounded-xl border-l-4 transition-all duration-300 group cursor-pointer shadow-sm ${
                                            selectedSignal?.id === signal.id
                                                ? "bg-white border-l-mashreq-orange scale-[1.02] shadow-md ring-1 ring-black/5"
                                                : "border-l-transparent hover:border-l-mashreq-orange bg-white/50 hover:bg-white hover:shadow-md"
                                        }`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                {signal.riskLevel === "High" ? (
                                                    <AlertTriangle size={14} className="text-red-500" />
                                                ) : signal.riskLevel === "Medium" ? (
                                                    <Info size={14} className="text-mashreq-yellow" />
                                                ) : (
                                                    <CheckCircle size={14} className="text-green-500" />
                                                )}
                                                <span
                                                    className={`text-[10px] font-bold uppercase ${
                                                        signal.riskLevel === "High"
                                                            ? "text-red-600"
                                                            : signal.riskLevel === "Medium"
                                                              ? "text-yellow-600"
                                                              : "text-green-600"
                                                    }`}>
                                                    {signal.type}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                                                <Clock size={12} /> {signal.timestamp}
                                            </span>
                                        </div>

                                        <h4 className="text-sm font-semibold text-gray-800 leading-snug group-hover:text-black transition-colors line-clamp-2">
                                            {signal.summary || signal.content}
                                        </h4>

                                        <div
                                            className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100"
                                            style={{ marginBottom: "20px" }}>
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium uppercase tracking-wide">
                                                {getSourceIcon(signal.source)} {signal.source}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-mono group-hover:bg-mashreq-orange/10 group-hover:text-mashreq-orange transition-colors">
                                                    {(signal.confidence * 100).toFixed(0)}% Conf
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Background Visuals */}
                    <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-mashreq-orange/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
                </div>
            </div>

            <div className="flex-1"></div>
        </div>
    );
};

export default Dashboard;
