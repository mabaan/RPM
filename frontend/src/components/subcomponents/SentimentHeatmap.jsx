import React, { useMemo } from "react";
import { Activity } from "lucide-react";

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

    return (
        <div
            className="flex-1 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-2xl bg-white/30 backdrop-blur-sm relative overflow-hidden group transition-all hover:bg-white/50"
            style={{ marginLeft: "15px", marginBottom: "10px" }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-mashreq-orange/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="w-full px-6 pt-6 pb-4 flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Sentiment Heatmap</p>
                    <h3 className="text-xl font-semibold text-gray-900 mt-1">Regional Signal Pulse</h3>
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
                        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/40 to-white/90 rounded-xl"></div>
                        <svg className="w-full h-[260px] relative" viewBox="0 0 560 260" role="img" aria-label="Sentiment map for Pakistan, Egypt, and UAE">
                            <rect x="0" y="0" width="560" height="260" fill="transparent" />
                            {graticulePath ? (
                                <path d={graticulePath} fill="none" stroke="#E5E7EB" strokeWidth={0.6} opacity={0.9} />
                            ) : null}
                            {mapPaths.map((item) => {
                                const data = sentimentByIso[item.iso];
                                const isActive = activeCountry?.iso === item.iso;
                                const isFocus = Boolean(data);
                                return (
                                    <path
                                        key={item.iso}
                                        d={item.d}
                                        fill={isFocus ? getSentimentColor(data?.sentiment) : "#DDF2F8"}
                                        stroke={isFocus ? "#FFFFFF" : "#FFFFFF"}
                                        strokeWidth={isActive ? 2.2 : 0.8}
                                        opacity={isFocus ? 1 : 0.8}
                                        onMouseEnter={() => (data ? onHoverCountry(data) : null)}
                                        onMouseLeave={onLeaveCountry}
                                        onClick={() => (data ? onSelectCountry(data) : null)}
                                        style={{ cursor: data ? "pointer" : "default" }}
                                    />
                                );
                            })}
                        </svg>
                        {!mapPaths.length && !mapError ? (
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">Loading map...</div>
                        ) : null}
                        {mapError ? (
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-red-400">{mapError}</div>
                        ) : null}

                        {hoveredCountry ? (
                            <div className="absolute left-4 bottom-4 bg-gray-900 text-white text-[11px] px-3 py-2 rounded-xl shadow-lg">
                                <div className="font-semibold">{hoveredCountry.name}</div>
                                <div className="text-gray-300 uppercase tracking-wider text-[9px]">{hoveredCountry.label}</div>
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
                                onClick={() => onSelectCountry(country)}
                                className={`flex flex-col gap-1 p-3 rounded-xl border text-left transition-all ${
                                    activeCountry?.iso === country.iso ? "border-mashreq-orange bg-mashreq-orange/10" : "border-white/80 bg-white/60 hover:bg-white"
                                }`}>
                                <span className="text-xs font-semibold text-gray-800">{country.name}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest">{country.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SentimentHeatmap;
