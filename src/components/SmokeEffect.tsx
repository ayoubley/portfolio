"use client";

import { useEffect, useRef, useCallback } from "react";

interface FluidBlob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
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

export default function FluidSmoke({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<FluidBlob[]>([]);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999, prevX: 0, prevY: 0 });
  const isActiveRef = useRef(false);
  const isDarkRef = useRef(true);

  const spawnBlobs = useCallback(
    (mx: number, my: number, dx: number, dy: number, speed: number) => {
      const count = Math.min(Math.floor(speed * 0.15) + 2, 8);
      const moveAngle = Math.atan2(dy, dx);

      for (let i = 0; i < count; i++) {
        const spread = 3 + Math.random() * 8;
        const angleOff = (Math.random() - 0.5) * 0.6;
        const spawnAngle = moveAngle + Math.PI + angleOff;

        blobsRef.current.push({
          x: mx + Math.cos(spawnAngle) * spread,
          y: my + Math.sin(spawnAngle) * spread,
          vx: dx * 0.35 + (Math.random() - 0.5) * 0.8,
          vy: dy * 0.35 + (Math.random() - 0.5) * 0.8,
          targetX: mx + dx * 3,
          targetY: my + dy * 3,
          radius: 0,
          baseRadius: 18 + Math.random() * 35 + speed * 0.4,
          opacity: 0,
          maxOpacity: 0.7 + Math.random() * 0.25,
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
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const syncSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    syncSize();

    const resizeObs = new ResizeObserver(syncSize);
    resizeObs.observe(container);

    const intersectionObs = new IntersectionObserver(
      ([entry]) => {
        isActiveRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObs.observe(container);

    const checkTheme = () => {
      isDarkRef.current = !document.documentElement.classList.contains("light");
    };
    checkTheme();
    const themeObs = new MutationObserver(checkTheme);
    themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    let lastX = -1;
    let lastY = -1;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isActiveRef.current) return;

      const rect = container.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      if (
        localX < 0 ||
        localY < 0 ||
        localX > rect.width ||
        localY > rect.height
      ) {
        lastX = -1;
        lastY = -1;
        return;
      }

      if (lastX < 0) {
        lastX = localX;
        lastY = localY;
        mouseRef.current = {
          x: localX,
          y: localY,
          prevX: localX,
          prevY: localY,
        };
        return;
      }

      const dx = localX - lastX;
      const dy = localY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      lastX = localX;
      lastY = localY;

      mouseRef.current = {
        x: localX,
        y: localY,
        prevX: mouseRef.current.x,
        prevY: mouseRef.current.y,
      };

      if (speed > 2) {
        spawnBlobs(localX, localY, dx, dy, speed);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    const drawBlob = (p: FluidBlob) => {
      const dark = isDarkRef.current;
      const c = dark ? 255 : 0;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.scale(p.stretch, 1 / Math.sqrt(p.stretch));

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.radius);
      gradient.addColorStop(
        0,
        `rgba(${c}, ${c}, ${c}, ${p.opacity})`
      );
      gradient.addColorStop(
        0.3,
        `rgba(${c}, ${c}, ${c}, ${p.opacity * 0.9})`
      );
      gradient.addColorStop(
        0.6,
        `rgba(${c}, ${c}, ${c}, ${p.opacity * 0.5})`
      );
      gradient.addColorStop(
        0.8,
        `rgba(${c}, ${c}, ${c}, ${p.opacity * 0.15})`
      );
      gradient.addColorStop(1, `rgba(${c}, ${c}, ${c}, 0)`);

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

        p.vx += (p.targetX - p.x) * 0.005;
        p.vy += (p.targetY - p.y) * 0.005;

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
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObs.disconnect();
      intersectionObs.disconnect();
      themeObs.disconnect();
    };
  }, [containerRef, spawnBlobs]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
      style={{ mixBlendMode: "difference" }}
    />
  );
}
