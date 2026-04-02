import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  LoaderCircle,
  ShieldCheck
} from "lucide-react";

import DownloadHoverButton from "@/components/ui/download-hover-button";
import { useResumeFlow } from "@/lib/resume-flow";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";

const downloadPrinciples = [
  "End on a trustworthy result page, not a dead file drop.",
  "Make preview, export, and revision paths all visible at once.",
  "Keep the final state calm, clear, and decisively useful."
] as const;

const downloadGuidance = [
  "The user should understand what version they are exporting.",
  "Revision paths should be easy to find without hiding the main download action.",
  "This page should feel finished even before real preview data is wired in."
] as const;

export function FinalResumeDownloadPage() {
  const {
    downloadFileName,
    state,
    canGenerate,
    quality,
    resetFlow,
    generationStages,
    startGeneration
  } = useResumeFlow();
  const [showQuality, setShowQuality] = React.useState(false);

  React.useEffect(() => {
    if (!state.generation.running && !state.generation.completedAt && canGenerate) {
      startGeneration();
    }
  }, [canGenerate, startGeneration, state.generation.completedAt, state.generation.running]);

  const isReady = !!state.generation.completedAt;
  const isGenerating = state.generation.running;
  const statusLabel = isReady
    ? "PDF ready"
    : isGenerating
      ? "Generating now"
      : canGenerate
        ? "Ready to generate"
        : "Draft incomplete";

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
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6">
              <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">What it should do</p>
              <div className="mt-5 space-y-3">
                {downloadPrinciples.map((item) => (
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
                Final-state guidance
              </div>
              <div className="mt-5 space-y-3">
                {downloadGuidance.map((rule) => (
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
              className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]"
            >
              <div className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Final output</p>
                  <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.24em] ${
                    isReady
                      ? "border border-emerald-400/30 bg-emerald-400/12 text-emerald-200"
                      : isGenerating
                        ? "border border-[#dfc497]/30 bg-[#dfc497]/10 text-[#f2dfbe]"
                        : "border border-white/10 bg-white/[0.03] text-[#d8d2c6]"
                  }`}>
                    {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : isReady ? <CheckCircle2 className="h-4 w-4" /> : null}
                    {statusLabel}
                  </div>
                </div>
                <div className="mt-6 flex min-h-[34rem] items-center justify-center rounded-[1.8rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
                  <div className="max-w-lg">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10">
                      <FileText className="h-6 w-6 text-[#dfc497]" />
                    </div>
                    <p className="mt-5 text-lg font-medium text-white">
                      {isReady
                        ? `${downloadFileName} is ready for preview and export.`
                        : isGenerating
                          ? "The resume is still being generated from the current reviewed draft."
                          : "Generation has not started yet for this draft."}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#c4beb2]">
                      {isReady
                        ? "The shared generation state now feeds this page, so the final handoff reflects the current draft run."
                        : "Until the PDF is ready, this surface should show the real loading state from the current generation run instead of a fake preview."}
                    </p>

                    {!isReady ? (
                      <div className="mt-8 space-y-3 text-left">
                        {generationStages.map((stage) => (
                          <div
                            key={stage.title}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-white">{stage.title}</p>
                              <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em] ${
                                stage.status === "complete"
                                  ? "bg-emerald-400/12 text-emerald-200"
                                  : stage.status === "active"
                                    ? "bg-[#dfc497]/12 text-[#f2dfbe]"
                                    : stage.status === "blocked"
                                      ? "bg-rose-400/12 text-rose-200"
                                      : "bg-white/[0.05] text-[#bfb8ab]"
                              }`}>
                                {stage.status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-7 text-[#c4beb2]">{stage.detail}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
                  <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Primary actions</p>
                  <div className="mt-6 space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                      className="flex justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6"
                    >
                      <DownloadHoverButton
                        href="#download-ready"
                        fileName={downloadFileName}
                        disabled={!isReady}
                        label="Download PDF"
                      />
                    </motion.div>

                    <motion.button
                      type="button"
                      onClick={() => setShowQuality((current) => !current)}
                      disabled={!isReady}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        isReady
                          ? "border-[#dfc497]/30 bg-[#dfc497]/10 text-[#f4efe4] hover:bg-[#dfc497]/16"
                          : "border-white/10 bg-white/[0.03] text-[#9f998d]"
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {showQuality ? "Hide quality score" : "Show quality score"}
                      </span>
                      <ArrowRight className={`h-4 w-4 transition-transform ${showQuality ? "rotate-90" : ""}`} />
                    </motion.button>

                    <motion.a
                      href="/resume-review"
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left text-[#d8d2c6] transition-colors hover:bg-white/[0.05]"
                    >
                      <span className="text-sm font-medium">Return to review</span>
                      <ArrowRight className="h-4 w-4" />
                    </motion.a>

                    <motion.a
                      href="/resume-intake"
                      onClick={resetFlow}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left text-[#d8d2c6] transition-colors hover:bg-white/[0.05]"
                    >
                      <span className="text-sm font-medium">Start a new resume</span>
                      <ArrowRight className="h-4 w-4" />
                    </motion.a>
                  </div>
                  <p className="mt-4 text-xs leading-6 text-[#9f998d]">
                    Download and quality only light up when the current generation run is complete.
                  </p>
                </div>

                <div className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
                  <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Run status</p>
                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-4 text-sm leading-7 text-[#d8d2c6]">
                      Current file: <span className="text-white">{downloadFileName}</span>
                    </div>
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-4 text-sm leading-7 text-[#d8d2c6]">
                      Output status:{" "}
                      <span className="text-white">
                        {isReady ? "ready for export" : isGenerating ? "generation in progress" : canGenerate ? "ready to generate" : "draft not ready"}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-4 text-sm leading-7 text-[#d8d2c6]">
                      Reviewed draft score: <span className="text-white">{quality.score}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {showQuality ? (
              <motion.section
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-8"
              >
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Overall score</p>
                    <p className="mt-4 text-4xl font-semibold text-white">{quality.score}</p>
                  </div>
                  <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Confidence</p>
                    <p className="mt-4 text-4xl font-semibold text-white">{Math.round(quality.confidence * 100)}%</p>
                  </div>
                  <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Open issues</p>
                    <p className="mt-4 text-4xl font-semibold text-white">{quality.issues.length}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm font-medium text-white">Profile</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{quality.sections.profile}</p>
                  </div>
                  <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm font-medium text-white">Content</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{quality.sections.content}</p>
                  </div>
                  <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm font-medium text-white">Projects</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{quality.sections.projects}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Issue breakdown</p>
                  <div className="mt-4 space-y-3">
                    {quality.issues.length > 0 ? (
                      quality.issues.map((issue) => (
                        <div
                          key={issue.title}
                          className="rounded-2xl border border-white/10 bg-[#0f1317] px-4 py-4"
                        >
                          <p className="text-sm font-medium text-white">{issue.title}</p>
                          <p className="mt-2 text-sm leading-7 text-[#c4beb2]">{issue.detail}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-[#0f1317] px-4 py-4 text-sm leading-7 text-[#c4beb2]">
                        No blocking issues in the current local draft snapshot.
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            ) : null}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
