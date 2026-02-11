"use client";

/** LEGACY UI COMPONENT
 * Kept for backward compatibility with pre-refactor page animations.
 * Do not use for new UI work; use restrained tokenized motion patterns.
 */
import { motion } from "framer-motion";

export const FadeIn = ({ children, delay = 0, direction = "up", duration = 0.5, className }: {
    children: React.ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    duration?: number;
    className?: string;
}) => {
    const variants = {
        hidden: {
            opacity: 0,
            y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
            x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
        },
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            transition={{ duration, delay, ease: [0.23, 1, 0.32, 1] }}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const ScaleIn = ({ children, delay = 0, duration = 0.8, className }: {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration, delay, ease: [0.23, 1, 0.32, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
