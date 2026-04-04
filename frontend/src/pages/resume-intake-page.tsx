import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  CheckCircle2,
  FolderGit2,
  GraduationCap,
  GitBranch,
  Link2,
  type LucideIcon,
  Mail,
  ShieldCheck,
  UserRound,
  WandSparkles
} from "lucide-react";
import { useResumeFlow } from "@/lib/resume-flow";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";

const checklist = [
  "Add the role you are targeting so the language stays relevant.",
  "Use exact tools and frameworks instead of generic phrases like backend or software.",
  "Include dates and measurable outcomes wherever you can.",
  "Paste only links you actually want reflected in the final document."
];

const formSections = [
  {
    id: "profile",
    eyebrow: "Section 01",
    title: "Profile basics",
    description:
      "Start with the identity layer. These fields anchor the rest of the document and define how the final resume should be addressed.",
    icon: UserRound
  },
  {
    id: "links",
    eyebrow: "Section 02",
    title: "Links, direction, and GitHub evidence",
    description:
      "Tell CVOS what kind of role this resume is for, connect external context, and import the GitHub work that should influence later writing.",
    icon: Link2
  },
  {
    id: "experience",
    eyebrow: "Section 03",
    title: "Experience and evidence",
    description:
      "This is where quality is won or lost. The better the facts here, the stronger the generated bullets and the score later in the flow.",
    icon: BriefcaseBusiness
  }
] as const;

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
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[#ddd6c8]">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white placeholder:text-white/28 outline-none transition focus:border-[#85a7b0]/40 focus:bg-white/[0.05]"
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
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[#ddd6c8]">{label}</span>
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white placeholder:text-white/28 outline-none transition focus:border-[#85a7b0]/40 focus:bg-white/[0.05]"
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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.22 }}
      transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15181c,#0e1114)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8"
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
  const selectedProjects = state.githubImport.projects.filter((project) => project.selected);

  return (
    <main id="top" className="overflow-hidden bg-[#07090c] text-white">
      <Navbar1 />
      <section id="intake-form" className="mx-auto max-w-7xl px-6 pb-24 pt-10 lg:px-8 lg:pt-12">
        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div id="quality-notes" className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#16191d,#0f1215)] p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-4 py-2 text-sm text-[#e7e1d5]">
                <ShieldCheck className="h-4 w-4 text-[#dfc497]" />
                Intake guidance
              </div>
              <div className="mt-5 space-y-3">
                {checklist.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-[#d8d2c6]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <SectionShell {...formSections[0]}>
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Full name"
                  placeholder="Aarav Sharma"
                  value={state.intake.name}
                  onChange={(value) => updateIntakeField("name", value)}
                />
                <Field
                  label="Email address"
                  placeholder="aarav@example.com"
                  type="email"
                  value={state.intake.email}
                  onChange={(value) => updateIntakeField("email", value)}
                />
                <Field
                  label="Phone number"
                  placeholder="+91 98765 43210"
                  value={state.intake.phone}
                  onChange={(value) => updateIntakeField("phone", value)}
                />
                <Field
                  label="Current location"
                  placeholder="Bengaluru, India"
                  value={state.intake.location}
                  onChange={(value) => updateIntakeField("location", value)}
                />
              </div>

              <TextArea
                label="Target headline"
                placeholder="Backend engineer with internship and open-source experience, targeting early-career product roles."
                rows={4}
                value={state.intake.headline}
                onChange={(value) => updateIntakeField("headline", value)}
              />
            </SectionShell>

            <SectionShell {...formSections[1]}>
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <Field
                  label="GitHub username"
                  placeholder="aarav-dev"
                  value={state.intake.githubUsername}
                  onChange={(value) => updateIntakeField("githubUsername", value)}
                />
                <button
                  type="button"
                  onClick={importProjects}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#dfc497] px-5 py-3.5 font-semibold text-[#101216] transition-colors duration-300 hover:bg-[#e6cfaa] md:mb-[1px]"
                >
                  <FolderGit2 className="h-4 w-4" />
                  Import projects
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="LinkedIn URL"
                  placeholder="https://linkedin.com/in/aarav"
                  value={state.intake.linkedin}
                  onChange={(value) => updateIntakeField("linkedin", value)}
                />
                <Field
                  label="Target role"
                  placeholder="Software Engineer"
                  value={state.intake.targetRole}
                  onChange={(value) => updateIntakeField("targetRole", value)}
                />
                <Field
                  label="Primary domain"
                  placeholder="Backend, Product, ML, Finance"
                  value={state.intake.primaryDomain}
                  onChange={(value) => updateIntakeField("primaryDomain", value)}
                />
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,#15181c,#0f1215)] p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[#d9d3c8]">
                    <FolderGit2 className="h-4 w-4 text-[#dfc497]" />
                    GitHub evidence
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[#d8d2c6]">
                    Source:{" "}
                    <span className="text-white">
                      {state.githubImport.lastImportedUsername || state.intake.githubUsername || "not imported"}
                    </span>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[#d8d2c6]">
                    Selected: <span className="text-white">{selectedProjects.length}</span>
                  </div>
                </div>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-[#c4beb2]">
                  Pull candidate projects during intake so the rest of the flow works from a cleaner
                  evidence set. Keep only repos that improve credibility for the target role.
                </p>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-[#d8d2c6]">
                  {state.githubImport.projects.length > 0 ? (
                    <>
                      Review the imported candidates below and keep only the projects that should
                      survive into review and scoring.
                    </>
                  ) : (
                    "Imported candidates will appear here after you bring GitHub evidence into the intake draft."
                  )}
                </div>

                {state.githubImport.projects.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {state.githubImport.projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="inline-flex items-center gap-2 text-sm font-medium text-white">
                            <GitBranch className="h-4 w-4 text-[#dfc497]" />
                            {project.name}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-[#bdb6aa]">
                            Promote this only if it clearly strengthens the final resume.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleProjectSelection(project.id)}
                          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-300 ${
                            project.selected
                              ? "bg-[#dfc497] text-[#101216] hover:bg-[#e6cfaa]"
                              : "border border-white/10 bg-white/[0.04] text-[#e6e0d4] hover:bg-white/[0.08]"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {project.selected ? "Selected" : "Keep project"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <TextArea
                label="Skills snapshot"
                placeholder="Python, FastAPI, PostgreSQL, Docker, REST APIs, React, Git"
                rows={4}
                value={state.intake.skillsSnapshot}
                onChange={(value) => updateIntakeField("skillsSnapshot", value)}
              />
            </SectionShell>

            <SectionShell {...formSections[2]}>
              <TextArea
                label="Most relevant experience"
                placeholder="Describe your strongest internship, freelance project, or campus role. Include scope, tools, and outcomes."
                rows={6}
                value={state.intake.experienceDetails}
                onChange={(value) => updateIntakeField("experienceDetails", value)}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <TextArea
                  label="Education"
                  placeholder="B.Tech in Computer Science, 2025, GPA 8.7"
                  rows={4}
                  value={state.intake.educationDetails}
                  onChange={(value) => updateIntakeField("educationDetails", value)}
                />
                <TextArea
                  label="Projects worth featuring"
                  placeholder="List the projects that should appear on the final resume and why they matter. These names also seed GitHub import candidates."
                  rows={4}
                  value={state.intake.featuredProjectsText}
                  onChange={(value) => updateIntakeField("featuredProjectsText", value)}
                />
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,#15181c,#0f1215)] p-5">
                <div className="flex items-center gap-3">
                  <WandSparkles className="h-5 w-5 text-[#dfc497]" />
                  <p className="text-lg font-medium text-white">Why this section matters</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-[#c4beb2]">
                  The evaluator can only protect quality when the facts are present here. If the
                  experience is vague, the generated resume will either be weak or get penalized.
                </p>
              </div>
            </SectionShell>
          </div>
        </div>
      </section>
    </main>
  );
}
