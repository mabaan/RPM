import React from "react";
import { AlertTriangle, Info, CheckCircle, Clock } from "lucide-react";

const IncomingSignalList = ({ signals, selectedSignal, onSelectSignal, getSourceIcon }) => (
    <div className="flex-1 flex flex-col min-w-[340px]" style={{ marginLeft: "10px" }}>
        <div className="flex justify-between items-end mb-4 px-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Incoming Cases</h3>
            <span className="text-[10px] text-white bg-mashreq-orange px-2 py-1 rounded-full shadow-sm animate-pulse" style={{ marginRight: "15px" }}>
                Live
            </span>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar h-0 min-h-full pb-4" style={{ marginRight: "15px" }}>
            {signals.map((signal) => (
                <div
                    key={signal.id}
                    onClick={() => onSelectSignal(signal)}
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
                                    signal.riskLevel === "High" ? "text-red-600" : signal.riskLevel === "Medium" ? "text-yellow-600" : "text-green-600"
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

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100" style={{ marginBottom: "20px" }}>
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
);

export default IncomingSignalList;
