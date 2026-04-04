"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

type ParticleInstance = {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  size: number;
  color: string;
  draw: () => void;
  update: () => void;
};

type MouseState = {
  x: number | null;
  y: number | null;
  radius: number;
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12 + 0.25,
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

export default function AetherFlowHero() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasEl = canvas;
    const context = ctx;
    let animationFrameId = 0;
    let particles: ParticleInstance[] = [];
    const mouse: MouseState = { x: null, y: null, radius: 180 };

    class Particle implements ParticleInstance {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;

      constructor(
        x: number,
        y: number,
        directionX: number,
        directionY: number,
        size: number,
        color: string
      ) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }

      draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
      }

      update() {
        if (this.x > canvasEl.width || this.x < 0) {
          this.directionX = -this.directionX;
        }

        if (this.y > canvasEl.height || this.y < 0) {
          this.directionY = -this.directionY;
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          if (distance < mouse.radius + this.size) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= forceDirectionX * force * 4;
            this.y -= forceDirectionY * force * 4;
          }
        }

        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    const init = () => {
      particles = [];
      const numberOfParticles = (canvasEl.height * canvasEl.width) / 11000;

      for (let i = 0; i < numberOfParticles; i += 1) {
        const size = Math.random() * 1.8 + 0.8;
        const x = Math.random() * (canvasEl.width - size * 4) + size * 2;
        const y = Math.random() * (canvasEl.height - size * 4) + size * 2;
        const directionX = Math.random() * 0.28 - 0.14;
        const directionY = Math.random() * 0.28 - 0.14;
        const color = "rgba(133, 167, 176, 0.72)";
        particles.push(new Particle(x, y, directionX, directionY, size, color));
      }
    };

    const resizeCanvas = () => {
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
      init();
    };

    const connect = () => {
      for (let a = 0; a < particles.length; a += 1) {
        for (let b = a; b < particles.length; b += 1) {
          const distance =
            (particles[a].x - particles[b].x) * (particles[a].x - particles[b].x) +
            (particles[a].y - particles[b].y) * (particles[a].y - particles[b].y);

          if (distance < (canvasEl.width / 7.5) * (canvasEl.height / 7.5)) {
            const opacityValue = 1 - distance / 26000;
            let strokeColor = `rgba(115, 152, 163, ${opacityValue})`;

            if (mouse.x !== null && mouse.y !== null) {
              const dxMouse = particles[a].x - mouse.x;
              const dyMouse = particles[a].y - mouse.y;
              const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

              if (distanceMouse < mouse.radius) {
                strokeColor = `rgba(223, 196, 151, ${opacityValue})`;
              }
            }

            context.strokeStyle = strokeColor;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(particles[a].x, particles[a].y);
            context.lineTo(particles[b].x, particles[b].y);
            context.stroke();
          }
        }
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      context.fillStyle = "#07090c";
      context.fillRect(0, 0, canvasEl.width, canvasEl.height);

      for (let i = 0; i < particles.length; i += 1) {
        particles[i].update();
      }

      connect();
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative min-h-[92vh] overflow-hidden border-b border-white/8 bg-[#07090c] text-white">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(215,179,125,0.12),transparent_20%),radial-gradient(circle_at_72%_18%,rgba(127,169,179,0.1),transparent_18%),linear-gradient(180deg,rgba(7,9,12,0.2),rgba(7,9,12,0.58)_54%,rgba(7,9,12,0.92)_100%)]" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-center px-6 py-24 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-4xl">
            <motion.div
              custom={0}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-4 py-2 text-sm text-[#e6e0d4] backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 text-[#dfc497]" />
              CVOS | Resume Operating System
            </motion.div>

            <motion.p
              custom={1}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="text-sm uppercase tracking-[0.34em] text-[#85a7b0]"
            >
              Built for job-seekers who want clarity, not black-box outputs
            </motion.p>

            <motion.h1
              custom={2}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="mt-6 max-w-5xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-white md:text-7xl"
            >
              Build a sharper resume from real work, better evidence, and visible quality checks.
            </motion.h1>

            <motion.p
              custom={3}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="mt-6 max-w-3xl text-lg leading-8 text-[#c2bbaf]"
            >
              CVOS helps students, developers, and early-career professionals turn raw career
              details, GitHub work, and vague experience into a reviewed, scored, downloadable
              resume.
            </motion.p>

            <motion.div
              custom={4}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <a
                href="#flow"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#dfc497] px-7 py-4 font-semibold text-[#101216] transition-colors duration-300 hover:bg-[#e6cfaa]"
              >
                Start the product flow
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="#overview"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-medium text-[#e6e0d4] transition-colors duration-300 hover:bg-white/[0.08]"
              >
                See how it works
              </a>
            </motion.div>
          </div>

          <motion.div
            custom={5}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,23,27,0.94),rgba(11,13,15,0.97))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
          >
            <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Above the fold</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">What it is, who it is for, why it matters.</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#dfc497]" />
                <p className="text-sm leading-7 text-[#d8d2c6]">
                  Start with profile data, work history, skills, and GitHub instead of a blank template.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#dfc497]" />
                <p className="text-sm leading-7 text-[#d8d2c6]">
                  Improve weak phrasing, review the draft, and inspect the evaluator before export.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#dfc497]" />
                <p className="text-sm leading-7 text-[#d8d2c6]">
                  Finish with a scored, downloadable document instead of a blind AI answer.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4">
        <div className="h-10 w-[min(88vw,72rem)] rounded-t-[1.4rem] border border-white/8 border-b-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]" />
      </div>
    </section>
  );
}
