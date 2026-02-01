import React, { useEffect, useMemo, useState } from "react";
import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import { Activity, Mail, MessageSquare, FileText } from "lucide-react";
import sampleSignals from "../data/sampleSignals.json";
import DashboardHeader from "./subcomponents/DashboardHeader";
import DashboardInsights from "./subcomponents/DashboardInsights";
import SentimentHeatmap from "./subcomponents/SentimentHeatmap";
import SignalDetail from "./subcomponents/SignalDetail";
import IncomingSignalList from "./subcomponents/IncomingSignalList";
import apiService from "../services/api";

const sentimentCountries = [
    {
        iso: "PAK",
        name: "Pakistan",
        sentiment: -0.35,
        label: "Rising Concerns",
        brandTrust: 45,
        summary: "Social chatter indicates growing frustration regarding app stability and localized service disruptions. Brand trust has dipped by 12% MoM."
    },
    {
        iso: "EGY",
        name: "Egypt",
        sentiment: 0.1,
        label: "Mixed Signals",
        brandTrust: 62,
        summary: "Market sentiment is stabilizing following the recent currency fluctuation. Digital adoption is high, but user experience complaints are surfacing."
    },
    {
        iso: "ARE",
        name: "UAE",
        sentiment: 0.55,
        label: "Positive Momentum",
        brandTrust: 88,
        summary: "Strong positive sentiment driven by the new premium card launch. Customer loyalty metrics are at an all-time high."
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

const getSourceIcon = (source) => {
    if (source === "Email") return <Mail size={14} />;
    if (source === "Chatbot") return <MessageSquare size={14} />;
    if (source === "Twitter" || source === "Social") return <Activity size={14} />;
    return <FileText size={14} />;
};

const Dashboard = ({ onNavigate, selectedSignalId }) => {
    const [selectedSignal, setSelectedSignal] = useState(null);
    const [hoveredCountry, setHoveredCountry] = useState(null);
    const [activeCountry, setActiveCountry] = useState(null);
    const [mapFeatures, setMapFeatures] = useState([]);
    const [mapError, setMapError] = useState(null);
    const [signals, setSignals] = useState(sampleSignals); // Start with static data
    const [isLoadingAPI, setIsLoadingAPI] = useState(false);
    const [apiError, setApiError] = useState(null);

    // Try to fetch data from API on mount
    useEffect(() => {
        const fetchLiveData = async () => {
            try {
                setIsLoadingAPI(true);
                setApiError(null);
                
                // Try to process batch (limit 20 for dashboard)
                const liveData = await apiService.processBatch(20);
                
                // Transform API response to match expected format
                const transformedSignals = liveData.map((card, index) => ({
                    id: `LIVE-${index + 1}`,
                    title: card.title,
                    summary: card.title,
                    content: card.reverse_prompt.situation_background,
                    category: card.category,
                    priority: card.priority,
                    riskLevel: card.priority === 'Critical' || card.priority === 'High' ? 'High' : 
                               card.priority === 'Medium' ? 'Medium' : 'Low',
                    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
                    confidence: 0.85,
                    risk_scores: card.risk_scores,
                    reverse_prompt: card.reverse_prompt,
                    source: "Live API",
                    sourceType: "Backend API",
                    type: card.category,
                    aiAnalysis: card.reverse_prompt.situation_background,
                    status: "Open"
                }));
                
                setSignals(transformedSignals);
                setIsLoadingAPI(false);
            } catch (error) {
                console.error('Failed to fetch live data from API:', error);
                setApiError(error.message);
                setIsLoadingAPI(false);
                // Keep using static data as fallback
            }
        };

        fetchLiveData();
    }, []);

    useEffect(() => {
        const cls = "internal-detail";
        if (selectedSignal) {
            document.body.classList.add(cls);
        } else {
            document.body.classList.remove(cls);
        }
        return () => document.body.classList.remove(cls);
    }, [selectedSignal]);

    useEffect(() => {
        if (!selectedSignalId) return;
        const found = signals.find((signal) => signal.id === selectedSignalId);
        if (found) {
            setSelectedSignal(found);
        }
    }, [selectedSignalId, signals]);

    useEffect(() => {
        const focusIsos = new Set(sentimentCountries.map((country) => country.iso));
        const focusByName = {
            Pakistan: "PAK",
            Egypt: "EGY",
            "United Arab Emirates": "ARE",
        };

        const loadMap = async () => {
            try {
                const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
                if (!response.ok) {
                    throw new Error("Map data failed to load.");
                }
                const topology = await response.json();
                const geo = feature(topology, topology.objects.countries);
                const normalized = geo.features.map((item) => {
                    const nameIso = focusByName[item.properties?.name];
                    const fallbackIso = item.properties?.name || `ID_${item.id}`;
                    const iso = item.properties?.ISO_A3 || nameIso || fallbackIso;
                    return {
                        ...item,
                        properties: { ...item.properties, ISO_A3: iso },
                    };
                });

                const focus = normalized.filter((item) => focusIsos.has(item.properties.ISO_A3));
                if (!focus.length) {
                    throw new Error("No matching countries found in map data.");
                }
                setMapFeatures(normalized);
            } catch (err) {
                setMapError(err.message || "Unable to load map.");
            }
        };

        loadMap();
    }, []);

    const mapPaths = useMemo(() => {
        if (!mapFeatures.length) return [];
        const projection = geoNaturalEarth1().center([50, 25]).scale(500).translate([280, 135]);
        const path = geoPath(projection);
        const graticule = path(geoGraticule10());

        return mapFeatures.map((item) => ({
            iso: item.properties.ISO_A3,
            d: path(item),
            centroid: path.centroid(item), // Calculate centroid [x, y]
            graticule,
        }));
    }, [mapFeatures]);

    const priorityOrder = ["P0", "P1", "P2", "P3"];
    const stats = useMemo(() => {
        const total = signals.length;
        const byCategory = signals.reduce((acc, sig) => {
            const key = sig.category || "uncategorized";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const byPriority = signals.reduce((acc, sig) => {
            const raw = (sig.priority || "P2").toUpperCase();
            const key = raw === "P0" ? "P0" : raw === "P1" ? "P1" : raw === "P2" ? "P2" : "P3";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const status = signals.reduce(
            (acc, sig) => {
                acc[sig.status || "Open"] = (acc[sig.status || "Open"] || 0) + 1;
                return acc;
            },
            { Open: 0, Escalated: 0, Unverified: 0 },
        );
        const byChannel = signals.reduce((acc, sig) => {
            const key = sig.sourceType || sig.source || "Other";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const avgConfidence = total
            ? Math.round((signals.reduce((sum, sig) => sum + (sig.confidence || 0), 0) / total) * 100)
            : 0;
        const riskTotals = signals.reduce(
            (acc, sig) => {
                const scores = sig.risk_scores || {};
                acc.compliance += scores.compliance || 0;
                acc.financial += scores.financial || 0;
                acc.operational += scores.operational || 0;
                acc.churn += scores.churn || 0;
                acc.virality += scores.virality || 0;
                return acc;
            },
            { compliance: 0, financial: 0, operational: 0, churn: 0, virality: 0 },
        );
        const avgRisk = {
            compliance: total ? Math.round(riskTotals.compliance / total) : 0,
            financial: total ? Math.round(riskTotals.financial / total) : 0,
            operational: total ? Math.round(riskTotals.operational / total) : 0,
            churn: total ? Math.round(riskTotals.churn / total) : 0,
            virality: total ? Math.round(riskTotals.virality / total) : 0,
        };
        return { total, byCategory, byPriority, status, byChannel, avgConfidence, avgRisk };
    }, [signals]);

    const priorityPalette = {
        P0: "#D32F2F",
        P1: "#F57C00",
        P2: "#FBC02D",
        P3: "#388E3C",
    };

    const priorityPie = useMemo(() => {
        const total = stats.total || 1;
        let cursor = 0;
        const segments = priorityOrder.map((p) => {
            const val = stats.byPriority[p] || 0;
            const pct = (val / total) * 100;
            const start = cursor;
            const end = cursor + pct;
            cursor = end;
            return {
                key: p,
                val,
                pct,
                color: priorityPalette[p] || "#e5e7eb",
                range: `${start}% ${end}%`,
            };
        });
        const gradient = `conic-gradient(${segments.map((s) => `${s.color} ${s.range}`).join(", ")})`;
        return { segments, gradient };
    }, [stats]);

    return (
        <div className="h-full flex flex-col pb-10">
            <div style={{ minHeight: "12px" }}></div>

            <div className="flex justify-center w-full px-10">
                <div className="w-full max-w-7xl bg-white/40 backdrop-blur-xl rounded-3xl p-8 min-h-[600px] flex flex-col relative overflow-hidden shadow-2xl border border-white/60">
                    <DashboardHeader />

                    <div className="flex flex-col lg:flex-row gap-8 flex-1 relative z-10" style={{ marginLeft: "15px", marginRight: "15px", marginTop: "8px" }}>
                        <div className="flex-[2] flex flex-col relative transition-all duration-500" style={{ marginRight: "10px" }}>
                            {selectedSignal ? (
                                <SignalDetail selectedSignal={selectedSignal} onBack={() => setSelectedSignal(null)} getSourceIcon={getSourceIcon} />
                            ) : (
                                <SentimentHeatmap
                                    mapPaths={mapPaths}
                                    mapError={mapError}
                                    hoveredCountry={hoveredCountry}
                                    onHoverCountry={setHoveredCountry}
                                    onLeaveCountry={() => setHoveredCountry(null)}
                                    activeCountry={activeCountry}
                                    onSelectCountry={setActiveCountry}
                                    sentimentCountries={sentimentCountries}
                                    getSentimentColor={getSentimentColor}
                                />
                            )}
                        </div>

                        <IncomingSignalList
                            signals={signals}
                            selectedSignal={selectedSignal}
                            onSelectSignal={setSelectedSignal}
                            getSourceIcon={getSourceIcon}
                            onSeeAll={() => onNavigate?.("reports")}
                            isLoadingAPI={isLoadingAPI}
                            apiError={apiError}
                        />
                    </div>

                    <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-mashreq-orange/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
                </div>
            </div>

            {/* Insight cards under main panel */}
            {!selectedSignal ? <DashboardInsights stats={stats} priorityPie={priorityPie} /> : null}
            <div className="flex-1"></div>
        </div>
    );
};

export default Dashboard;

