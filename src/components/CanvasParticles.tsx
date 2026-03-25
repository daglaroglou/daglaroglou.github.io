import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const RIBBONS = 7;
const STEP = 5;

type CanvasParticlesProps = {
  className?: string;
};

/**
 * Canvas 2D — scrolling sine-wave ribbons (no dot field, no physics).
 * Monochrome: white on dark, black on light.
 */
const CanvasParticles = ({ className }: CanvasParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { resolvedTheme } = useTheme();
  const darkRef = useRef(resolvedTheme === "dark");
  darkRef.current = resolvedTheme === "dark";

  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let w = 0;
    let h = 0;
    let dpr = 1;

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      if (w < 1 || h < 1) return;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(layout);
    ro.observe(parent);
    layout();

    let raf = 0;

    const tick = (now: number) => {
      const dark = darkRef.current;
      const t = now * 0.001;
      const chroma = dark ? "255, 255, 255" : "0, 0, 0";

      if (w < 1 || h < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      const scroll = t * (dark ? 42 : 38);

      for (let r = 0; r < RIBBONS; r++) {
        const n = r / (RIBBONS - 1 || 1);
        const baseY = h * (0.12 + n * 0.76);
        const freq = 0.0065 + n * 0.004;
        const amp = Math.max(14, h * (0.028 + n * 0.04));
        const phase = t * (0.55 + n * 0.22) + r * 2.1;
        const wobble = Math.sin(t * 0.31 + r) * (dark ? 6 : 5);

        ctx.beginPath();
        for (let x = 0; x <= w + STEP; x += STEP) {
          const y =
            baseY +
            wobble +
            Math.sin((x + scroll) * freq + phase) * amp +
            Math.sin((x - scroll * 0.6) * freq * 1.7 + phase * 0.5) * (amp * 0.22);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const alpha = dark ? 0.045 + n * 0.038 : 0.035 + n * 0.032;
        ctx.strokeStyle = `rgba(${chroma}, ${alpha})`;
        ctx.lineWidth = dark ? 0.9 : 0.85;
        ctx.stroke();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return <canvas ref={canvasRef} className={className} aria-hidden />;
};

export default CanvasParticles;
