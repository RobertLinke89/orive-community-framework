"use client";

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Particle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speedX: number;
  speedY: number;
  maxAlpha: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export function ZenBackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    window.addEventListener('resize', handleResize);

    const isDark = resolvedTheme === 'dark';

    // Zen Color Palette
    const rippleColor = isDark ? '0, 205, 172' : '0, 168, 142';
    const accentColor = isDark ? '2, 170, 176' : '15, 23, 42';

    // Floating subtle Zen motes (like tea steam or dust in a quiet temple)
    const particleCount = 28;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.4 + 0.1,
        maxAlpha: Math.random() * 0.35 + 0.15,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: -(Math.random() * 0.3 + 0.15), // gently float upward
      });
    }

    // Concentric Zen ripples — prefer the search input as origin when present
    const ripples: Ripple[] = [];
    const maxRipples = 4;
    let lastRippleTime = 0;

    const originPoint = () => {
      const parent = canvas.parentElement;
      if (!parent) return { x: width / 2, y: height / 2 };
      const origin = parent.querySelector("[data-zen-origin]") as HTMLElement | null;
      if (!origin) return { x: width / 2, y: height / 2 };
      const parentRect = parent.getBoundingClientRect();
      const originRect = origin.getBoundingClientRect();
      return {
        x: originRect.left - parentRect.left + originRect.width / 2,
        y: originRect.top - parentRect.top + originRect.height / 2,
      };
    };

    const centerX = () => originPoint().x;
    const centerY = () => originPoint().y;

    // Initialize initial staggered ripples
    for (let i = 0; i < maxRipples; i++) {
      ripples.push({
        x: centerX(),
        y: centerY(),
        radius: i * 75,
        maxRadius: Math.min(width, 700) * 0.55,
        alpha: (1 - (i * 75) / 380) * 0.22,
        speed: 0.45,
      });
    }

    let breathTimer = 0;

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      breathTimer += 0.012;
      const breathPhase = (Math.sin(breathTimer) + 1) / 2; // 0 to 1 breathing rhythm

      // 1. Draw Slow Breathing Harmonic Center Aura (Meditation Glow)
      const cx = centerX();
      const cy = centerY();
      const auraRadius = 140 + breathPhase * 35;

      const auraGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, auraRadius);
      auraGradient.addColorStop(
        0,
        isDark
          ? `rgba(${rippleColor}, ${0.08 + breathPhase * 0.04})`
          : `rgba(${rippleColor}, ${0.045 + breathPhase * 0.025})`
      );
      auraGradient.addColorStop(
        0.5,
        isDark
          ? `rgba(${accentColor}, ${0.03 + breathPhase * 0.02})`
          : `rgba(2, 170, 176, ${0.02 + breathPhase * 0.015})`
      );
      auraGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Gentle Concentric Zen Water Rings (Harmonic Resonances)
      const now = Date.now();
      if (now - lastRippleTime > 3200 && ripples.length < maxRipples + 2) {
        lastRippleTime = now;
        ripples.push({
          x: cx,
          y: cy,
          radius: 10,
          maxRadius: Math.min(width, 720) * 0.58,
          alpha: isDark ? 0.25 : 0.18,
          speed: 0.42,
        });
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.x = cx;
        r.y = cy;

        // Fade out as it expands outward
        const progress = r.radius / r.maxRadius;
        const currentAlpha = Math.max(0, (1 - progress) * (isDark ? 0.22 : 0.16));

        if (progress >= 1 || currentAlpha <= 0.005) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        // Delicate oval shape to match wide screen perspective
        ctx.ellipse(r.x, r.y, r.radius * 1.35, r.radius * 0.75, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rippleColor}, ${currentAlpha})`;
        ctx.lineWidth = 1.25;
        ctx.stroke();

        // Subtle secondary inner echo line
        if (r.radius > 50) {
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, (r.radius - 12) * 1.35, (r.radius - 12) * 0.75, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${accentColor}, ${currentAlpha * 0.4})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }

        ctx.restore();
      }

      // 3. Draw Floating Zen Motes
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        // Reset if moved outside screen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(${rippleColor}, ${p.alpha * 0.7})`
          : `rgba(${rippleColor}, ${p.alpha * 0.45})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full z-0 opacity-55 dark:opacity-90 transition-opacity duration-1000"
    />
  );
}
