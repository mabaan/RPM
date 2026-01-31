import React from 'react';
import { LayoutDashboard, FileText, BarChart2, Settings } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    ];

    return (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 h-[20vh] w-20 flex flex-col justify-center items-center z-50 pointer-events-none scale-[0.95]">
            <div
                className="relative w-full h-full bg-white/60 backdrop-blur-xl rounded-[3rem] flex flex-col items-center py-6 pointer-events-auto shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-white/40 transition-all duration-500 hover:scale-[1.02]"
            >
                {/* Decorative inner glow */}
                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-b from-white/40 to-transparent opacity-80 pointer-events-none"></div>

                {/* Top decorative dot */}
                <div className="w-1.5 h-1.5 rounded-full bg-black/10 mb-2"></div>

                <div className="flex flex-col w-full h-full justify-center items-center py-8 gap-8">
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`group relative flex items-center justify-center p-2 transition-all duration-500 ${isActive ? 'scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-mashreq-orange/10 blur-xl rounded-full"></div>
                                )}
                                <div className={`relative z-10 p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-gradient-to-br from-mashreq-orange to-mashreq-yellow shadow-md text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                    <Icon size={24} />
                                </div>

                                {/* Floating Label */}
                                <span className="absolute right-full mr-4 px-3 py-1 bg-white/80 backdrop-blur-md border border-white/40 rounded-lg text-gray-700 text-xs font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-sm">
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Bottom decorative dot */}
                <div className="w-1.5 h-1.5 rounded-full bg-black/10 mt-2"></div>
            </div>
        </div>
    );
};

export default Sidebar;
