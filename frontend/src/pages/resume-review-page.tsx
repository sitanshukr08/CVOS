import { motion } from "framer-motion";
import { FilePenLine, ShieldCheck } from "lucide-react";

import { useResumeFlow } from "@/lib/resume-flow";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";

const reviewPrinciples = [
  "Review and refine your resume content section by section.",
  "Edit content directly to ensure accuracy and professional tone.",
  "Finalize formatting before generating the production PDF."
] as const;

const reviewGuidance = [
  "Make direct edits to any section to perfectly align with your target role.",
  "Ensure your technical skills accurately match your experience.",
  "Verify all metrics and outcomes before final generation."
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  }
};

export function ResumeReviewPage() {
  const { state, updateIntakeField } = useResumeFlow();
  const selectedProjects = (state?.githubImport?.projects || []).filter((project) => project?.selected);
  
  const reviewSections = [
    {
      title: "Profile Summary",
      description:
        "Refine your professional summary to immediately establish your value proposition.",
      value: state?.intake?.headline || "",
      field: "headline" as const,
      placeholder: "Write your refined profile summary here..."
    },
    {
      title: "Professional Experience",
      description:
        "Ensure your experience highlights key achievements, metrics, and technical depth.",
      value: state?.intake?.experienceDetails || "",
      field: "experienceDetails" as const,
      placeholder: "Detail your optimized experience content here..."
    },
    {
      title: "Featured Projects",
      description:
        "Verify the selected projects that will be featured on your final document.",
      value: state?.intake?.featuredProjectsText || "",
      field: "featuredProjectsText" as const,
      placeholder: "Your selected projects will appear here..."
    },
    {
      title: "Technical Skills",
      description:
        "Review your technical skills to ensure they align with industry expectations.",
      value: state?.intake?.skillsSnapshot || "",
      field: "skillsSnapshot" as const,
      placeholder: "Your organized skills will appear here..."
    },
    {
      title: "Education & Certifications",
      description:
        "Confirm your educational background and relevant institutional details.",
      value: state?.intake?.educationDetails || "",
      field: "educationDetails" as const,
      placeholder: "Your verified education details will appear here..."
    }
  ] as const;

  return (
    <main className="min-h-screen bg-[#07090c] text-white">
      <Navbar1 />
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]"
        >
          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <motion.div variants={itemVariants} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 transition-all hover:border-white/20">
              <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Review Capabilities</p>
              <div className="mt-5 space-y-3">
                {reviewPrinciples.map((item) => (
                  <motion.div
                    key={item}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-[#d8d2c6] transition-colors hover:bg-white/[0.08]"
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 transition-all hover:border-white/20">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-4 py-2 text-sm text-[#e7e1d5]">
                <ShieldCheck className="h-4 w-4 text-[#dfc497]" />
                Best Practices
              </div>
              <div className="mt-5 space-y-3">
                {reviewGuidance.map((rule) => (
                  <motion.div
                    key={rule}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-[#d8d2c6] transition-colors hover:bg-white/[0.08]"
                  >
                    {rule}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </aside>

          <div className="space-y-8">
            <motion.section
              variants={itemVariants}
              className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8 hover:shadow-[0_24px_80px_rgba(0,0,0,0.4)] transition-all duration-500"
            >
              <div className="grid gap-6 md:grid-cols-3">
                <motion.div whileHover={{ y: -5 }} className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.06]">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Content Source</p>
                  <p className="mt-4 text-sm leading-7 text-[#d8d2c6]">
                    Data is aggregated from your intake form, AI optimizations, and GitHub imports.
                  </p>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.06]">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Direct Editing</p>
                  <p className="mt-4 text-sm leading-7 text-[#d8d2c6]">
                    Refine each section manually to ensure precise phrasing and factual accuracy.
                  </p>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.06]">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Quality Evaluation</p>
                  <p className="mt-4 text-sm leading-7 text-[#d8d2c6]">
                    The finalized text will be scored for quality before compiling the final PDF.
                  </p>
                </motion.div>
              </div>
            </motion.section>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
              {reviewSections.map((section) => (
                <motion.article
                  key={section.title}
                  variants={itemVariants}
                  className="group rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:border-[#85a7b0]/30"
                >
                  <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-4 py-2 text-sm text-[#e7e1d5] transition-all group-hover:bg-[#85a7b0]/20">
                        <FilePenLine className="h-4 w-4 text-[#dfc497]" />
                        {section.title}
                      </div>
                      <p className="mt-5 max-w-2xl text-base leading-8 text-[#c4beb2]">
                        {section.description}
                      </p>
                    </div>

                    <motion.div 
                      whileFocus={{ scale: 1.01 }} 
                      className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/[0.02] p-5 transition-colors focus-within:border-[#dfc497]/40 focus-within:bg-white/[0.04]"
                    >
                      <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">Section Preview</p>
                      
                      <textarea
                        value={section.value || ""}
                        onChange={(event) => updateIntakeField(section.field, event.target.value)}
                        placeholder={section.placeholder}
                        rows={section.title === "Experience" ? 8 : 6}
                        className="mt-5 w-full resize-none rounded-[1.4rem] border border-white/10 bg-[#0f1317] px-4 py-4 text-sm leading-7 text-[#e7e1d5] placeholder:text-[#8f887c] outline-none transition focus:border-[#85a7b0]/40 focus:ring-1 focus:ring-[#85a7b0]/40"
                      />

                      {section.title === "Featured Projects" && selectedProjects.length > 0 ? (
                        <motion.div layout className="mt-6 flex flex-wrap gap-2">
                          {selectedProjects.map((project) => (
                            <motion.div
                              key={project.id}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-[#d9d3c8]"
                            >
                              {project.name}
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : null}
                    </motion.div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}