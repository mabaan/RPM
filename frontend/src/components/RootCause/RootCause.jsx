import React, { useState, useCallback } from 'react';
import PressureTree from './PressureTree';
import NodeDetailsModal from './NodeDetailsModal';
import { initialRootCauseData } from './mockData';
import { ShieldCheck, Trophy, Zap, Activity } from 'lucide-react';

const RootCause = () => {
    const [treeData, setTreeData] = useState(initialRootCauseData);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Gamification Stats
    const [stats, setStats] = useState({
        pressureRelieved: 0,
        nodesEliminated: 0,
        streak: 3
    });

    const handleNodeClick = useCallback((nodeData) => {
        setSelectedNode(nodeData);
        setIsModalOpen(true);
    }, []);

    // Recursive function to find and remove node, then recalculate pressures
    const eliminateNode = (nodeId) => {
        const newData = JSON.parse(JSON.stringify(treeData)); // Deep copy

        const deleteFromChildren = (parent) => {
            if (!parent.children) return false;

            const idx = parent.children.findIndex(c => c.id === nodeId);
            if (idx !== -1) {
                const removedNode = parent.children[idx];
                parent.children.splice(idx, 1);
                // Update stats
                setStats(prev => ({
                    ...prev,
                    pressureRelieved: prev.pressureRelieved + removedNode.pressure,
                    nodesEliminated: prev.nodesEliminated + 1
                }));
                return true;
            }

            for (let child of parent.children) {
                if (deleteFromChildren(child)) return true;
            }
            return false;
        };

        const recalculatePressures = (node) => {
            if (!node.children || node.children.length === 0) return node.pressure; // Leaf pressure stays

            // Recurse first
            node.children.forEach(recalculatePressures);

            // Logic: Parent pressure is average of children pressures (or some other aggregate)
            // For demo: weighted average + 10% overhead base
            const avgPressure = node.children.reduce((acc, curr) => acc + curr.pressure, 0) / node.children.length;
            node.pressure = Math.round(avgPressure);
            return node.pressure;
        };

        // Execute removal
        // Note: We only check children of the root/departments because currently root wraps everything
        // Ideally we search everywhere.
        let found = false;
        // Check if it's the root itself? No, we don't safely delete root.

        // Traverse to find and delete
        deleteFromChildren(newData.departments[0]);

        // Recalculate entire tree
        recalculatePressures(newData.departments[0]);

        setTreeData(newData);
        setIsModalOpen(false);
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col w-[90%] h-[90%] gap-2">
                {/* Header */}
                <div className="flex items-center justify-between px-4 mb-2">
                    <div className="flex flex-col items-start gap-1">
                        <h2 className="text-2xl font-bold text-gray-800">Organizational Pressure Map</h2>
                        <p className="text-gray-500 text-sm">Visualize and resolve systemic bottlenecks</p>
                    </div>

                    {/* Stats Top Right */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-3 rounded-xl border border-white/40 shadow-sm min-w-[160px]">
                            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 text-mashreq-orange rounded-full flex-shrink-0">
                                <Zap size={14} />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">Relieved</div>
                                <div className="font-mono font-bold text-gray-800 text-base">{stats.pressureRelieved} PSI</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-3 rounded-xl border border-white/40 shadow-sm min-w-[160px]">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full flex-shrink-0">
                                <SubjectTrophy size={14} />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">Solved</div>
                                <div className="font-mono font-bold text-gray-800 text-base">{stats.nodesEliminated}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Viz Area */}
                <div className="flex-1 min-h-0 relative shadow-[0_0_40px_rgba(0,0,0,0.05)] rounded-3xl border border-gray-200 bg-white/30 p-4 m-2 overflow-hidden">
                    <PressureTree data={treeData} onNodeClick={handleNodeClick} />
                </div>

                <NodeDetailsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    nodeData={selectedNode}
                    onEliminate={eliminateNode}
                />
            </div>
        </div>
    );
};

const SubjectTrophy = ({ size }) => <Trophy size={size} />;

export default RootCause;
