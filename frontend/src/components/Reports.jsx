import React from 'react';
import { Search, Filter, Download } from 'lucide-react';

const Reports = ({ type }) => {
    const isIncidents = type === 'reports';

    // Dummy Data
    const incidents = [
        { id: 'INC-2024-001', type: 'Server Outage', priority: 'High', status: 'Resolving', time: '10:42 AM' },
        { id: 'INC-2024-002', type: 'Database Latency', priority: 'Medium', status: 'Investigating', time: '11:15 AM' },
        { id: 'INC-2024-003', type: 'API Timeout', priority: 'Low', status: 'Open', time: '12:30 PM' },
    ];

    const analytics = [
        { id: 'RPT-8821', name: 'Monthly Transaction Summary', date: 'Jan 30, 2026', size: '2.4 MB' },
        { id: 'RPT-8822', name: 'User Growth Q1', date: 'Jan 28, 2026', size: '1.1 MB' },
        { id: 'RPT-8823', name: 'Security Audit Logs', date: 'Jan 25, 2026', size: '15.6 MB' },
    ];

    return (
        <div className="glass-panel rounded-2xl p-6 h-full animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white capitalize">{isIncidents ? 'Incident Reports' : 'Analytics & Logs'}</h2>
                    <p className="text-sm text-white/50 mt-1">View and manage system reports</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-white/5 border border-white/10 rounded-full py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-mashreq-orange"
                        />
                        <Search className="absolute right-3 top-2.5 text-white/30" size={16} />
                    </div>
                    <button className="p-2 bg-white/5 border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/10">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="py-4 px-4 text-sm font-medium text-white/40 uppercase tracking-wider">ID</th>
                            <th className="py-4 px-4 text-sm font-medium text-white/40 uppercase tracking-wider">{isIncidents ? 'Issue Type' : 'Report Name'}</th>
                            <th className="py-4 px-4 text-sm font-medium text-white/40 uppercase tracking-wider">{isIncidents ? 'Priority' : 'Date Generated'}</th>
                            <th className="py-4 px-4 text-sm font-medium text-white/40 uppercase tracking-wider">{isIncidents ? 'Status' : 'Size'}</th>
                            <th className="py-4 px-4 text-sm font-medium text-white/40 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {(isIncidents ? incidents : analytics).map((item, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                <td className="py-4 px-4 text-white font-mono text-sm opacity-80">{item.id}</td>
                                <td className="py-4 px-4 text-white font-medium">{isIncidents ? item.type : item.name}</td>
                                <td className="py-4 px-4">
                                    {isIncidents ? (
                                        <span className={`px-2 py-1 rounded text-xs border ${item.priority === 'High' ? 'border-red-500/50 text-red-500 bg-red-500/10' :
                                                item.priority === 'Medium' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' :
                                                    'border-blue-500/50 text-blue-500 bg-blue-500/10'
                                            }`}>
                                            {item.priority}
                                        </span>
                                    ) : (
                                        <span className="text-white/60 text-sm">{item.date}</span>
                                    )}
                                </td>
                                <td className="py-4 px-4">
                                    {isIncidents ? (
                                        <span className="text-white/80 text-sm flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Resolving' ? 'bg-orange-500 animate-pulse' : 'bg-gray-500'}`}></div>
                                            {item.status}
                                        </span>
                                    ) : (
                                        <span className="text-white/50 text-sm font-mono">{item.size}</span>
                                    )}
                                </td>
                                <td className="py-4 px-4">
                                    <button className="text-mashreq-orange hover:text-white transition-colors">
                                        <Download size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-center">
                <button className="text-xs text-white/30 hover:text-white transition-colors uppercase tracking-widest">
                    View All {isIncidents ? 'Incidents' : 'Logs'}
                </button>
            </div>
        </div>
    );
};

export default Reports;
