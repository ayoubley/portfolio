"use client";

import { useEffect, useRef } from "react";

interface FluidBlob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  opacity: number;
  maxOpacity: number;
  life: number;
  maxLife: number;
  angle: number;
  rotSpeed: number;
  stretch: number;
}

const EDGE_ZONE = 0.25;

export default function SmokeEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<FluidBlob[]>([]);
  const animFrameRef = useRef<number>(0);

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

    const getEdgeStrength = (clientY: number): number => {
      const vh = window.innerHeight;
      const topEdge = vh * EDGE_ZONE;
      const bottomStart = vh * (1 - EDGE_ZONE);

      if (clientY <= topEdge) return 1 - clientY / topEdge;
      if (clientY >= bottomStart)
        return (clientY - bottomStart) / (vh - bottomStart);
      return 0;
    };

    let lastX = -1;
    let lastY = -1;

    const handleMouseMove = (e: MouseEvent) => {
      if (lastX < 0) {
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      lastX = e.clientX;
      lastY = e.clientY;

      const strength = getEdgeStrength(e.clientY);
      if (strength <= 0 || speed < 2) return;

      const moveAngle = Math.atan2(dy, dx);
      const count = Math.min(Math.floor(speed * 0.15 * strength) + 2, 8);

      for (let i = 0; i < count; i++) {
        const spread = 3 + Math.random() * 8;
        const angleOff = (Math.random() - 0.5) * 0.6;
        const spawnAngle = moveAngle + Math.PI + angleOff;

        blobsRef.current.push({
          x: e.clientX + Math.cos(spawnAngle) * spread,
          y: e.clientY + Math.sin(spawnAngle) * spread,
          vx: dx * 0.35 + (Math.random() - 0.5) * 0.8,
          vy: dy * 0.35 + (Math.random() - 0.5) * 0.8,
          radius: 0,
          baseRadius: 18 + Math.random() * 35 + speed * 0.4,
          opacity: 0,
          maxOpacity: (0.7 + Math.random() * 0.25) * strength,
          life: 0,
          maxLife: 35 + Math.random() * 25,
          angle: moveAngle + (Math.random() - 0.5) * 0.3,
          rotSpeed: (Math.random() - 0.5) * 0.04,
          stretch: 1 + speed * 0.018,
        });
      }

      if (blobsRef.current.length > 300) {
        blobsRef.current = blobsRef.current.slice(-300);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    const drawBlob = (p: FluidBlob) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.scale(p.stretch, 1 / Math.sqrt(p.stretch));

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.radius);
      gradient.addColorStop(0, `rgba(255,255,255,${p.opacity})`);
      gradient.addColorStop(0.3, `rgba(255,255,255,${p.opacity * 0.9})`);
      gradient.addColorStop(0.6, `rgba(255,255,255,${p.opacity * 0.5})`);
      gradient.addColorStop(0.8, `rgba(255,255,255,${p.opacity * 0.15})`);
      gradient.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const alive: FluidBlob[] = [];

      for (const p of blobsRef.current) {
        p.life++;
        const t = p.life / p.maxLife;

        if (t < 0.08) {
          p.opacity = (t / 0.08) * p.maxOpacity;
          p.radius = p.baseRadius * (t / 0.08);
        } else if (t < 0.35) {
          p.opacity = p.maxOpacity;
          p.radius = p.baseRadius + (t - 0.08) * 10;
        } else {
          const fadeT = (t - 0.35) / 0.65;
          p.opacity = p.maxOpacity * (1 - fadeT * fadeT);
          p.radius = p.baseRadius + 0.27 * 10 + fadeT * 12;
        }

        p.vx *= 0.96;
        p.vy *= 0.96;
        p.vy -= 0.03;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.rotSpeed;
        p.rotSpeed *= 0.99;
        p.stretch += (1 - p.stretch) * 0.03;

        if (p.life < p.maxLife && p.opacity > 0.01) {
          alive.push(p);
          drawBlob(p);
        }
      }

      blobsRef.current = alive;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[2]"
      style={{ mixBlendMode: "difference" }}
    />
  );
}
