import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Link2, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

const NodeDetailsModal = ({ isOpen, onClose, nodeData, onEliminate }) => {
    if (!isOpen || !nodeData) return null;

    const { title, name, summary, pressure, type, crossLinks, sourceSignals, id } = nodeData;

    // Determine header color based on pressure
    const getHeaderColor = (p) => {
        if (p >= 71) return 'bg-red-500';
        if (p >= 31) return 'bg-mashreq-yellow';
        return 'bg-emerald-500';
    };

    const headerColor = getHeaderColor(pressure);
    const displayTitle = title || name;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-transparent" // Transparent backdrop
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
                >
                    {/* Header */}
                    <div className={`${headerColor} p-6 pb-8 text-white relative overflow-hidden transition-colors duration-300`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                            <Activity size={120} />
                        </div>

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <div className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                    {type === 'root' ? 'Organization' : type === 'department' ? 'Department' : 'Problem Node'}
                                </div>
                                <h2 className="text-2xl font-bold">{displayTitle}</h2>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="relative z-10 mt-4 flex items-center gap-3">
                            <div className="text-4xl font-bold">{pressure}%</div>
                            <div className="text-sm opacity-90 leading-tight">
                                Current Pressure<br />Level
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">

                        {/* Summary */}
                        {summary && (
                            <div>
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">AI Summary</h3>
                                <div className="text-gray-800 leading-relaxed bg-white/50 p-3 rounded-lg border border-white/60">
                                    {summary}
                                </div>
                            </div>
                        )}

                        {/* Source Signals */}
                        {sourceSignals && sourceSignals.length > 0 && (
                            <div>
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Source Signals</h3>
                                <div className="flex flex-wrap gap-2">
                                    {sourceSignals.map((signal, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                                            <AlertTriangle size={12} />
                                            {signal}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cross Links */}
                        {crossLinks && crossLinks.length > 0 && (
                            <div>
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Cross-Department Links</h3>
                                <div className="space-y-2">
                                    {crossLinks.map((link, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                            <Link2 size={16} className="text-mashreq-orange" />
                                            <span>Linked to node <span className="font-mono bg-gray-100 px-1 rounded">{link}</span></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Area */}
                        <div className="pt-4 border-t border-gray-100">
                            <button
                                onClick={() => onEliminate(id)}
                                className="w-full py-4 bg-gradient-to-r from-mashreq-orange to-mashreq-yellow rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                            >
                                <Zap className="group-hover:text-yellow-100 fill-current" />
                                Initiate Resolution Protocol
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-2">
                                Resolving this issue will relieve pressure on parent nodes.
                            </p>
                        </div>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default NodeDetailsModal;
