import React from 'react';
import { LayoutDashboard, FileText, BarChart2, Settings } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', meta: 'Live signals' },
        { id: 'reports', icon: FileText, label: 'Reports', meta: 'Case library' },
        { id: 'analytics', icon: BarChart2, label: 'Analytics', meta: 'Root cause' },
        { id: 'settings', icon: Settings, label: 'Settings', meta: 'Workspace' },
    ];

    return (
        <div className="fixed right-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
            <div
                className="relative pointer-events-auto"
                style={{
                    width: '92px',
                    background: 'rgba(255,255,255,0.72)',
                    border: '1px solid rgba(226,232,240,0.7)',
                    borderRadius: '28px',
                    padding: '16px 10px',
                    boxShadow: '0 18px 36px rgba(15,23,42,0.12)',
                    backdropFilter: 'blur(18px)',
                }}>
                <div
                    style={{
                        position: 'absolute',
                        inset: '8px',
                        borderRadius: '22px',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.2))',
                        pointerEvents: 'none',
                    }}></div>

                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>

                    {menuItems.map((item) => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '10px',
                                    borderRadius: '18px',
                                    border: isActive ? '1px solid rgba(249,115,22,0.4)' : '1px solid transparent',
                                    background: isActive
                                        ? 'linear-gradient(135deg, rgba(255,247,237,0.95), rgba(255,236,211,0.9))'
                                        : 'rgba(255,255,255,0.6)',
                                    boxShadow: isActive ? '0 10px 18px rgba(249,115,22,0.15)' : '0 6px 12px rgba(15,23,42,0.06)',
                                    color: '#334155',
                                    transition: 'transform 160ms ease, box-shadow 160ms ease',
                                }}
                                className="sidebar-item"
                                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0px)')}
                            >
                                <div
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: isActive ? 'linear-gradient(135deg, #f97316, #fbbf24)' : 'rgba(226,232,240,0.7)',
                                        color: isActive ? '#fff' : '#64748b',
                                    }}>
                                    <Icon size={18} />
                                </div>
                                <div
                                    className="sidebar-tooltip"
                                    style={{
                                        position: 'absolute',
                                        right: '100%',
                                        marginRight: '14px',
                                        padding: '10px 12px',
                                        borderRadius: '14px',
                                        background: 'rgba(255,255,255,0.95)',
                                        border: '1px solid rgba(226,232,240,0.8)',
                                        boxShadow: '0 10px 20px rgba(15,23,42,0.12)',
                                        pointerEvents: 'none',
                                        minWidth: '140px',
                                        textAlign: 'left',
                                    }}>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.label}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{item.meta}</div>
                                </div>
                                <div
                                    style={{
                                        position: 'absolute',
                                        right: '-6px',
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '999px',
                                        background: isActive ? '#f97316' : 'transparent',
                                    }}></div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
