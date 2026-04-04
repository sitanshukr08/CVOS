import { motion } from "framer-motion";
import { FilePenLine, ShieldCheck } from "lucide-react";

import { useResumeFlow } from "@/lib/resume-flow";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";

const reviewPrinciples = [
  "Show the draft in editable sections instead of one long wall of text.",
  "Make it obvious which block is ready, which needs revision, and which can be regenerated.",
  "Use review to control the draft before scoring, not to restart intake."
] as const;

const reviewGuidance = [
  "Edit sections directly where possible so the user stays in context.",
  "Keep regenerate actions local to a block instead of refreshing the whole draft.",
  "Make it easy to understand what changed before moving to score."
] as const;

export function ResumeReviewPage() {
  const { state, updateIntakeField } = useResumeFlow();
  const selectedProjects = state.githubImport.projects.filter((project) => project.selected);
  
  const reviewSections = [
    {
      title: "Profile summary",
      description:
        "Refine the profile line before the evaluator reads it. This is where role direction and tone should feel stable.",
      value: state.intake.headline,
      field: "headline" as const,
      placeholder: "Write the reviewed profile summary here..."
    },
    {
      title: "Experience",
      description:
        "Inspect the strongest experience details and tighten the evidence before scoring.",
      value: state.intake.experienceDetails,
      field: "experienceDetails" as const,
      placeholder: "Describe reviewed experience content here..."
    },
    {
      title: "Projects",
      description:
        "The selected project set should be visible here before it flows into the final resume draft.",
      value: state.intake.featuredProjectsText,
      field: "featuredProjectsText" as const,
      placeholder: "Selected projects will appear here..."
    },
    {
      title: "Skills snapshot",
      description:
        "Keep the core technical capabilities readable and accurate before the evaluator turns them into a score.",
      value: state.intake.skillsSnapshot,
      field: "skillsSnapshot" as const,
      placeholder: "Reviewed skills will appear here..."
    },
    {
      title: "Education",
      description:
        "Preserve the education details as a separate block so the final draft stays easy to validate.",
      value: state.intake.educationDetails,
      field: "educationDetails" as const,
      placeholder: "Reviewed education details will appear here..."
    }
  ] as const;

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
                {reviewPrinciples.map((item) => (
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
                Review guidance
              </div>
              <div className="mt-5 space-y-3">
                {reviewGuidance.map((rule) => (
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
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Draft source</p>
                  <p className="mt-4 text-sm leading-7 text-[#d8d2c6]">
                    Intake, assistant, and GitHub import should already feed this review surface.
                  </p>
                </div>
                <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Block actions</p>
                  <p className="mt-4 text-sm leading-7 text-[#d8d2c6]">
                    Each section should support local editing and local regeneration.
                  </p>
                </div>
                <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Next page</p>
                  <p className="mt-4 text-sm leading-7 text-[#d8d2c6]">
                    Quality score should evaluate this reviewed draft, not unfiltered upstream input.
                  </p>
                </div>
              </div>
            </motion.section>

            <div className="space-y-4">
              {reviewSections.map((section, index) => (
                <motion.article
                  key={section.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{
                    duration: 0.52,
                    ease: [0.22, 1, 0.36, 1],
                    delay: index * 0.04
                  }}
                  className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
                >
                  <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-4 py-2 text-sm text-[#e7e1d5]">
                        <FilePenLine className="h-4 w-4 text-[#dfc497]" />
                        {section.title}
                      </div>
                      <p className="mt-5 max-w-2xl text-base leading-8 text-[#c4beb2]">
                        {section.description}
                      </p>
                    </div>

                    <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/[0.02] p-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Section preview</p>
                      
                      <textarea
                        value={section.value || ""}
                        onChange={(event) => updateIntakeField(section.field, event.target.value)}
                        placeholder={section.placeholder}
                        rows={section.title === "Experience" ? 8 : 6}
                        className="mt-5 w-full resize-none rounded-[1.4rem] border border-white/10 bg-[#0f1317] px-4 py-4 text-sm leading-7 text-[#e7e1d5] placeholder:text-[#8f887c] outline-none transition focus:border-[#85a7b0]/40"
                      />

                      {section.title === "Projects" && selectedProjects.length > 0 ? (
                        <div className="mt-6 flex flex-wrap gap-2">
                          {selectedProjects.map((project) => (
                            <div
                              key={project.id}
                              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-[#d9d3c8]"
                            >
                              {project.name}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}