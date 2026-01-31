import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const getPressureColor = (pressure) => {
    if (pressure >= 71) return { bg: 'bg-red-500', border: 'border-red-400', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]' };
    if (pressure >= 31) return { bg: 'bg-mashreq-yellow', border: 'border-yellow-300', glow: 'shadow-[0_0_15px_rgba(255,196,0,0.4)]' };
    return { bg: 'bg-emerald-500', border: 'border-emerald-400', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]' };
};

const PressureNode = ({ data, isConnectable }) => {
    const { pressure, label, type } = data;
    const colors = getPressureColor(pressure);
    const isRoot = type === 'root';

    return (
        <div className={`relative flex flex-col items-center justify-center p-4 rounded-xl backdrop-blur-md transition-all duration-300 ${colors.bg} ${colors.glow} bg-opacity-90 border-2 ${colors.border} min-w-[180px]`}>

            {/* Input Handle (Top) - not for root */}
            {!isRoot && (
                <Handle
                    type="target"
                    position={Position.Top}
                    isConnectable={isConnectable}
                    className="w-3 h-3 bg-white border-2 border-gray-400"
                />
            )}

            <div className="text-center">
                <div className="text-white font-bold text-sm mb-1">{label}</div>
                <div className="flex items-center justify-center gap-2">
                    <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden w-16">
                        <div
                            className="h-full bg-white/90 rounded-full"
                            style={{ width: `${pressure}%` }}
                        />
                    </div>
                    <span className="text-xs text-white/90 font-mono">{pressure}%</span>
                </div>
            </div>

            {/* Output Handle (Bottom) */}
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-white border-2 border-gray-400"
            />
        </div>
    );
};

export default memo(PressureNode);
