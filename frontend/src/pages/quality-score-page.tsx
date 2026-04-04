import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Gauge, ShieldCheck, Sparkles } from "lucide-react";

import { useResumeFlow } from "@/lib/resume-flow";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";

const scorePrinciples = [
  "Expose the evaluator instead of hiding it behind one number.",
  "Show the issues that matter most and make next actions obvious.",
  "Use score as guidance, not as a black-box verdict."
] as const;

const scoreGuidance = [
  "Users should understand which section caused the score to drop.",
  "Penalty explanations should be readable without backend jargon.",
  "This page should create a clear decision: fix the draft or continue."
] as const;

const sectionCards = [
  "Overall score block",
  "Confidence and quality summary",
  "Section-level score breakdown",
  "Penalty and issue feed"
] as const;

export function QualityScorePage() {
  const { quality, canGenerate } = useResumeFlow();

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
                Quality score
              </div>
              <h1 className="mt-5 text-4xl font-semibold leading-tight text-white">
                This page should explain the evaluator, not mystify it.
              </h1>
              <p className="mt-4 text-base leading-8 text-[#c4beb2]">
                A useful score page tells the user what is strong, what is weak, and whether the
                current draft is ready to move into generation.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6">
              <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">What it should do</p>
              <div className="mt-5 space-y-3">
                {scorePrinciples.map((item) => (
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
                Score guidance
              </div>
              <div className="mt-5 space-y-3">
                {scoreGuidance.map((rule) => (
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
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/[0.02] p-5">
                  <Gauge className="h-5 w-5 text-[#dfc497]" />
                  <p className="mt-4 text-lg font-medium text-white">Overall score</p>
                  <p className="mt-3 text-4xl font-semibold text-white">{quality.score}</p>
                  <p className="mt-3 text-sm leading-7 text-[#c4beb2]">
                    Local readiness snapshot until the backend evaluator is wired to this page.
                  </p>
                </div>
                <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/[0.02] p-5">
                  <ShieldCheck className="h-5 w-5 text-[#dfc497]" />
                  <p className="mt-4 text-lg font-medium text-white">Confidence</p>
                  <p className="mt-3 text-4xl font-semibold text-white">{Math.round(quality.confidence * 100)}%</p>
                  <p className="mt-3 text-sm leading-7 text-[#c4beb2]">
                    Confidence here reflects draft completeness across the wired frontend flow.
                  </p>
                </div>
                <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/[0.02] p-5">
                  <AlertTriangle className="h-5 w-5 text-[#dfc497]" />
                  <p className="mt-4 text-lg font-medium text-white">Critical issues</p>
                  <p className="mt-3 text-4xl font-semibold text-white">{quality.issues.length}</p>
                  <p className="mt-3 text-sm leading-7 text-[#c4beb2]">
                    The user should see whether anything blocks generation before moving forward.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-4 md:grid-cols-2"
            >
              {sectionCards.map((card, index) => (
                <motion.article
                  key={card}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                    delay: index * 0.04
                  }}
                  className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)]"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">{card}</p>
                  {index === 0 ? (
                    <p className="mt-5 text-sm leading-7 text-[#d8d2c6]">
                      Overall score: <span className="text-white">{quality.score}</span>
                    </p>
                  ) : index === 1 ? (
                    <div className="mt-5 space-y-3 text-sm leading-7 text-[#d8d2c6]">
                      <p>Profile section: <span className="text-white">{quality.sections.profile}</span></p>
                      <p>Content section: <span className="text-white">{quality.sections.content}</span></p>
                      <p>Projects section: <span className="text-white">{quality.sections.projects}</span></p>
                    </div>
                  ) : index === 2 ? (
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[#d8d2c6]">
                        <span>Can move to generation</span>
                        <span className="text-white">{canGenerate ? "Yes" : "Not yet"}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[#d8d2c6]">
                        <span>Issue count</span>
                        <span className="text-white">{quality.issues.length}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {quality.issues.slice(0, 4).map((issue) => (
                        <div
                          key={issue.title}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-[#d8d2c6]"
                        >
                          <p className="font-medium text-white">{issue.title}</p>
                          <p className="mt-2">{issue.detail}</p>
                        </div>
                      ))}
                      {quality.issues.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-[#d8d2c6]">
                          No blocking issues in the current local draft snapshot.
                        </div>
                      ) : null}
                    </div>
                  )}
                </motion.article>
              ))}
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[2rem] border border-dashed border-white/10 bg-[linear-gradient(180deg,#14181c,#0d1013)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
            >
              <div className="flex min-h-[20rem] items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
                <div className="max-w-2xl">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10">
                    <Gauge className="h-5 w-5 text-[#dfc497]" />
                  </div>
                  <p className="mt-5 text-lg font-medium text-white">
                    Backend evaluator output will replace this local readiness snapshot once the score API is connected.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#c4beb2]">
                    Keep the structure visible, but avoid inventing fake scores or fake issue lists
                    before the backend is wired into the page.
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
