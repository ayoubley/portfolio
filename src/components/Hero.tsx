"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import FluidSmoke from "./SmokeEffect";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      <FluidSmoke containerRef={sectionRef} />
      <div className="gradient-blur bg-foreground/10 -top-20 -left-20 animate-pulse-glow" />
      <div className="gradient-blur bg-foreground/5 top-1/3 right-0 animate-pulse-glow" style={{ animationDelay: "2s" }} />
      <div className="gradient-blur bg-foreground/5 bottom-0 left-1/3 animate-pulse-glow" style={{ animationDelay: "4s" }} />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-foreground/60 animate-pulse" />
          <span className="text-sm text-muted">
            Designer & Digital Strategist
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
        >
          Ayoub{" "}
          <span className="text-gradient">Bensadek</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Professional designer with 7+ years of experience crafting premium
          digital experiences, building visual identities, and driving growth
          through design, marketing, and digital strategy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#projects"
            className="px-8 py-3.5 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-80 transition-all duration-300"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="px-8 py-3.5 glass-card rounded-full text-sm font-medium hover:bg-foreground/10 transition-all duration-300"
          >
            Contact Me
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-20 flex items-center justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-muted/30 flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 rounded-full bg-muted/50" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
