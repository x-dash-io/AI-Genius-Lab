
"use client";

import { cn } from "@/lib/utils";

interface HeroPatternProps {
    className?: string;
}

export function HeroPattern({ className }: HeroPatternProps) {
    return (
        <div className={cn("relative w-full h-full overflow-hidden bg-zinc-950", className)}>
            {/* Grid Pattern */}
            <div
                className="absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px),
                            linear-gradient(to bottom, #333 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Radial Gradient Glow */}
            <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)]" />

            {/* Floating Orbs (Abstract Nodes) */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />

            {/* Tech Overlay Lines */}
            <svg className="absolute inset-0 w-full h-full z-20 opacity-30 pointer-events-none">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>
                <path d="M0,100 Q150,50 300,100 T600,100" fill="none" stroke="url(#grad1)" strokeWidth="2" />
                <path d="M0,300 Q400,200 800,300 T1600,300" fill="none" stroke="url(#grad1)" strokeWidth="1" strokeDasharray="5,5" />
            </svg>
        </div>
    );
}
