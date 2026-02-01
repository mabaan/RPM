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
                    {/* Header - Full bleed background with internal padding */}
                    <div className={`${headerColor} text-white relative overflow-hidden transition-colors duration-300`}>
                        {/* Background Deco */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                            <Activity size={120} />
                        </div>

                        {/* Content with internal padding */}
                        <div className="relative z-10" style={{ padding: '16px 20px' }}>
                            {/* Top Row: Type, Title, Close */}
                            <div className="flex justify-between items-start">
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

                            {/* Pressure Big Stat */}
                            <div className="mt-4 flex items-center gap-3">
                                <div className="text-4xl font-bold">{pressure}%</div>
                                <div className="text-sm opacity-90 leading-tight">
                                    Current Pressure<br />Level
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Body Section - Full bleed background with internal padding */}
                    <div className="bg-white/50">
                        <div className="space-y-6" style={{ padding: '16px 20px' }}>
                            {/* AI Summary Section */}
                            <div className="mb-6">
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">AI Summary</h3>
                                <div className="text-gray-800 leading-relaxed">
                                    {summary || "No AI summary available for this node."}
                                </div>
                            </div>

                            {/* Action Details */}
                            <div className="pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => onEliminate(id)}
                                    className="w-full py-4 bg-gradient-to-r from-mashreq-orange to-mashreq-yellow rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                                    style={{ marginTop: '10px' }}
                                >
                                    <Zap className="group-hover:text-yellow-100 fill-current" />
                                    Initiate Resolution Protocol
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-2">
                                    Resolving this issue will relieve pressure on parent nodes.
                                </p>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default NodeDetailsModal;
