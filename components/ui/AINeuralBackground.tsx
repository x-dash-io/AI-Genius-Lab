'use client';

import { useEffect, useRef } from 'react';

// Color themes for nodes and connections (Enterprise AI aesthetic)
const THEMES = {
    light: {
        nodeColors: ['99, 102, 241', '165, 180, 252'], // #6366f1, #a5b4fc
        lineColor: '99, 102, 241',
    },
    dark: {
        nodeColors: ['79, 70, 229', '124, 58, 237'], // #4f46e5, #7c3aed
        lineColor: '124, 58, 237',
    }
};

/**
 * AINeuralBackground
 * A premium, highly-optimized HTML5 Canvas animation class.
 * Simulates a neural network / synapse background.
 */
class AINeuralBackground {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    width: number = 0;
    height: number = 0;
    nodes: Node[] = [];
    mouseX: number = -1000;
    mouseY: number = -1000;
    isMouseIn: boolean = false;
    animationFrameId: number | null = null;
    globalTime: number = 0;
    dpr: number = 1;
    isDark: boolean = true;
    observer: MutationObserver | null = null;

    private resizeListener = this.resize.bind(this);
    private mouseMoveListener = this.onMouseMove.bind(this);
    private mouseLeaveListener = this.onMouseLeave.bind(this);
    private mouseEnterListener = this.onMouseEnter.bind(this);

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get 2D context");
        this.ctx = ctx;

        this.init();
    }

    private init() {
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this.resizeListener);
            window.addEventListener('mousemove', this.mouseMoveListener);
            document.addEventListener('mouseleave', this.mouseLeaveListener);
            document.addEventListener('mouseenter', this.mouseEnterListener);
            this.dpr = window.devicePixelRatio || 1;

            // Initial theme check
            this.checkTheme();

            // Watch for theme changes on <html> to allow instant updates without React re-render
            this.observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        this.checkTheme();
                    }
                });
            });
            this.observer.observe(document.documentElement, { attributes: true });
        }
        this.resize();
        this.animate();
    }

    private checkTheme() {
        if (typeof document !== 'undefined') {
            this.isDark = document.documentElement.classList.contains('dark');
        }
    }

    private resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        this.initNodes();
    }

    private initNodes() {
        this.nodes = [];
        const area = this.width * this.height;
        // Optimize node count based on screen area. Target ~100 nodes on desktop.
        // Spatial logic keeps the visual density consistent and guarantees 60fps.
        const targetNodes = Math.floor(area / 20000);
        const numNodes = Math.min(Math.max(targetNodes, 30), 120);

        for (let i = 0; i < numNodes; i++) {
            this.nodes.push(new Node(this.width, this.height));
        }
    }

    private onMouseMove(e: MouseEvent) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.isMouseIn = true;
    }

    private onMouseLeave() {
        this.isMouseIn = false;
    }

    private onMouseEnter() {
        this.isMouseIn = true;
    }

    private animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.globalTime += 0.01;

        const currentTheme = this.isDark ? THEMES.dark : THEMES.light;

        // Update and draw nodes
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].update(this.width, this.height, this.mouseX, this.mouseY, this.isMouseIn);
            this.nodes[i].draw(this.ctx, currentTheme);
        }

        // Draw connections (elegant connecting lines)
        const maxDist = 140;
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const node1 = this.nodes[i];
                const node2 = this.nodes[j];

                const dx = node1.x - node2.x;
                const dy = node1.y - node2.y;

                // Simple spatial partitioning check to bypass expensive Math.sqrt calculation
                if (Math.abs(dx) > maxDist || Math.abs(dy) > maxDist) continue;

                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    let lineOpacity = (1 - dist / maxDist) * 0.4; // Base elegant opacity

                    // Soft breathing/pulsing effect syncing with the nodes
                    lineOpacity *= 0.7 + Math.sin(this.globalTime + node1.pulsePhase) * 0.3;

                    let lineWidth = 0.6;

                    // Knowledge connecting mouse interaction effect
                    if (this.isMouseIn) {
                        const lineCenterX = (node1.x + node2.x) / 2;
                        const lineCenterY = (node1.y + node2.y) / 2;
                        const mouseDx = this.mouseX - lineCenterX;
                        const mouseDy = this.mouseY - lineCenterY;

                        // Fast bounds check
                        if (Math.abs(mouseDx) < 200 && Math.abs(mouseDy) < 200) {
                            const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

                            if (mouseDist < 180) {
                                const hoverEffect = Math.pow(1 - mouseDist / 180, 2);
                                lineOpacity += hoverEffect * 0.4;
                                lineWidth += hoverEffect * 1.5;
                            }
                        }
                    }

                    if (lineOpacity > 0.01) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(node1.x, node1.y);
                        this.ctx.lineTo(node2.x, node2.y);
                        this.ctx.strokeStyle = `rgba(${currentTheme.lineColor}, ${Math.min(lineOpacity, 1)})`;
                        this.ctx.lineWidth = lineWidth;
                        this.ctx.stroke();
                    }
                }
            }
        }

        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }

    public destroy() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this.resizeListener);
            window.removeEventListener('mousemove', this.mouseMoveListener);
            document.removeEventListener('mouseleave', this.mouseLeaveListener);
            document.removeEventListener('mouseenter', this.mouseEnterListener);
            if (this.observer) {
                this.observer.disconnect();
            }
        }
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}

class Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    colorIndex: number;
    baseAlpha: number;
    pulsePhase: number;
    pulseSpeed: number;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = (Math.random() - 0.5) * 0.15; // Extremely slow, calm organic drift
        this.vy = (Math.random() - 0.5) * 0.15;
        this.radius = Math.random() * 1.8 + 0.8; // Varied node sizes
        this.colorIndex = Math.random() > 0.5 ? 1 : 0;
        this.baseAlpha = Math.random() * 0.5 + 0.3; // Noticeable but subtle
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.005 + Math.random() * 0.015;
    }

    update(canvasWidth: number, canvasHeight: number, mouseX: number, mouseY: number, isMouseIn: boolean) {
        this.x += this.vx;
        this.y += this.vy;

        // Gentle floating bounding box constraints
        if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
        if (this.y < 0 || this.y > canvasHeight) this.vy *= -1;

        // Subtle mouse attraction (knowledge connecting)
        if (isMouseIn) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            // Immediate rectangular cull
            if (Math.abs(dx) < 250 && Math.abs(dy) < 250) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 250) {
                    const force = (250 - dist) / 250;
                    this.x += (dx / dist) * force * 0.4;
                    this.y += (dy / dist) * force * 0.4;
                }
            }
        }

        this.pulsePhase += this.pulseSpeed;
    }

    draw(ctx: CanvasRenderingContext2D, theme: { nodeColors: string[]; lineColor: string }) {
        const alpha = this.baseAlpha + Math.sin(this.pulsePhase) * 0.3;
        const color = theme.nodeColors[this.colorIndex];

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${Math.max(0, alpha)})`;
        ctx.shadowBlur = 12; // Glowing nodes
        ctx.shadowColor = `rgba(${color}, 0.8)`;
        ctx.fill();
        // Reset shadow for rendering lines (performance)
        ctx.shadowBlur = 0;
    }
}

export default function AINeuralBackgroundComponent() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const animationInstance = new AINeuralBackground(canvasRef.current);

        return () => {
            animationInstance.destroy();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1, // Ensure it is behind everything
                pointerEvents: 'none', // Allow clicks to pass through
                background: 'transparent', // Let globals body bg show
            }}
            aria-hidden="true"
        />
    );
}
