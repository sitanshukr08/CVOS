import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  GitBranch,
  FolderGit2,
  ShieldCheck,
  Sparkles,
  Search
} from "lucide-react";

import { useResumeFlow } from "@/lib/resume-flow";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";

const importPrinciples = [
  "Surface the strongest repos instead of everything in the profile.",
  "Show why a project was selected with readable evidence.",
  "Help the user choose what belongs on a resume before generation."
] as const;

const importGuidance = [
  "Favor repos with clear README quality, recency, and technical depth.",
  "Avoid flooding the page with weak demos, tutorials, or throwaway experiments.",
  "Use the preview state to frame why a repository matters in resume language."
] as const;

export function GitHubImportPage() {
  const { state, updateIntakeField, importProjects, toggleProjectSelection } = useResumeFlow();
  const selectedProjects = state.githubImport.projects.filter((project) => project.selected);

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
                GitHub import
              </div>
              <h1 className="mt-5 text-4xl font-semibold leading-tight text-white">
                Turn repository history into stronger resume evidence.
              </h1>
              <p className="mt-4 text-base leading-8 text-[#c4beb2]">
                This page should help users import a GitHub profile, rank the best work, and keep
                only the repositories that actually improve the final resume.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6">
              <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">What it should do</p>
              <div className="mt-5 space-y-3">
                {importPrinciples.map((item) => (
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
                Import guidance
              </div>
              <div className="mt-5 space-y-3">
                {importGuidance.map((rule) => (
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
              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Connect profile</p>
                  <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                    Start with a GitHub username and make the import feel deliberate.
                  </h2>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-[#c4beb2]">
                    This should not look like a generic auth step. Users enter a username, inspect
                    what was found, and decide which projects should carry forward into the resume.
                  </p>

                  <div className="mt-8 grid gap-5 md:grid-cols-[1fr_auto]">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-[#ddd6c8]">GitHub username</span>
                      <input
                        type="text"
                        placeholder="aarav-dev"
                        value={state.intake.githubUsername}
                        onChange={(event) => updateIntakeField("githubUsername", event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white placeholder:text-white/28 outline-none transition focus:border-[#85a7b0]/40 focus:bg-white/[0.05]"
                      />
                    </label>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={importProjects}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#dfc497] px-6 py-4 font-semibold text-[#101216] transition-colors duration-300 hover:bg-[#e6cfaa]"
                      >
                        <FolderGit2 className="h-5 w-5" />
                        Import repos
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,#111419,#0b0e12)] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">What the backend values</p>
                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <p className="text-sm font-medium text-white">README quality and clarity</p>
                      <p className="mt-2 text-sm leading-7 text-[#bdb6aa]">
                        Repositories with meaningful documentation get stronger ranking signals.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <p className="text-sm font-medium text-white">Recency and activity</p>
                      <p className="mt-2 text-sm leading-7 text-[#bdb6aa]">
                        Recent work with visible iteration reads better than stale experiments.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <p className="text-sm font-medium text-white">Technical depth</p>
                      <p className="mt-2 text-sm leading-7 text-[#bdb6aa]">
                        Strong languages, useful system scope, and proof of real execution should
                        outrank toy repos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Ranked results</p>
                  <h2 className="mt-3 text-3xl font-semibold leading-tight text-white">
                    Keep this area honest until real repository data is available.
                  </h2>
                </div>
                <p className="max-w-sm text-right text-sm leading-7 text-[#b7b1a4]">
                  Once import is triggered, use current draft project names as temporary candidate selections until backend GitHub ranking is connected.
                </p>
              </div>

              {state.githubImport.projects.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-white/10 bg-[linear-gradient(180deg,#14181c,#0d1013)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
                  <div className="flex min-h-[28rem] items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
                    <div className="max-w-2xl">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10">
                        <Search className="h-5 w-5 text-[#dfc497]" />
                      </div>
                      <p className="mt-5 text-lg font-medium text-white">
                        No imported project candidates yet.
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#c4beb2]">
                        Add a GitHub username and click import. Until backend repo ranking is wired,
                        this page will use the project names already present in the draft as temporary candidates.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.githubImport.projects.map((project) => (
                    <motion.article
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)]"
                    >
                      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-4 py-2 text-sm text-[#e7e1d5]">
                            <GitBranch className="h-4 w-4 text-[#dfc497]" />
                            {project.name}
                          </div>
                          <p className="mt-5 text-sm leading-7 text-[#c4beb2]">
                            Temporary candidate derived from the current draft. Replace this with real ranked repository data once the GitHub backend is connected.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleProjectSelection(project.id)}
                          className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-medium transition-colors duration-300 ${
                            project.selected
                              ? "bg-[#dfc497] text-[#101216] hover:bg-[#e6cfaa]"
                              : "border border-white/10 bg-white/[0.04] text-[#e6e0d4] hover:bg-white/[0.08]"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {project.selected ? "Selected" : "Keep project"}
                        </button>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.section>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
