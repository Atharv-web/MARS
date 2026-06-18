"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  Paperclip,
  Telescope,
  Boxes,
  FileText,
  Github,
  MessageSquareText,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

/* ─── tiny animation helpers ─────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

/* ─── orbit canvas ────────────────────────────────────────────── */
/**
 * "Parallel convergence": four intelligence sources sit on a slowly rotating
 * ring and fire synchronised volleys of data packets inward. When a volley
 * lands, the central synthesis core flares and emits a clean pulse ring — the
 * report. The whole thing re-themes (re-runs the effect) when `theme` flips.
 */
function OrbitCanvas({ theme }: { theme: "dark" | "light" }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    // Drawing happens in a fixed coordinate space rendered at 2x so the scene
    // stays crisp on retina displays; CSS scales the element responsively.
    const W = 620;
    const H = 440;
    const scale = 2;
    canvas.width = W * scale;
    canvas.height = H * scale;
    ctx.scale(scale, scale);

    const cx = W / 2;
    const cy = H / 2;
    const rx = 250; // ring radii (elliptical for a subtle perspective tilt)
    const ry = 132;

    const light = theme === "light";
    const pal = {
      ring: light ? "rgba(22,30,48,0.10)" : "rgba(255,255,255,0.07)",
      ringFaint: light ? "rgba(22,30,48,0.05)" : "rgba(255,255,255,0.035)",
      line: light ? "rgba(22,30,48,0.10)" : "rgba(255,255,255,0.06)",
      coreFill: light ? "rgba(255,255,255,0.94)" : "rgba(12,14,20,0.96)",
      coreEdge: light ? "rgba(108,126,255,0.55)" : "rgba(108,126,255,0.45)",
      glyphStrong: light ? "rgba(108,126,255,0.7)" : "rgba(140,154,255,0.7)",
      glyphSoft: light ? "rgba(108,126,255,0.3)" : "rgba(140,154,255,0.3)",
      labelText: light ? "rgba(22,30,48,0.78)" : "rgba(228,232,245,0.85)",
      labelBg: light ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.05)",
      labelBorder: light ? "rgba(22,30,48,0.10)" : "rgba(255,255,255,0.10)",
    };

    const INDIGO = "#6c7eff";
    const TEAL = "#4dd9ac";
    const AMBER = "#e8a24a";
    const PINK = "#e06cff";

    // Evenly spaced on the ring (diagonals keep labels from colliding).
    const sources = [
      { name: "Perplexity", color: INDIGO, base: Math.PI * 1.25 },
      { name: "Parallel",   color: PINK,   base: Math.PI * 1.75 },
      { name: "Serper",     color: AMBER,  base: Math.PI * 0.25 },
      { name: "Tavily",     color: TEAL,   base: Math.PI * 0.75 },
    ];

    type Packet = { si: number; t: number; speed: number };
    type Pulse = { r: number; life: number; color: string };
    const packets: Packet[] = [];
    const pulses: Pulse[] = [];

    let rot = 0;
    let frame = 0;
    let coreFlash = 0; // 0..1 decaying brightness when a volley lands
    let arrived = 0; // packets landed in the current volley
    let raf = 0;

    const VOLLEY = 132; // frames between synchronised volleys

    function hexAlpha(hex: string, a: number) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${a})`;
    }
    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    function nodePos(si: number) {
      const a = sources[si].base + rot;
      return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry };
    }

    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function drawCore(pulse: number) {
      // outer breathing halo
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 64 + pulse * 18);
      halo.addColorStop(0, hexAlpha(INDIGO, 0.22 + coreFlash * 0.28));
      halo.addColorStop(1, hexAlpha(INDIGO, 0));
      ctx.beginPath();
      ctx.arc(cx, cy, 64 + pulse * 18, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      // slowly counter-rotating dashed ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-rot * 2.4);
      ctx.beginPath();
      ctx.setLineDash([3, 7]);
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.strokeStyle = hexAlpha(INDIGO, light ? 0.35 : 0.3);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // disc
      ctx.beginPath();
      ctx.arc(cx, cy, 31, 0, Math.PI * 2);
      ctx.fillStyle = pal.coreFill;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = pal.coreEdge;
      ctx.stroke();

      // document glyph inside the disc
      const dw = 22, dh = 28, dx = cx - dw / 2, dy = cy - dh / 2;
      roundRect(dx, dy, dw, dh, 4);
      ctx.strokeStyle = pal.glyphStrong;
      ctx.lineWidth = 1.1;
      ctx.stroke();
      [7, 12, 17, 22].forEach((yOff, i) => {
        ctx.strokeStyle = i < 1 ? pal.glyphStrong : pal.glyphSoft;
        ctx.beginPath();
        ctx.moveTo(dx + 4, dy + yOff);
        ctx.lineTo(dx + dw - (i % 2 ? 8 : 4), dy + yOff);
        ctx.stroke();
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      rot += 0.0011;

      // guide rings (the orbit + a faint inner ring)
      [1, 0.62].forEach((s, i) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx * s, ry * s, 0, 0, Math.PI * 2);
        ctx.strokeStyle = i === 0 ? pal.ring : pal.ringFaint;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });

      // connection lines (fade toward the source colour near the node)
      sources.forEach((src, si) => {
        const p = nodePos(si);
        const grad = ctx.createLinearGradient(cx, cy, p.x, p.y);
        grad.addColorStop(0, pal.line);
        grad.addColorStop(1, hexAlpha(src.color, light ? 0.28 : 0.22));
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // expanding report pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pl = pulses[i];
        pl.r += 1.6;
        pl.life -= 0.014;
        if (pl.life <= 0) { pulses.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.ellipse(cx, cy, pl.r, pl.r * (ry / rx), 0, 0, Math.PI * 2);
        ctx.strokeStyle = hexAlpha(pl.color, pl.life * 0.5);
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // fire a synchronised volley
      if (frame % VOLLEY === 0) {
        arrived = 0;
        sources.forEach((_, si) =>
          packets.push({ si, t: 0, speed: 0.013 + Math.random() * 0.003 }),
        );
      }

      // core (drawn before packets so packets land "on top")
      const breathe = 0.5 + 0.5 * Math.sin(frame * 0.04);
      coreFlash *= 0.92;
      drawCore(breathe);

      // packets travelling source -> core
      for (let i = packets.length - 1; i >= 0; i--) {
        const pk = packets[i];
        pk.t += pk.speed;
        const src = sources[pk.si];
        const p = nodePos(pk.si);
        const e = easeInOut(Math.min(pk.t, 1));
        const x = p.x + (cx - p.x) * e;
        const y = p.y + (cy - p.y) * e;

        // comet trail
        const te = easeInOut(Math.max(pk.t - 0.08, 0));
        const txx = p.x + (cx - p.x) * te;
        const tyy = p.y + (cy - p.y) * te;
        const tg = ctx.createLinearGradient(txx, tyy, x, y);
        tg.addColorStop(0, hexAlpha(src.color, 0));
        tg.addColorStop(1, hexAlpha(src.color, 0.9));
        ctx.beginPath();
        ctx.moveTo(txx, tyy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = tg;
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.stroke();

        // head
        ctx.beginPath();
        ctx.arc(x, y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = src.color;
        ctx.fill();

        if (pk.t >= 1) {
          packets.splice(i, 1);
          arrived++;
          coreFlash = Math.min(coreFlash + 0.35, 1);
          // when the whole volley has converged, synthesise -> emit a pulse
          if (arrived >= sources.length) {
            pulses.push({ r: 30, life: 1, color: INDIGO });
          }
        }
      }

      // source nodes + labels
      sources.forEach((src, si) => {
        const p = nodePos(si);
        const pop = packets.some((pk) => pk.si === si && pk.t < 0.12) ? 1 : 0;

        // glow
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 22 + pop * 8);
        g.addColorStop(0, hexAlpha(src.color, 0.45));
        g.addColorStop(1, hexAlpha(src.color, 0));
        ctx.beginPath();
        ctx.arc(p.x, p.y, 22 + pop * 8, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5 + pop * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = src.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5 + pop * 1.4, 0, Math.PI * 2);
        ctx.strokeStyle = light ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.25)";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // label pill, placed on the outer side of the node
        ctx.font =
          "600 11.5px var(--font-manrope), system-ui, sans-serif";
        const tw = ctx.measureText(src.name).width;
        const onRight = p.x >= cx;
        const padX = 8, ph = 21;
        const lx = onRight ? p.x + 12 : p.x - 12 - (tw + padX * 2);
        const ly = p.y - ph / 2;
        roundRect(lx, ly, tw + padX * 2, ph, ph / 2);
        ctx.fillStyle = pal.labelBg;
        ctx.fill();
        ctx.strokeStyle = pal.labelBorder;
        ctx.lineWidth = 1;
        ctx.stroke();
        // colour key dot
        ctx.beginPath();
        ctx.arc(lx + padX, p.y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = src.color;
        ctx.fill();
        ctx.fillStyle = pal.labelText;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillText(src.name, lx + padX + 7, p.y + 0.5);
      });

      frame++;
    }

    function loop() {
      draw();
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (raf || document.hidden) return;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }
    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    // Respect reduced-motion (render one representative static frame) and stop
    // burning CPU/battery while the tab is hidden.
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      packets.push(...sources.map((_, si) => ({ si, t: 0.5, speed: 0 })));
      draw();
    } else {
      start();
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [theme]);

  return (
    <canvas
      ref={ref}
      width={620}
      height={440}
      className="w-full max-w-[620px]"
      aria-hidden="true"
    />
  );
}

/* ─── nav ─────────────────────────────────────────────────────── */
function Nav() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[var(--surface-border)] bg-[var(--nav-bg)] px-6 py-4 backdrop-blur-xl sm:px-10">
      <Wordmark className="text-xl" />
      <div className="flex items-center gap-6">
        <a href="#how" className="hidden text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:block">
          How it works
        </a>
        <a href="#sources" className="hidden text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:block">
          Sources
        </a>
        <a
          href="https://github.com/Atharv-web/MARS"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:flex"
        >
          <GithubIcon />
          GitHub
        </a>
        <Link
          href="/app"
          className="rounded-[8px] bg-[#6c7eff] px-4 py-2 text-[13px] font-semibold tracking-[0.03em] text-white transition-opacity hover:opacity-85"
        >
          Start Researching
        </Link>
      </div>
    </nav>
  );
}

/* ─── how-it-works cells ──────────────────────────────────────── */
const HOW_STEPS: { n: string; icon: LucideIcon; title: string; body: string }[] = [
  {
    n: "01",
    icon: MessageSquareText,
    title: "You ask a question",
    body: "Type anything — a topic, a thesis, a question you keep circling. MARS turns plain language into a research brief.",
  },
  {
    n: "02",
    icon: Zap,
    title: "Parallel search fires",
    body: "Perplexity, Tavily, Serper Dev, and Parallel AI are queried simultaneously. Not one after another — all at once.",
  },
  {
    n: "03",
    icon: Scale,
    title: "Sources are weighed",
    body: "Results are cross-checked for consistency, recency, and factual grounding. Noise drops out. Signal rises.",
  },
  {
    n: "04",
    icon: FileText,
    title: "A report emerges",
    body: "A clean, structured document with cited sources — direct, readable, ready to use. Not raw data. Not a chatbot reply.",
  },
];

/* ─── feature cards ───────────────────────────────────────────── */
const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Zap, title: "Parallel by default", body: "Every query hits multiple search systems at the same time. Speed isn't a feature — it's the architecture." },
  { icon: Paperclip, title: "Fully cited", body: "Every claim in your report traces back to a real source. You always know where the information came from." },
  { icon: Telescope, title: "Wide and deep", body: "Broad coverage across sources, then deep synthesis into one coherent document — not a list of links." },
  { icon: Boxes, title: "Model agnostic", body: "MARS doesn't depend on any single AI model or search provider. Swap and extend as new tools emerge." },
  { icon: FileText, title: "Report, not chat", body: "The output is a structured document with headings, sections, and citations. Built to be read, saved, and shared." },
  { icon: Github, title: "Open source", body: "Built in public, deployed on Vercel. Fork it, extend it, run it yourself. The research stack is yours." },
];

/* ─── source chips ────────────────────────────────────────────── */
const SOURCES = [
  { name: "Perplexity AI", color: "#6c7eff" },
  { name: "Tavily",        color: "#4dd9ac" },
  { name: "Serper Dev",    color: "#e8a24a" },
  { name: "Parallel AI",   color: "#e06cff" },
  { name: "More sources",  color: "#ff6c8a" },
];

/* ─── page ────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { theme } = useTheme();
  return (
    <>
      <Nav />

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-32 text-center">
        {/* glows */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(108,126,255,0.16)_0%,transparent_65%)]" />
        <div className="pointer-events-none absolute bottom-0 right-[8%] h-80 w-80 rounded-full bg-[radial-gradient(ellipse,rgba(77,217,172,0.07)_0%,transparent_70%)]" />

        <motion.div {...fadeUp(0)} className="mb-9 flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface-panel)] px-4 py-[6px]">
          <span className="h-[5px] w-[5px] rounded-full bg-[#6c7eff]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Model Agnostic Research System
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.08)}
          className="max-w-[820px] text-balance font-[family:var(--font-cormorant)] text-[3.4rem] font-semibold leading-[0.95] tracking-[-0.035em] text-[var(--text-primary)] sm:text-[4.6rem] lg:text-[5.8rem]"
        >
          Research that thinks{" "}
          <em className="italic text-[#6c7eff]">in parallel</em>
        </motion.h1>

        <motion.p
          {...fadeUp(0.16)}
          className="mt-7 max-w-[520px] text-pretty text-[17px] leading-[1.78] text-[var(--text-secondary)]"
        >
        Ask anything you&apos;ve been meaning to research.
        MARS hits every major search intelligence system at once, 
        cross-references what it finds, and hands you a clean, cited report you can actually use.
        </motion.p>

        <motion.div {...fadeUp(0.24)} className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/app"
            className="rounded-[10px] bg-[#6c7eff] px-7 py-[14px] text-[14px] font-semibold tracking-[0.03em] text-white transition-all hover:-translate-y-px hover:opacity-88"
          >
            Start Researching
          </Link>
          <a
            href="https://github.com/Atharv-web/MARS"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-[10px] border border-[var(--surface-border)] px-6 py-[14px] text-[14px] font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--surface-panel-strong)] hover:bg-[var(--surface-panel)] hover:text-[var(--text-primary)]"
          >
            <GithubIcon />
            View on GitHub
          </a>
        </motion.div>
      </section>

      {/* ── ORBIT VIZ ── */}
      <div className="flex justify-center px-6 py-4 pb-16">
        <OrbitCanvas theme={theme} />
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="mx-auto max-w-5xl px-6 py-24">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6c7eff]">
          How it works
        </p>
        <h2 className="font-[family:var(--font-cormorant)] text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.025em] text-[var(--text-primary)] sm:whitespace-nowrap sm:text-[3.2rem]">
          From question to cited report, fast.
        </h2>

        {/* stepped cards — a readable left-to-right sequence */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_STEPS.map((s) => (
            <motion.div
              key={s.n}
              {...fadeUp(0)}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-solid)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(108,126,255,0.45)] hover:shadow-[0_18px_50px_rgba(20,24,48,0.16)]"
            >
              {/* accent line that wipes in on hover */}
              <span className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#6c7eff] to-[#e06cff] transition-transform duration-300 group-hover:scale-x-100" />

              <div className="mb-7 flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(108,126,255,0.3)] bg-[rgba(108,126,255,0.1)] text-[13px] font-semibold text-[var(--accent-indigo)]">
                  {s.n.replace(/^0/, "")}
                </span>
                <s.icon
                  className="size-[18px] text-[var(--text-muted)] transition-colors group-hover:text-[var(--accent-indigo)]"
                  strokeWidth={1.6}
                />
              </div>

              <h3 className="mb-2 text-[16px] font-semibold text-[var(--text-primary)]">
                {s.title}
              </h3>
              <p className="text-[13.5px] leading-[1.7] text-[var(--text-secondary)]">
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── QUOTE BAND ── */}
      <div className="border-y border-[var(--surface-border)] bg-[var(--quote-bg)] px-6 py-20 text-center">
        <blockquote className="mx-auto max-w-[700px] font-[family:var(--font-cormorant)] text-[1.7rem] font-medium leading-[1.25] tracking-[-0.02em] text-[var(--text-primary)] sm:text-[2.4rem]">
          &ldquo;The problem with research isn&apos;t finding information.{" "}
          <br className="hidden sm:block" />
          It&apos;s finding{" "}
          <em className="italic text-[#e8a24a]">the right information</em> and knowing you can trust it.&rdquo;
        </blockquote>
      </div>

      {/* ── SOURCES ── */}
      <section id="sources" className="mx-auto max-w-5xl px-6 py-24">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6c7eff]">
          Intelligence sources
        </p>
        <h2 className="max-w-lg font-[family:var(--font-cormorant)] text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.025em] text-[var(--text-primary)] sm:text-[3.2rem]">
          Every search engine.{" "}
          <br />
          One output.
        </h2>
        <p className="mt-5 max-w-[480px] text-[16px] leading-[1.8] text-[var(--text-secondary)]">
          MARS is model-agnostic by design. It&apos;s not married to one search
          provider, it uses all of them, so you get coverage no single source
          could give you.
        </p>

        <div className="mt-14 flex flex-wrap gap-3">
          {SOURCES.map((src) => (
            <div
              key={src.name}
              className="glass-card flex items-center gap-[10px] rounded-[12px] px-5 py-[13px] text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <span
                className="h-[7px] w-[7px] flex-shrink-0 rounded-full"
                style={{ background: src.color, boxShadow: `0 0 10px ${src.color}` }}
              />
              {src.name}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6c7eff]">
          What makes it different
        </p>
        <h2 className="max-w-lg font-[family:var(--font-cormorant)] text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.025em] text-[var(--text-primary)] sm:text-[3.2rem]">
          Built for people who actually need answers.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card rounded-[16px] p-7">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-[10px] border border-[rgba(108,126,255,0.25)] bg-[rgba(108,126,255,0.1)] text-[var(--accent-indigo)]">
                <f.icon className="size-[18px]" strokeWidth={1.75} />
              </div>
              <h3 className="mb-2 text-[15px] font-semibold text-[var(--text-primary)]">{f.title}</h3>
              <p className="text-[13px] leading-[1.72] text-[var(--text-secondary)]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <div className="relative overflow-hidden px-6 py-32 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(108,126,255,0.13)_0%,transparent_65%)]" />
        <h2 className="relative font-[family:var(--font-cormorant)] text-[2.8rem] font-semibold leading-[1.0] tracking-[-0.03em] text-[var(--text-primary)] sm:text-[4rem]">
          Your question is
          <br />
          already waiting.
        </h2>
        <p className="relative mt-5 text-[16px] text-[var(--text-secondary)]">
          Start a research session. Get a report. It takes seconds.
        </p>
        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/app"
            className="rounded-[10px] bg-[#6c7eff] px-8 py-[14px] text-[14px] font-semibold tracking-[0.03em] text-white transition-all hover:-translate-y-px hover:opacity-88"
          >
            Start Researching →
          </Link>
          <a
            href="https://github.com/Atharv-web/MARS"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-[10px] border border-[var(--surface-border)] px-6 py-[14px] text-[14px] font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-panel)] hover:text-[var(--text-primary)]"
          >
            <GithubIcon />
            Star on GitHub
          </a>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="flex flex-col items-center justify-between gap-4 border-t border-[var(--surface-border)] px-10 py-8 sm:flex-row">
        <Wordmark className="text-[18px]" />
        <span className="text-[13px] text-[var(--text-muted)]">
          Open Source
        </span>
        <div className="flex items-center gap-4 text-[13px] text-[var(--text-muted)]">
          <a
            href="https://github.com/Atharv-web/MARS"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-[var(--text-secondary)]"
          >
            <GithubIcon />
            GitHub
          </a>
          <span>·</span>
          <Link href="/app" className="transition-colors hover:text-[var(--text-secondary)]">App</Link>
        </div>
      </footer>
    </>
  );
}

/* ─── wordmark (shared by nav + footer) ───────────────────────── */
function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-[family:var(--font-cormorant)] font-semibold tracking-[0.07em] text-[var(--text-primary)] ${className}`}
    >
      M<span className="text-[#6c7eff]">A</span>RS
    </span>
  );
}

/* ─── github icon ─────────────────────────────────────────────── */
function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}