import React, { useMemo } from "react";
import { Activity, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SentimentHeatmap = ({
    mapPaths,
    mapError,
    hoveredCountry,
    onHoverCountry,
    onLeaveCountry,
    activeCountry,
    onSelectCountry,
    sentimentCountries,
    getSentimentColor,
}) => {
    const sentimentByIso = useMemo(
        () =>
            sentimentCountries.reduce((acc, country) => {
                acc[country.iso] = country;
                return acc;
            }, {}),
        [sentimentCountries],
    );

    const graticulePath = mapPaths[0]?.graticule;

    // Generate beams between all focus countries
    const beams = useMemo(() => {
        const activePaths = mapPaths.filter(p => sentimentByIso[p.iso]);
        const lines = [];
        for (let i = 0; i < activePaths.length; i++) {
            for (let j = i + 1; j < activePaths.length; j++) {
                const start = activePaths[i].centroid;
                const end = activePaths[j].centroid;
                // Create a quadratic bezier curve for the beam
                const midX = (start[0] + end[0]) / 2;
                const midY = (start[1] + end[1]) / 2 - 30; // Curve upwards
                lines.push({
                    id: `${activePaths[i].iso}-${activePaths[j].iso}`,
                    d: `M${start[0]},${start[1]} Q${midX},${midY} ${end[0]},${end[1]}`
                });
            }
        }
        return lines;
    }, [mapPaths, sentimentByIso]);

    return (
        <div
            className="flex-1 flex flex-col items-center justify-center text-gray-300 border-2 border-gray-200 rounded-3xl bg-white/30 backdrop-blur-md relative overflow-hidden group transition-all hover:bg-white/40"
            style={{ marginLeft: "15px", marginBottom: "20px" }}>

            {/* Dynamic Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-mashreq-orange/5 via-transparent to-blue-50/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            {/* Header */}
            <div className="w-full px-8 pt-8 pb-4 flex items-center justify-center relative z-10">
                <h3 className="text-xl font-bold text-gray-800 tracking-tight">Regional Sentiment Pulse</h3>
            </div>

            {/* Content Container */}
            <div className="w-full px-8 pb-8 flex-1 flex flex-col relative z-0">
                <div className="bg-white/60 border border-white/80 rounded-3xl shadow-lg p-1 relative flex-1 flex flex-col overflow-hidden">

                    {/* Map Area */}
                    <div className="relative flex-1 bg-gradient-to-br from-indigo-50/30 to-white/50 rounded-2xl overflow-hidden border border-white/50">
                        <svg className="w-full h-full min-h-[300px]" viewBox="0 0 560 220" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                {/* Dynamic Mixed Gradients for each country */}
                                {sentimentCountries.map(country => {
                                    // Custom logic for safe mixing to avoid conflicting colors (e.g. No Red in Green zones)
                                    let stop1, stop2, stop3;

                                    if (country.sentiment >= 0.5) {
                                        // Positive: Green + Emerald + Lime (Safe cool/fresh tones)
                                        stop1 = "#22c55e"; // Green
                                        stop2 = "#34d399"; // Emerald
                                        stop3 = "#a3e635"; // Lime
                                    } else if (country.sentiment <= -0.2) {
                                        // Negative: Red + Orange + Rose (Safe warm/alarm tones)
                                        stop1 = "#ef4444"; // Red
                                        stop2 = "#f97316"; // Orange
                                        stop3 = "#f43f5e"; // Rose
                                    } else {
                                        // Mixed: Amber + Red + Yellow
                                        stop1 = "#f59e0b"; // Amber
                                        stop2 = "#ef4444"; // Red
                                        stop3 = "#facc15"; // Yellow
                                    }

                                    return (
                                        <linearGradient key={country.iso} id={`grad-${country.iso}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor={stop1} stopOpacity="0.8" />
                                            <stop offset="50%" stopColor={stop2} stopOpacity="0.7">
                                                <animate attributeName="offset" values="0.4;0.6;0.4" dur="5s" repeatCount="indefinite" />
                                            </stop>
                                            <stop offset="100%" stopColor={stop3} stopOpacity="0.9" />
                                        </linearGradient>
                                    );
                                })}
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            {/* Graticule */}
                            <path d={graticulePath} fill="none" stroke="#64748B" strokeWidth={0.3} opacity={0.1} />

                            {/* Countries - Rendered BEFORE beams so beams are on top */}
                            {mapPaths.map((item) => {
                                const data = sentimentByIso[item.iso];
                                const isActive = activeCountry?.iso === item.iso;
                                const isHovered = hoveredCountry?.iso === item.iso;
                                const isFocus = Boolean(data);

                                return (
                                    <g key={item.iso}
                                        onClick={() => (data ? onSelectCountry(data) : null)}
                                        onMouseEnter={() => (data ? onHoverCountry(data) : null)}
                                        onMouseLeave={onLeaveCountry}
                                        className="transition-all duration-300"
                                        style={{ cursor: data ? "pointer" : "default" }}
                                    >
                                        <path
                                            d={item.d}
                                            fill={isFocus ? `url(#grad-${item.iso})` : "#F1F5F9"}
                                            stroke={isActive || isHovered ? "#FFFFFF" : isFocus ? "#FFFFFF" : "#E2E8F0"}
                                            strokeWidth={isActive ? 0 : isFocus ? 1 : 0.5}
                                            className="transition-all duration-300"
                                        />
                                        {/* Label for Focus Countries */}
                                        {isFocus && item.centroid && (
                                            <g transform={`translate(${item.centroid[0]}, ${item.centroid[1]})`}>
                                                <circle r="2" fill="#FFFFFF" />
                                                <text y="-8" textAnchor="middle" fontSize="6" fill="#475569" fontWeight="bold" className="uppercase tracking-wider pointer-events-none">
                                                    {data.name}
                                                </text>
                                            </g>
                                        )}
                                    </g>
                                );
                            })}

                            {/* Connection Beams - Rendered AFTER countries to be in foreground */}
                            {beams.map(beam => (
                                <g key={beam.id}>
                                    <path d={beam.d} fill="none" stroke="#CBD5E1" strokeWidth="1" opacity="0.3" />
                                    <path d={beam.d} fill="none" stroke="url(#grad-ARE)" strokeWidth="2" strokeLinecap="round" strokeDasharray="10, 300">
                                        <animate attributeName="stroke-dashoffset" from="310" to="0" dur="3s" repeatCount="indefinite" />
                                    </path>
                                </g>
                            ))}


                        </svg>

                        {/* Country Summary Overlay */}
                        <AnimatePresence>
                            {activeCountry && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-4 right-4 w-64 bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl p-4 z-20"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-900">{activeCountry.name}</h4>
                                        <button onClick={(e) => { e.stopPropagation(); onSelectCountry(null); }} className="text-gray-400 hover:text-gray-600">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        {/* Dynamic Icon Color based directly on getSentimentColor logic */}
                                        {activeCountry.sentiment >= 0.5 ? <TrendingUp size={14} className="text-green-600" /> :
                                            activeCountry.sentiment <= -0.2 ? <TrendingDown size={14} className="text-red-600" /> :
                                                <Minus size={14} className="text-amber-500" />}

                                        <span
                                            className="text-xs font-bold"
                                            style={{ color: getSentimentColor(activeCountry.sentiment) }}
                                        >
                                            {activeCountry.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                                        {activeCountry.summary}
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                        <div className="flex justify-between text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-bold">
                                            <span>Brand Trust Index</span>
                                            <span>{activeCountry.brandTrust}/100</span>
                                        </div>
                                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${activeCountry.brandTrust}%`,
                                                    backgroundColor: getSentimentColor(activeCountry.sentiment)
                                                }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Loading/Error States */}
                        {!mapPaths.length && !mapError && (
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 animate-pulse">Initializing Geospatial Data...</div>
                        )}
                        {mapError && (
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-red-500 bg-red-50/50">{mapError}</div>
                        )}
                    </div>

                    {/* Bottom Controls / Trust Bars - Increased padding (p-4) and spacing */}
                    <div className="mt-2 p-4 grid grid-cols-3 gap-6">
                        {sentimentCountries.map((country) => (
                            <button
                                key={country.iso}
                                onClick={() => onSelectCountry(country)}
                                className={`relative overflow-hidden px-4 py-4 rounded-2xl border transition-all duration-300 group ${activeCountry?.iso === country.iso
                                    ? "bg-white border-mashreq-orange/30 shadow-md ring-1 ring-mashreq-orange/20"
                                    : "bg-white/40 border-transparent hover:bg-white hover:border-white hover:shadow-sm"
                                    }`}>

                                <div className="flex justify-center items-center mb-2 text-center w-full relative">
                                    <span className={`text-xs font-bold ${activeCountry?.iso === country.iso ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"}`}>
                                        {country.name}
                                    </span>
                                    {activeCountry?.iso === country.iso && (
                                        <div className="absolute right-0">
                                            <Activity size={12} className="text-mashreq-orange animate-pulse" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full opacity-80"
                                            style={{
                                                width: `${country.brandTrust}%`,
                                                backgroundColor: getSentimentColor(country.sentiment)
                                            }}
                                        />
                                    </div>
                                    <span className="text-[9px] font-mono text-gray-400 min-w-[20px] text-right">{country.brandTrust}%</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SentimentHeatmap;
