import { motion } from "framer-motion";
import { ArrowRight, Bot, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";

import { useResumeFlow } from "@/lib/resume-flow";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";

const generationPrinciples = [
  "Show real progress through the pipeline instead of a dead spinner.",
  "Keep the user oriented across enhancement, evaluation, and PDF generation.",
  "Make failures and retries legible when something goes wrong."
] as const;

const generationGuidance = [
  "Users should know which stage the backend is on right now.",
  "The page should feel calm during waiting, not empty or frozen.",
  "Progress should move naturally toward the final download state."
] as const;

export function GenerationProcessingPage() {
  const { canGenerate, generationStages, startGeneration, resetGeneration, state, downloadFileName } =
    useResumeFlow();

  return (
    <main className="min-h-screen bg-[#07090c] text-white">
      <Navbar1 />
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]"
        >
          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-4 py-2 text-sm text-[#e7e1d5]">
                <Sparkles className="h-4 w-4 text-[#dfc497]" />
                Generation
              </div>
              <h1 className="mt-5 text-4xl font-semibold leading-tight text-white">
                Waiting should feel informed, not blank.
              </h1>
              <p className="mt-4 text-base leading-8 text-[#c4beb2]">
                This page should show the backend moving through enhancement, evaluation, and final
                compilation so the user understands what is happening.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6">
              <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">What it should do</p>
              <div className="mt-5 space-y-3">
                {generationPrinciples.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-[#d8d2c6]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-4 py-2 text-sm text-[#e7e1d5]">
                <ShieldCheck className="h-4 w-4 text-[#dfc497]" />
                Processing guidance
              </div>
              <div className="mt-5 space-y-3">
                {generationGuidance.map((rule) => (
                  <div
                    key={rule}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-[#d8d2c6]"
                  >
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8"
            >
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Current run</p>
                  <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                    The system should show clear movement through the pipeline.
                  </h2>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-[#c4beb2]">
                    This is the moment where the backend should feel visible: not every log line,
                    but enough stage detail for the user to trust the process.
                  </p>

                  <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#dfc497]/20 bg-[#dfc497]/10 px-5 py-3 text-sm text-[#e7e1d5]">
                    <LoaderCircle
                      className={`h-4 w-4 text-[#dfc497] ${state.generation.running ? "animate-spin" : ""}`}
                    />
                    {state.generation.running
                      ? "Generation in progress"
                      : state.generation.completedAt
                        ? "Latest run completed"
                        : canGenerate
                          ? "Ready to generate"
                          : "Waiting for a stronger draft"}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={startGeneration}
                      disabled={!canGenerate || state.generation.running}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#dfc497] px-6 py-4 font-semibold text-[#101216] transition-colors duration-300 hover:bg-[#e6cfaa] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Start generation
                    </button>
                    <button
                      type="button"
                      onClick={resetGeneration}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-medium text-[#e6e0d4] transition-colors duration-300 hover:bg-white/[0.08]"
                    >
                      Reset run
                    </button>
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/[0.02] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Live status area</p>
                  <div className="mt-5 space-y-3">
                    <div className="h-4 w-2/3 rounded-full bg-white/10" />
                    <div className="h-4 w-full rounded-full bg-white/10" />
                    <div className="h-4 w-[86%] rounded-full bg-white/10" />
                    <div className="h-4 w-[74%] rounded-full bg-white/10" />
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
            >
              <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Pipeline stages</p>
              <div className="mt-6 space-y-4">
                {generationStages.map((stage, index) => (
                  <motion.div
                    key={stage.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{
                      duration: 0.48,
                      ease: [0.22, 1, 0.36, 1],
                      delay: index * 0.04
                    }}
                    className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5 md:grid-cols-[auto_1fr_auto]"
                  >
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10">
                      <Bot className={`h-5 w-5 ${stage.status === "complete" ? "text-[#dfc497]" : stage.status === "active" ? "text-white" : "text-[#85a7b0]"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{stage.title}</p>
                      <p className="mt-2 text-sm leading-7 text-[#c4beb2]">
                        {stage.detail}
                      </p>
                    </div>
                    <div className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em] ${
                      stage.status === "complete"
                        ? "border-[#dfc497]/20 bg-[#dfc497]/10 text-[#dfc497]"
                        : stage.status === "active"
                          ? "border-white/10 bg-white/[0.08] text-white"
                          : stage.status === "blocked"
                            ? "border-red-500/20 bg-red-500/10 text-red-300"
                            : "border-white/10 bg-[#0f1317] text-[#85a7b0]"
                    }`}>
                      {stage.status}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[2rem] border border-dashed border-white/10 bg-[linear-gradient(180deg,#14181c,#0d1013)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
            >
              <div className="flex min-h-[18rem] items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
                <div className="max-w-2xl">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10">
                    <LoaderCircle className="h-5 w-5 animate-spin text-[#dfc497]" />
                  </div>
                  <p className="mt-5 text-lg font-medium text-white">
                    This run state is now wired to the shared frontend draft.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#c4beb2]">
                    {state.generation.completedAt
                      ? `The current local run has completed and is preparing ${downloadFileName}.`
                      : "For now, keep this state honest. Show pipeline progress without inventing fake logs from the backend."}
                  </p>
                </div>
              </div>
            </motion.section>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
