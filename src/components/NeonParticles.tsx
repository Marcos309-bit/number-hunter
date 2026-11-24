'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

const COLORS = ['#FF3CAC', '#00E5FF', '#8A2BE2', '#FF8C42', '#FFD700'];

export function NeonParticles({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const spawnBurst = (cx: number, cy: number, count: number) => {
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const speed = 2 + Math.random() * 6.5;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size: 2 + Math.random() * 3.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: 1,
          decay: 0.007 + Math.random() * 0.008,
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);

    spawnBurst(canvas.width * 0.5, canvas.height * 0.42, 75);
    spawnBurst(canvas.width * 0.25, canvas.height * 0.35, 35);
    spawnBurst(canvas.width * 0.75, canvas.height * 0.35, 35);

    const interval = window.setInterval(() => {
      spawnBurst(
        canvas.width * (0.2 + Math.random() * 0.6),
        canvas.height * (0.2 + Math.random() * 0.35),
        28
      );
    }, 1400);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.vx *= 0.99;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 14;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationId = window.requestAnimationFrame(render);
    };

    animationId = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.clearInterval(interval);
      window.cancelAnimationFrame(animationId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40"
    />
  );
}
