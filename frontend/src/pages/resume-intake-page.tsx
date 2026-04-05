import { motion, AnimatePresence } from "framer-motion";
import {
  BriefcaseBusiness,
  CheckCircle2,
  FolderGit2,
  GitBranch,
  Link2,
  type LucideIcon,
  ShieldCheck,
  UserRound,
  WandSparkles
} from "lucide-react";
import { useResumeFlow } from "@/lib/resume-flow";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";

const checklist = [
  "Specify your target role to align the resume's overall tone.",
  "Highlight specific tools and frameworks over generic terms.",
  "Provide measurable outcomes and business metrics where possible.",
  "Include only relevant professional links (LinkedIn, GitHub, Portfolio)."
];

const formSections = [
  {
    id: "profile",
    eyebrow: "Section 01",
    title: "Profile Basics",
    description:
      "Provide your core contact details and professional summary to anchor your resume.",
    icon: UserRound
  },
  {
    id: "links",
    eyebrow: "Section 02",
    title: "Direction & GitHub Context",
    description:
      "Define your target role and import relevant GitHub repositories to establish technical credibility.",
    icon: Link2
  },
  {
    id: "experience",
    eyebrow: "Section 03",
    title: "Experience & Education",
    description:
      "Detail your professional background. Specific, metric-driven data points yield a much higher quality final document.",
    icon: BriefcaseBusiness
  }
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

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2 group">
      <span className="text-sm font-medium text-[#ddd6c8] transition-colors group-focus-within:text-[#dfc497]">{label}</span>
      <motion.input
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white placeholder:text-white/28 outline-none transition focus:border-[#85a7b0]/40 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(133,167,176,0.1)]"
      />
    </label>
  );
}

function TextArea({
  label,
  placeholder,
  rows = 5,
  value,
  onChange
}: {
  label: string;
  placeholder: string;
  rows?: number;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2 group">
      <span className="text-sm font-medium text-[#ddd6c8] transition-colors group-focus-within:text-[#dfc497]">{label}</span>
      <motion.textarea
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white placeholder:text-white/28 outline-none transition focus:border-[#85a7b0]/40 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(133,167,176,0.1)]"
      />
    </label>
  );
}

function SectionShell({
  eyebrow,
  title,
  description,
  icon: Icon,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={itemVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15181c,#0e1114)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8 transition-all hover:shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-4 py-2 text-sm text-[#e7e1d5]">
            <Icon className="h-4 w-4 text-[#dfc497]" />
            <span>{eyebrow}</span>
          </div>
          <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">{title}</h2>
          <p className="max-w-xl text-base leading-8 text-[#c4beb2]">{description}</p>
        </div>

        <div className="space-y-5">{children}</div>
      </div>
    </motion.section>
  );
}

export function ResumeIntakePage() {
  const { state, updateIntakeField, importProjects, toggleProjectSelection } = useResumeFlow();
  const selectedProjects = (state?.githubImport?.projects || []).filter((project) => project?.selected);

  return (
    <main id="top" className="overflow-hidden bg-[#07090c] text-white">
      <Navbar1 />
      <section id="intake-form" className="mx-auto max-w-7xl px-6 pb-24 pt-10 lg:px-8 lg:pt-12">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-10 lg:grid-cols-[300px_1fr]">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <motion.div variants={itemVariants} id="quality-notes" className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#16191d,#0f1215)] p-6 transition-all hover:border-white/20">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-4 py-2 text-sm text-[#e7e1d5]">
                <ShieldCheck className="h-4 w-4 text-[#dfc497]" />
                Best Practices
              </div>
              <div className="mt-5 space-y-3">
                {checklist.map((item) => (
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
          </div>

          <div className="space-y-10">
            <SectionShell {...formSections[0]}>
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Full name"
                  placeholder="John Doe"
                  value={state?.intake?.name || ""}
                  onChange={(value) => updateIntakeField("name", value)}
                />
                <Field
                  label="Email address"
                  placeholder="john@example.com"
                  type="email"
                  value={state?.intake?.email || ""}
                  onChange={(value) => updateIntakeField("email", value)}
                />
                <Field
                  label="Phone number"
                  placeholder="+1 (555) 000-0000"
                  value={state?.intake?.phone || ""}
                  onChange={(value) => updateIntakeField("phone", value)}
                />
                <Field
                  label="Current location"
                  placeholder="San Francisco, CA"
                  value={state?.intake?.location || ""}
                  onChange={(value) => updateIntakeField("location", value)}
                />
              </div>

              <TextArea
                label="Professional Summary"
                placeholder="Backend engineer with 3 years of experience in scalable systems, targeting high-growth product roles."
                rows={4}
                value={state?.intake?.headline || ""}
                onChange={(value) => updateIntakeField("headline", value)}
              />
            </SectionShell>

            <SectionShell {...formSections[1]}>
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <Field
                  label="GitHub username"
                  placeholder="johndoe-dev"
                  value={state?.intake?.githubUsername || ""}
                  onChange={(value) => updateIntakeField("githubUsername", value)}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={importProjects}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#dfc497] px-5 py-3.5 font-semibold text-[#101216] transition-colors duration-300 hover:bg-[#e6cfaa] md:mb-[1px] shadow-[0_0_20px_rgba(223,196,151,0.15)]"
                >
                  <FolderGit2 className="h-4 w-4" />
                  Import projects
                </motion.button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="LinkedIn URL"
                  placeholder="https://linkedin.com/in/johndoe"
                  value={state?.intake?.linkedin || ""}
                  onChange={(value) => updateIntakeField("linkedin", value)}
                />
                <Field
                  label="Target role"
                  placeholder="Senior Software Engineer"
                  value={state?.intake?.targetRole || ""}
                  onChange={(value) => updateIntakeField("targetRole", value)}
                />
                <Field
                  label="Primary domain"
                  placeholder="Backend, AI, Fintech, etc."
                  value={state?.intake?.primaryDomain || ""}
                  onChange={(value) => updateIntakeField("primaryDomain", value)}
                />
              </div>

              <motion.div whileHover={{ y: -2 }} className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,#15181c,#0f1215)] p-5 transition-colors hover:border-[#85a7b0]/30">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[#d9d3c8]">
                    <FolderGit2 className="h-4 w-4 text-[#dfc497]" />
                    GitHub Integrations
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[#d8d2c6]">
                    Source:{" "}
                    <span className="text-white">
                      {state?.githubImport?.lastImportedUsername || state?.intake?.githubUsername || "Not imported"}
                    </span>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[#d8d2c6]">
                    Selected: <span className="text-white">{selectedProjects.length}</span>
                  </div>
                </div>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-[#c4beb2]">
                  Import your GitHub repositories to establish a strong technical foundation. Select only the projects that align closely with your targeted role.
                </p>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-[#d8d2c6]">
                  {(state?.githubImport?.projects?.length || 0) > 0 ? (
                    <>
                      Review your imported repositories and select the ones to feature on your resume.
                    </>
                  ) : (
                    "Imported repositories will appear here once connected."
                  )}
                </div>

                <AnimatePresence>
                  {(state?.githubImport?.projects?.length || 0) > 0 ? (
                    <motion.div layout className="mt-4 grid gap-3">
                      {state.githubImport.projects.map((project) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={project.id}
                          className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-white/[0.06]"
                        >
                          <div>
                            <div className="inline-flex items-center gap-2 text-sm font-medium text-white">
                              <GitBranch className="h-4 w-4 text-[#dfc497]" />
                              {project.name}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#bdb6aa]">
                              Include this project to highlight relevant technical skills.
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => toggleProjectSelection(project.id)}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-300 ${
                              project.selected
                                ? "bg-[#dfc497] text-[#101216] hover:bg-[#e6cfaa] shadow-[0_0_15px_rgba(223,196,151,0.2)]"
                                : "border border-white/10 bg-white/[0.04] text-[#e6e0d4] hover:bg-white/[0.08]"
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {project.selected ? "Selected" : "Select Project"}
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>

              <TextArea
                label="Skills Snapshot"
                placeholder="Python, TypeScript, React, Docker, AWS, PostgreSQL"
                rows={4}
                value={state?.intake?.skillsSnapshot || ""}
                onChange={(value) => updateIntakeField("skillsSnapshot", value)}
              />
            </SectionShell>

            <SectionShell {...formSections[2]}>
              <TextArea
                label="Work Experience"
                placeholder="Detail your professional experience. Include company names, roles, dates, and actionable metric-driven bullet points."
                rows={6}
                value={state?.intake?.experienceDetails || ""}
                onChange={(value) => updateIntakeField("experienceDetails", value)}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <TextArea
                  label="Education History"
                  placeholder="B.S. Computer Science, University Name, 2024. GPA: 3.8"
                  rows={4}
                  value={state?.intake?.educationDetails || ""}
                  onChange={(value) => updateIntakeField("educationDetails", value)}
                />
                <TextArea
                  label="Additional Project Details"
                  placeholder="Describe any other notable projects or achievements you wish to highlight outside of your GitHub imports."
                  rows={4}
                  value={state?.intake?.featuredProjectsText || ""}
                  onChange={(value) => updateIntakeField("featuredProjectsText", value)}
                />
              </div>

              <motion.div whileHover={{ y: -2 }} className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,#15181c,#0f1215)] p-5 transition-colors hover:border-[#85a7b0]/30">
                <div className="flex items-center gap-3">
                  <WandSparkles className="h-5 w-5 text-[#dfc497]" />
                  <p className="text-lg font-medium text-white">Maximize Your Impact</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-[#c4beb2]">
                  Clear, metric-driven experience details result in a significantly stronger AI-generated document. Provide specific outcomes, tools used, and scale where possible.
                </p>
              </motion.div>
            </SectionShell>
          </div>
        </motion.div>
      </section>
    </main>
  );
}