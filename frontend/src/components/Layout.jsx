import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Reports from './Reports';
import RootCause from './RootCause/RootCause';
import Settings from './Settings';

const Layout = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [nowText, setNowText] = useState('');

    const toOrdinal = (day) => {
        const d = Number(day);
        if (d > 3 && d < 21) return `${d}th`;
        const mod = d % 10;
        if (mod === 1) return `${d}st`;
        if (mod === 2) return `${d}nd`;
        if (mod === 3) return `${d}rd`;
        return `${d}th`;
    };

    const formatAbuDhabi = (date) => {
        const formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Dubai',
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
        const parts = formatter.formatToParts(date).reduce((acc, part) => {
            acc[part.type] = part.value;
            return acc;
        }, {});
        const dayOrdinal = toOrdinal(parts.day);
        return `${parts.weekday}, ${dayOrdinal} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute}:${parts.second}`;
    };

    useEffect(() => {
        setNowText(formatAbuDhabi(new Date()));
        const id = setInterval(() => setNowText(formatAbuDhabi(new Date())), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden text-gray-900 selection:bg-orange-500/30 font-sans bg-[#F9F7F2]">

            {/* Animated Light Gradient Background */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#FFFBF0] via-[#FFF5E1] to-[#FFFBF0] animate-gradient-slow opacity-100">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 brightness-100 mix-blend-multiply"></div>

                {/* Moving Orbs - Adjusted for Light Mode */}
                <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-mashreq-orange/5 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-mashreq-yellow/20 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
            </div>

            {/* Main Content Area - Zoomed Layout */}
            <div className="relative z-10 w-full h-full flex flex-col p-8 pr-40 transition-all duration-500 scale-[0.95] origin-center">

                {/* Header */}
                <header className="flex justify-between items-end mb-6 pl-2">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <img src="/mashreq-logo.png" alt="Mashreq" className="h-10 object-contain drop-shadow-sm" />
                            <div className="h-4 w-[2px] bg-black/10"></div>
                            <span className="text-sm tracking-[1em] text-mashreq-orange uppercase">REVERSE PROMPT INTERFACE</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">

                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <p className="text-xs text-gray-600 font-semibold tracking-wide text-right leading-tight">
                            {nowText}
                        </p>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 overflow-y-auto pr-2 scrollbar-hide pb-10">
                    {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
                    {activeTab === 'reports' && <Reports type={activeTab} />}
                    {activeTab === 'analytics' && <RootCause />}
                    {activeTab === 'settings' && <Settings />}
                </main>

            </div>

            {/* Right Sidebar - Now Floating */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        </div>
    );
};

export default Layout;
