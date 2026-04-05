import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, FileText, LoaderCircle, ShieldCheck, RefreshCw } from "lucide-react";

import DownloadHoverButton from "@/components/ui/download-hover-button";
import { useResumeFlow } from "@/lib/resume-flow";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";

const downloadPrinciples = [
  "Generate a production-ready PDF formatted specifically for ATS systems.",
  "Review your final quality score and analytical confidence metrics.",
  "Download immediately or return to the review phase to make adjustments."
] as const;

const downloadGuidance = [
  "Ensure your target role and contact details are perfectly accurate.",
  "Review any open issues below to identify areas for future optimization.",
  "Use the live sync update feature if you modify underlying data."
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

export function FinalResumeDownloadPage() {
  const {
    downloadFileName,
    state,
    canGenerate,
    quality,
    resetFlow,
    generationStages,
    startGeneration,
    pdfUrl
  } = useResumeFlow();
  
  const [showQuality, setShowQuality] = React.useState(false);

  const isGenerating = state?.generation?.running || false;
  const isCompleted = !!state?.generation?.completedAt;
  const isReady = isCompleted && !!pdfUrl;

  // The Live Sync Tracker
  const hasUnsavedChanges = React.useMemo(() => {
    if (!state?.generation?.lastGeneratedIntake || !isReady) return false;
    return state.generation.lastGeneratedIntake !== JSON.stringify(state.intake);
  }, [state?.generation?.lastGeneratedIntake, state?.intake, isReady]);

  React.useEffect(() => {
    if (!isGenerating && !isCompleted && canGenerate) {
      startGeneration();
    }
  }, [canGenerate, startGeneration, isCompleted, isGenerating]);

  const statusLabel = isReady
    ? "PDF Ready"
    : isGenerating
      ? "Processing Data"
      : canGenerate
        ? "Ready to Compile"
        : "Draft Incomplete";

  return (
    <main className="min-h-screen bg-[#07090c] text-white">
      <Navbar1 />
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <motion.div variants={itemVariants} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 transition-all hover:border-white/20">
              <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Final Stage</p>
              <div className="mt-5 space-y-3">
                {downloadPrinciples.map((item) => (
                  <motion.div key={item} whileHover={{ scale: 1.02, x: 5 }} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-[#d8d2c6] transition-colors hover:bg-white/[0.08]">
                    {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 transition-all hover:border-white/20">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-4 py-2 text-sm text-[#e7e1d5]">
                <ShieldCheck className="h-4 w-4 text-[#dfc497]" /> Next Steps
              </div>
              <div className="mt-5 space-y-3">
                {downloadGuidance.map((rule) => (
                  <motion.div key={rule} whileHover={{ scale: 1.02, x: 5 }} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-[#d8d2c6] transition-colors hover:bg-white/[0.08]">
                    {rule}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </aside>

          <div className="space-y-8">
            <motion.section variants={itemVariants} className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8 flex flex-col relative overflow-hidden">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Final Output</p>
                  <motion.div layout className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.24em] transition-colors duration-500 ${isReady ? "border border-emerald-400/30 bg-emerald-400/12 text-emerald-200" : isGenerating ? "border border-[#dfc497]/30 bg-[#dfc497]/10 text-[#f2dfbe]" : "border border-white/10 bg-white/[0.03] text-[#d8d2c6]"}`}>
                    {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : isReady ? <CheckCircle2 className="h-4 w-4" /> : null}
                    {statusLabel}
                  </motion.div>
                </div>

                <div className="flex-1 min-h-[45rem] relative rounded-[1.8rem] border border-white/10 bg-white/[0.02] overflow-hidden flex flex-col items-center justify-center">
                  
                  {/* LIVE UPDATE BANNER */}
                  <AnimatePresence>
                    {hasUnsavedChanges && !isGenerating && (
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
                      >
                        <button 
                          onClick={() => startGeneration()}
                          className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#dfc497] text-[#07090c] font-semibold text-sm shadow-[0_10px_40px_rgba(223,196,151,0.3)] hover:scale-105 active:scale-95 transition-transform"
                        >
                          <RefreshCw className="h-4 w-4" /> Compile Changes to PDF
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#07090c]/80 backdrop-blur-sm p-6 text-center">
                        <LoaderCircle className="h-10 w-10 animate-spin text-[#dfc497] mb-6" />
                        <p className="text-lg font-medium text-white mb-6">Compiling Document Data...</p>
                        <div className="space-y-3 w-full max-w-md text-left">
                          {(generationStages || []).map((stage) => (
                            <motion.div layout key={stage?.title || Math.random().toString()} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-white">{stage?.title}</p>
                              <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] transition-colors ${stage?.status === "complete" ? "bg-emerald-400/12 text-emerald-200" : stage?.status === "active" ? "bg-[#dfc497]/12 text-[#f2dfbe]" : "bg-white/[0.05] text-[#bfb8ab]"}`}>
                                {stage?.status}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}

                    {isReady && pdfUrl ? (
                      <motion.iframe key="pdf" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} src={`${pdfUrl}#view=Fit&navpanes=0&toolbar=1`} className={`w-full h-full bg-white absolute inset-0 rounded-[1.8rem] transition-opacity ${hasUnsavedChanges ? 'opacity-50 blur-[2px]' : 'opacity-100'}`} title="Resume Preview" />
                    ) : !isGenerating ? (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg text-center p-6">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10"><FileText className="h-6 w-6 text-[#dfc497]" /></div>
                        <p className="mt-5 text-lg font-medium text-white">Generation Pending</p>
                        <p className="mt-3 text-sm leading-7 text-[#c4beb2]">Ensure your details are completed in the Intake phase to begin document generation.</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
                  <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Primary Actions</p>
                  <div className="mt-6 space-y-3">
                    <motion.div whileHover={{ scale: isReady ? 1.02 : 1 }} whileTap={{ scale: isReady ? 0.98 : 1 }} className="flex justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6">
                      <DownloadHoverButton href={pdfUrl || "#"} fileName={downloadFileName || "Resume.pdf"} disabled={!isReady || !pdfUrl} label="Download Document" />
                    </motion.div>

                    <motion.button type="button" onClick={() => setShowQuality((current) => !current)} disabled={!isReady} className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${isReady ? "border-[#dfc497]/30 bg-[#dfc497]/10 text-[#f4efe4] hover:bg-[#dfc497]/16" : "border-white/10 bg-white/[0.03] text-[#9f998d]"}`}>
                      <span className="text-sm font-medium">{showQuality ? "Hide Diagnostics" : "Show Analytics & Score"}</span>
                      <ArrowRight className={`h-4 w-4 transition-transform ${showQuality ? "rotate-90" : ""}`} />
                    </motion.button>

                    <motion.a whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.06)" }} whileTap={{ scale: 0.98 }} href="/resume-review" className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left text-[#d8d2c6] transition-colors hover:bg-white/[0.06]">
                      <span className="text-sm font-medium">Return to Data Review</span>
                      <ArrowRight className="h-4 w-4" />
                    </motion.a>

                    <motion.a whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.06)" }} whileTap={{ scale: 0.98 }} href="/resume-intake" onClick={resetFlow} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left text-[#d8d2c6] transition-colors hover:bg-white/[0.06]">
                      <span className="text-sm font-medium">Initialize New Session</span>
                      <ArrowRight className="h-4 w-4" />
                    </motion.a>
                  </div>
                </div>

                <div className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
                  <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">System Status</p>
                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-4 text-sm leading-7 text-[#d8d2c6]">
                      Target Output: <span className="text-white break-all">{downloadFileName}</span>
                    </div>
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-4 text-sm leading-7 text-[#d8d2c6]">
                      Engine State: <span className="text-white">{isReady ? "Export Ready" : isGenerating ? "Compiling Format" : canGenerate ? "Awaiting Command" : "Incomplete Data"}</span>
                    </div>
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-4 text-sm leading-7 text-[#d8d2c6]">
                      Calculated Quality: <span className="text-white">{quality?.score || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            <AnimatePresence>
              {showQuality && (
                <motion.section initial={{ opacity: 0, height: 0, scale: 0.98, marginTop: 0 }} animate={{ opacity: 1, height: "auto", scale: 1, marginTop: "2rem" }} exit={{ opacity: 0, height: 0, scale: 0.98, marginTop: 0 }} transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                  <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-8">
                    <div className="grid gap-6 lg:grid-cols-3">
                      <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5"><p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Quality Score</p><p className="mt-4 text-4xl font-semibold text-white">{quality?.score || 0}</p></div>
                      <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5"><p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">System Confidence</p><p className="mt-4 text-4xl font-semibold text-white">{Math.round((quality?.confidence || 0) * 100)}%</p></div>
                      <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5"><p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Diagnostic Flags</p><p className="mt-4 text-4xl font-semibold text-white">{quality?.issues?.length || 0}</p></div>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                      <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5"><p className="text-sm font-medium text-white">Profile Depth</p><p className="mt-3 text-3xl font-semibold text-white">{quality?.sections?.profile || 0}</p></div>
                      <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5"><p className="text-sm font-medium text-white">Content Quality</p><p className="mt-3 text-3xl font-semibold text-white">{quality?.sections?.content || 0}</p></div>
                      <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5"><p className="text-sm font-medium text-white">Project Weight</p><p className="mt-3 text-3xl font-semibold text-white">{quality?.sections?.projects || 0}</p></div>
                    </div>

                    <div className="mt-6 rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Optimization Diagnostics</p>
                      <div className="mt-4 space-y-3">
                        {(quality?.issues?.length || 0) > 0 ? (
                          (quality?.issues || []).map((issue) => (
                            <div key={issue?.title || Math.random().toString()} className="rounded-2xl border border-white/10 bg-[#0f1317] px-4 py-4">
                              <p className="text-sm font-medium text-white">{issue?.title}</p>
                              <p className="mt-2 text-sm leading-7 text-[#c4beb2]">{issue?.detail}</p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-white/10 bg-[#0f1317] px-4 py-4 text-sm leading-7 text-[#c4beb2]">
                            System confirms 0 blocking issues. Document is highly optimized.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>
    </main>
  );
}