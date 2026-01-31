import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, 28);
        return () => clearInterval(interval);
    }, []);

    // Generate particles
    const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
    }));

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 30%, #f97316 60%, #fb923c 100%)',
            }}
        >
            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-20">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                    }}
                />
            </div>

            {/* Scanning Line Animation */}
            <motion.div
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent"
                initial={{ top: '0%' }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{ boxShadow: '0 0 30px 10px rgba(255,255,255,0.4)' }}
            />

            {/* Floating Particles - White */}
            {particles.map(particle => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        width: particle.size,
                        height: particle.size,
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        boxShadow: `0 0 ${particle.size * 2}px rgba(255,255,255,0.5)`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.2, 0.8, 0.2],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: 'easeInOut',
                    }}
                />
            ))}

            {/* Radial Glow Behind Logo - White */}
            <div
                className="absolute w-[600px] h-[600px] rounded-full opacity-30"
                style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
            />

            {/* Main Content Container */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                className="relative z-10 flex flex-col items-center justify-center"
            >
                {/* Logo Container with Glow Ring */}
                <div className="relative mb-12">
                    {/* Outer Rotating Ring */}
                    <motion.div
                        className="absolute -inset-6 rounded-full border-2 border-white/30"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        style={{ borderStyle: 'dashed' }}
                    />

                    {/* Inner Pulsing Ring */}
                    <motion.div
                        className="absolute -inset-3 rounded-full border border-white/50"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Logo Image Container */}
                    <motion.div
                        className="w-40 h-40 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center overflow-hidden"
                        animate={{ boxShadow: ['0 0 30px rgba(255,255,255,0.3)', '0 0 60px rgba(255,255,255,0.6)', '0 0 30px rgba(255,255,255,0.3)'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        {/* White Logo - User will provide the file */}
                        <img
                            src="/mashreq-logo-white.png"
                            alt="Mashreq"
                            className="w-28 h-28 object-contain"
                        />
                    </motion.div>
                </div>


            </motion.div>

            {/* Corner Decorations - White */}
            <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-white/30" />
            <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-white/30" />
            <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-white/30" />
            <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-white/30" />

            {/* Bottom Content - Tagline & Progress */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center w-80">
                {/* Tagline */}
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-white text-xs tracking-[0.5em] uppercase font-light mb-6"
                >
                    Social Signal Intelligence
                </motion.p>

                {/* Progress Bar */}
                <div className="w-full">
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <motion.div
                            className="h-full rounded-full bg-white"
                            style={{
                                width: `${progress}%`,
                                boxShadow: '0 0 20px rgba(255,255,255,0.7)',
                            }}
                        />
                    </div>

                    {/* Progress Text */}
                    <div className="flex justify-between mt-4 text-xs">
                        <motion.span
                            className="text-white/70 uppercase tracking-widest"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            {progress < 100 ? 'Initializing Neural Networks...' : 'System Ready'}
                        </motion.span>
                        <span className="text-white font-mono font-bold">
                            {progress}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Version Text */}
            <div className="absolute bottom-6 text-white/40 text-[10px] tracking-[0.3em] uppercase">
                v2.0 • Enterprise Edition
            </div>
        </motion.div>
    );
};

export default LoadingScreen;
