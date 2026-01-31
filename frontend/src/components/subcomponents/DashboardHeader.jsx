import React from "react";

const DashboardHeader = () => {
    return (
        <div className="flex justify-between items-start mb-6 z-10 pt-2 px-2" style={{ marginLeft: "15px", marginRight: "15px" }}>
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight" style={{ marginLeft: "15px", marginTop: "10px" }}>
                    Social Signal Intelligence
                </h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-mashreq-orange rounded-full animate-pulse" style={{ marginLeft: "15px" }}></span>
                    <span className="text-xs text-gray-500 uppercase tracking-widest">Live Monitoring Active</span>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
