"use client";

import { useEffect, useRef } from "react";

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  maxOpacity: number;
  life: number;
  maxLife: number;
}

const EDGE_ZONE = 0.25;

export default function SmokeEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<TrailParticle[]>([]);
  const animFrameRef = useRef<number>(0);
  const isDarkRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const checkTheme = () => {
      isDarkRef.current = !document.documentElement.classList.contains("light");
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const getEdgeStrength = (clientY: number): number => {
      const vh = window.innerHeight;
      const topEdge = vh * EDGE_ZONE;
      const bottomStart = vh * (1 - EDGE_ZONE);

      if (clientY <= topEdge) {
        return 1 - clientY / topEdge;
      }
      if (clientY >= bottomStart) {
        return (clientY - bottomStart) / (vh - bottomStart);
      }
      return 0;
    };

    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const strength = getEdgeStrength(e.clientY);
      if (strength <= 0) return;

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      lastX = e.clientX;
      lastY = e.clientY;

      const count = Math.min(Math.floor(speed * 0.15 * strength) + 1, 4);

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spread = 8 + Math.random() * 12;
        particlesRef.current.push({
          x: e.clientX + Math.cos(angle) * spread,
          y: e.clientY + Math.sin(angle) * spread,
          vx: (Math.random() - 0.5) * 0.6 + dx * 0.02,
          vy: (Math.random() - 0.5) * 0.6 + dy * 0.02 - 0.3,
          radius: 15 + Math.random() * 30,
          opacity: 0,
          maxOpacity: (0.08 + Math.random() * 0.1) * strength,
          life: 0,
          maxLife: 40 + Math.random() * 50,
        });
      }

      if (particlesRef.current.length > 150) {
        particlesRef.current = particlesRef.current.slice(-150);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const alive: TrailParticle[] = [];

      for (const p of particlesRef.current) {
        p.life++;
        const lifeRatio = p.life / p.maxLife;

        if (lifeRatio < 0.15) {
          p.opacity = (lifeRatio / 0.15) * p.maxOpacity;
        } else {
          p.opacity = p.maxOpacity * (1 - (lifeRatio - 0.15) / 0.85);
        }

        p.radius += 0.4;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.x += p.vx;
        p.y += p.vy;

        if (p.life < p.maxLife && p.opacity > 0.001) {
          alive.push(p);

          const dark = isDarkRef.current;
          const c0 = dark ? 255 : 0;
          const c1 = dark ? 220 : 40;

          const gradient = ctx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, p.radius
          );
          gradient.addColorStop(0, `rgba(${c0}, ${c0}, ${c0}, ${p.opacity})`);
          gradient.addColorStop(0.5, `rgba(${c1}, ${c1}, ${c1}, ${p.opacity * 0.4})`);
          gradient.addColorStop(1, `rgba(${c1}, ${c1}, ${c1}, 0)`);

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      particlesRef.current = alive;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[1]"
    />
  );
}
