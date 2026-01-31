import React from "react";
import { ChevronLeft, BarChart, Activity, FileText, ExternalLink } from "lucide-react";

const SignalDetail = ({ selectedSignal, onBack, getSourceIcon }) => {
    if (!selectedSignal) return null;

    return (
        <div className="flex-1 flex flex-col animate-fade-in">
            <button
                onClick={onBack}
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
                        <h3 className="text-2xl font-bold text-gray-900 leading-snug">{selectedSignal.summary}</h3>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-mashreq-orange">{(selectedSignal.confidence * 100).toFixed(0)}%</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">AI Confidence</div>
                    </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm border-l-2 border-mashreq-orange pl-4 bg-mashreq-orange/5 py-2 pr-2 rounded-r">
                    <span className="font-semibold text-mashreq-orange block mb-1 text-xs uppercase">AI Analysis</span>
                    {selectedSignal.aiAnalysis}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/40 rounded-xl p-4 border border-white/40 h-32 flex flex-col justify-center items-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 to-transparent"></div>
                    <BarChart className="text-gray-300 mb-2 group-hover:text-mashreq-orange transition-colors" />
                    <span className="text-xs text-gray-500 relative z-10">Sentiment Trend</span>
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
                    <div className="bg-gradient-to-r from-mashreq-orange/5 to-transparent border border-mashreq-orange/20 rounded-lg p-3 flex gap-3 items-center">
                        <div className="text-mashreq-orange p-1.5 bg-white rounded-full shadow-sm">{getSourceIcon(selectedSignal.source)}</div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-800 font-medium">"{selectedSignal.content}"</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] text-mashreq-orange uppercase font-bold tracking-wider">Primary Trigger</span>
                                <span className="text-[10px] text-gray-400">@{selectedSignal.user}</span>
                            </div>
                        </div>
                        <a href="#" className="text-gray-300 hover:text-mashreq-orange">
                            <ExternalLink size={14} />
                        </a>
                    </div>

                    {selectedSignal.evidence && selectedSignal.evidence.length > 0 ? (
                        selectedSignal.evidence.map((ev, i) => (
                            <div key={i} className="bg-white/60 border border-white/80 rounded-lg p-3 flex gap-3 items-center hover:bg-white transition-colors">
                                <div className="text-gray-400">{getSourceIcon(ev.source)}</div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-600">{ev.text}</p>
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono">{ev.time}</span>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="text-gray-400 text-xs">No correlated cross-channel evidence found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignalDetail;
