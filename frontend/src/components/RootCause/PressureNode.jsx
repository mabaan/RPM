import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const getPressureColor = (pressure) => {
    if (pressure >= 71) return { bg: 'bg-red-500', border: 'border-red-400', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]' };
    if (pressure >= 31) return { bg: 'bg-mashreq-yellow', border: 'border-yellow-300', glow: 'shadow-[0_0_15px_rgba(255,196,0,0.4)]' };
    return { bg: 'bg-emerald-500', border: 'border-emerald-400', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]' };
};

const getPressureLabel = (pressure) => {
    if (pressure >= 71) return 'Critical';
    if (pressure >= 31) return 'Moderate';
    return 'Healthy';
};

const getSubtitle = (type, pressure) => {
    if (type === 'root') return 'Organization Overview';
    if (type === 'department') return 'Department Unit';
    return 'Issue Detected';
};

const PressureNode = ({ data, isConnectable }) => {
    const { pressure, label, type, srcData } = data;
    const colors = getPressureColor(pressure);
    const isRoot = type === 'root';
    const subtitle = getSubtitle(type, pressure);
    const statusLabel = getPressureLabel(pressure);

    return (
        <div className={`relative flex flex-col items-center justify-center p-8 rounded-2xl backdrop-blur-md transition-all duration-300 ${colors.bg} ${colors.glow} bg-opacity-90 border-2 ${colors.border} min-w-[300px] min-h-[170px]`}>

            {/* Input Handle (Top) - not for root */}
            {!isRoot && (
                <Handle
                    type="target"
                    position={Position.Top}
                    isConnectable={isConnectable}
                    className="w-4 h-4 bg-white border-2 border-gray-400"
                />
            )}

            <div className="text-center w-full mt-3">
                {/* Subtitle / Type */}
                <div className="text-white/70 text-sm uppercase tracking-widest font-semibold mb-1">
                    {subtitle}
                </div>

                {/* Main Label */}
                <div className="text-white font-bold text-2xl mb-2">{label}</div>

                {/* Status Badge */}
                <div className="flex items-center justify-center gap-2 mb-3">
                    <span className={`text-[12px] uppercase tracking-wider font-bold px-3.5 py-1.5 rounded-full ${pressure >= 71 ? 'bg-red-700/50 text-red-100' :
                        pressure >= 31 ? 'bg-yellow-600/50 text-yellow-100' :
                            'bg-emerald-700/50 text-emerald-100'
                        }`}>
                        {statusLabel}
                    </span>
                </div>

                {/* Pressure Bar */}
                <div className="flex items-center justify-center gap-4">
                    <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden max-w-[140px]">
                        <div
                            className="h-full bg-white/90 rounded-full transition-all duration-500"
                            style={{ width: `${pressure}%` }}
                        />
                    </div>
                    <span className="text-lg text-white font-mono font-bold">{pressure}%</span>
                </div>
            </div>

            {/* Output Handle (Bottom) */}
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-4 h-4 bg-white border-2 border-gray-400"
            />
        </div>
    );
};

export default memo(PressureNode);
