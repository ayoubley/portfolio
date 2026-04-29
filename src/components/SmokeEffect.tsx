"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  life: number;
  maxLife: number;
  baseY: number;
  baseX: number;
}

interface SmokeEffectProps {
  position: "top" | "bottom";
}

export default function SmokeEffect({ position }: SmokeEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number>(0);

  const createParticle = useCallback(
    (canvasWidth: number, canvasHeight: number): Particle => {
      const x = Math.random() * canvasWidth;
      const baseY =
        position === "top"
          ? Math.random() * canvasHeight * 0.7
          : canvasHeight * 0.3 + Math.random() * canvasHeight * 0.7;

      return {
        x,
        y: baseY,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.15,
        radius: 60 + Math.random() * 120,
        opacity: 0,
        life: 0,
        maxLife: 300 + Math.random() * 400,
        baseY,
        baseX: x,
      };
    },
    [position]
  );

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
      canvas.height = 350;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const particleCount = 40;
    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(canvas.width, canvas.height)
    );

    particlesRef.current.forEach((p, i) => {
      p.life = (i / particleCount) * p.maxLife;
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.life++;

        const lifeRatio = p.life / p.maxLife;
        const maxOpacity = 0.18;
        if (lifeRatio < 0.1) {
          p.opacity = (lifeRatio / 0.1) * maxOpacity;
        } else if (lifeRatio > 0.65) {
          p.opacity = ((1 - lifeRatio) / 0.35) * maxOpacity;
        } else {
          p.opacity = maxOpacity;
        }

        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = 200;

        if (dist < mouseInfluence && dist > 0) {
          const force = ((mouseInfluence - dist) / mouseInfluence) * 1.2;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx *= 0.96;
        p.vy *= 0.96;

        p.vy += (p.baseY - p.y) * 0.002;
        p.vx += (p.baseX - p.x) * 0.0005;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -p.radius) p.x = canvas.width + p.radius;
        if (p.x > canvas.width + p.radius) p.x = -p.radius;

        if (p.life >= p.maxLife) {
          Object.assign(p, createParticle(canvas.width, canvas.height));
        }

        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
        gradient.addColorStop(0.3, `rgba(230, 230, 230, ${p.opacity * 0.7})`);
        gradient.addColorStop(0.6, `rgba(200, 200, 200, ${p.opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(180, 180, 180, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed left-0 w-full pointer-events-none z-[1] ${
        position === "top" ? "top-0" : "bottom-0"
      }`}
      style={{
        height: "350px",
        maskImage:
          position === "top"
            ? "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)"
            : "linear-gradient(to top, black 0%, black 30%, transparent 100%)",
        WebkitMaskImage:
          position === "top"
            ? "linear-gradient(to bottom, black 0%, black 30%, transparent 100%)"
            : "linear-gradient(to top, black 0%, black 30%, transparent 100%)",
      }}
    />
  );
}
