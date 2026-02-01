import React from "react";

const Settings = () => (
    <div className="h-full flex flex-col pb-10">
        <div className="flex-1 min-h-[5vh]"></div>

        <div className="flex justify-center w-full px-10">
            <div className="w-full max-w-6xl bg-white/50 backdrop-blur-xl rounded-3xl p-8 min-h-[520px] flex flex-col shadow-2xl border border-white/70">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Workspace Settings</h2>
                        <p className="text-sm text-gray-500 mt-2">Configure routing, alert thresholds, and visibility.</p>
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest">Admin</div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/70 border border-white/80 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Alert Routing</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-center justify-between">
                                <span>Critical incidents to Legal</span>
                                <span className="text-mashreq-orange font-semibold">Enabled</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Fraud cases to Security Ops</span>
                                <span className="text-mashreq-orange font-semibold">Enabled</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Brand monitoring notifications</span>
                                <span className="text-gray-400">Paused</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 border border-white/80 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Thresholds</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-center justify-between">
                                <span>Auto-escalate confidence</span>
                                <span className="font-semibold">85%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Critical volume spike</span>
                                <span className="font-semibold">+120%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Response SLA</span>
                                <span className="font-semibold">30 mins</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 border border-white/80 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Data Access</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-center justify-between">
                                <span>PII masking</span>
                                <span className="text-mashreq-orange font-semibold">Active</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Partner feeds</span>
                                <span className="font-semibold">12 sources</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Export permissions</span>
                                <span className="font-semibold">Restricted</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 border border-white/80 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Interface</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-center justify-between">
                                <span>Theme</span>
                                <span className="font-semibold">Warm Light</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Region</span>
                                <span className="font-semibold">GCC</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Default time zone</span>
                                <span className="font-semibold">Asia/Dubai</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex-1"></div>
    </div>
);

export default Settings;
