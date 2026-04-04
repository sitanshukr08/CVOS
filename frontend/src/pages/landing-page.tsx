import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Download,
  FilePenLine,
  FileText,
  MessageSquareText,
  MoveDown,
  Sparkles
} from "lucide-react";

import DemoOne from "@/components/ui/demo";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";

const sections = [
  {
    id: "intake",
    index: "01",
    label: "Resume Intake",
    route: "/resume-intake",
    icon: FileText,
    accent: "from-[#dfc497]/14 via-[#85a7b0]/6 to-transparent",
    line: "bg-[#dfc497]/70",
    title: "Start with structured intake and pull GitHub evidence while the user is already entering details.",
    description:
      "The first page now owns profile basics, role direction, education, experience, skills, and the GitHub project selection that informs the rest of the workflow.",
    bullets: ["Profile and experience capture", "GitHub evidence inside intake", "Cleaner draft before AI refinement"]
  },
  {
    id: "assistant",
    index: "02",
    label: "AI Assistant",
    route: "/assistant",
    icon: MessageSquareText,
    accent: "from-[#85a7b0]/14 via-[#647f87]/6 to-transparent",
    line: "bg-[#85a7b0]/72",
    title: "Use AI as a sharp recruiter, not a generic chatbot.",
    description:
      "The assistant asks for missing metrics, challenges vague claims, and helps the user improve raw experience before the document moves into review.",
    bullets: ["State-aware follow-up prompts", "Coaching for stronger bullet quality", "Plain chat input that matches the backend"]
  },
  {
    id: "review",
    index: "03",
    label: "Resume Review",
    route: "/resume-review",
    icon: FilePenLine,
    accent: "from-[#dfc497]/12 via-[#9eb3b8]/6 to-transparent",
    line: "bg-[#dfc497]/72",
    title: "Review, revise, and approve the draft before export.",
    description:
      "This is the control layer. Users need to edit sections confidently, compare revisions, and refine without breaking the whole flow.",
    bullets: ["Inline section editing", "Project choices carried forward", "Generate from the reviewed draft"]
  },
  {
    id: "download",
    index: "04",
    label: "Final Output",
    route: "/download",
    icon: Download,
    accent: "from-[#dfc497]/12 via-[#85a7b0]/6 to-transparent",
    line: "bg-white/72",
    title: "Finish on one output page that handles loading, quality inspection, and download.",
    description:
      "The final page now absorbs the old generation and score steps. It shows real generation progress first, then unlocks download and quality inspection when the PDF is ready.",
    bullets: ["Live generation state", "Quality score on demand", "Download turns on when ready"]
  }
] as const;

function StatCard({
  icon: Icon,
  value,
  label
}: {
  icon: typeof Bot;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,#15181c,#0f1215)] p-5">
      <Icon className="h-6 w-6 text-[#85a7b0]" />
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="text-sm text-[#b7b1a4]">{label}</p>
    </div>
  );
}

function SectionCard({
  id,
  index,
  label,
  route,
  title,
  description,
  bullets,
  accent,
  line,
  icon: Icon
}: (typeof sections)[number]) {
  return (
    <motion.article
      id={id}
      initial={{ opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.25 }}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,#15181c,#0d0f12)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="absolute left-0 top-0 h-full w-px bg-white/8" />
      <div className={`absolute left-0 top-0 h-32 w-px ${line}`} />

      <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-4 py-2 text-sm text-[#e6e0d4]">
            <span className="font-mono text-xs tracking-[0.28em] text-[#85a7b0]">{index}</span>
            <span className="text-white/25">/</span>
            <Icon className="h-4 w-4 text-[#dfc497]" />
            <span>{label}</span>
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#85a7b0]/72">{route}</p>
            <h3 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
              {title}
            </h3>
            <p className="max-w-2xl text-base leading-8 text-[#c4beb2]">{description}</p>
          </div>
        </div>

        <div className="space-y-4 rounded-[1.8rem] border border-white/10 bg-black/18 p-4">
          {bullets.map((bullet) => (
            <div
              key={bullet}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-[#dad4c8]"
            >
              {bullet}
            </div>
          ))}

          <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-[#85a7b0]">User sees</p>
            <p className="mt-3 text-lg font-medium text-white">
              A focused page for {label.toLowerCase()} with clear actions and no hidden states.
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function LandingPage() {
  return (
    <main className="overflow-hidden bg-[#07090c] text-white">
      <Navbar1 />
      <section id="top">
        <DemoOne />
      </section>

      <section id="overview" className="relative mx-auto max-w-7xl px-6 pb-16 pt-12 lg:px-8">
        <div className="absolute inset-x-6 top-0 h-40 rounded-full bg-[#dfc497]/8 blur-3xl lg:inset-x-20" />

        <div className="relative grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,#16191d,#0f1215)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-4 py-2 text-sm text-[#e6e0d4]">
              <Sparkles className="h-4 w-4 text-[#dfc497]" />
              What this website is about
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
              CVOS is a guided resume system that moves from raw career data to a scored, reviewed,
              downloadable final document.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#c4beb2] sm:text-lg">
              The current flow is tighter now. Users enter structured data, bring GitHub evidence
              into intake, refine through AI chat, review the draft, and end on one final output
              page that handles generation, quality, and download.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
            className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1"
          >
            <StatCard icon={Bot} value="4" label="core product steps" />
            <StatCard icon={Download} value="1" label="final output surface" />
            <StatCard icon={MoveDown} value="0" label="extra dead-end pages in the main flow" />
          </motion.div>
        </div>
      </section>

      <section id="flow" className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#16191d,#0f1215)] p-6">
              <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Product Flow</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-white">
                Scroll through the current product journey.
              </h2>
              <p className="mt-5 text-sm leading-7 text-[#b7b1a4]">
                Each section below represents one actual step in the current frontend flow, from
                intake to the final output page.
              </p>
              <div className="mt-8 space-y-3">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[#d9d4ca] transition hover:border-[#85a7b0]/30 hover:bg-[#85a7b0]/8"
                  >
                    <span>{section.label}</span>
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {sections.map((section) => (
              <SectionCard key={section.id} {...section} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
