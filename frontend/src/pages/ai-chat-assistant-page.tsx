import { motion, AnimatePresence } from "framer-motion";
import { Bot, CheckCircle2, MessageSquareText, Info } from "lucide-react";

import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { useResumeFlow } from "@/lib/resume-flow";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";

const assistantJobs = [
  "Help clarify vague or missing experience details.",
  "Extract measurable metrics and outcomes from your background.",
  "Refine technical evidence before generating the final draft."
] as const;

const promptIdeas = [
  "Make my recent experience bullet more specific.",
  "Use my GitHub profile to strengthen my project section.",
  "What metrics should I add to my engineering role?",
  "Rewrite my professional summary to sound more technical."
] as const;

const guidance = [
  "Mention specific tools, frameworks, and platforms.",
  "Focus on measurable outcomes rather than generic responsibilities.",
  "Leverage GitHub data to establish technical depth."
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  }
};

function ChatBubble({
  role,
  body
}: {
  role: "assistant" | "user";
  body: string;
}) {
  const isAssistant = role === "assistant";
  const safeBodyText = typeof body === "string" ? body : JSON.stringify(body || "");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: isAssistant ? "top left" : "top right" }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[46rem] rounded-[1.75rem] border px-5 py-4 ${
          isAssistant
            ? "border-white/10 bg-white/[0.04]"
            : "border-[#dfc497]/18 bg-[#dfc497]/10"
        }`}
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-[#85a7b0]">
          {isAssistant ? (
            <Bot className="h-4 w-4 text-[#dfc497]" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-[#dfc497]" />
          )}
          {isAssistant ? "CVOS Assistant" : "You"}
        </div>
        <p className="mt-3 text-[15px] leading-8 text-[#ece5d8] whitespace-pre-wrap">{safeBodyText}</p>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95, transformOrigin: "top left" }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className="flex justify-start"
    >
      <div className="max-w-[46rem] rounded-[1.75rem] border border-white/10 bg-white/[0.04] px-5 py-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-[#85a7b0]">
          <Bot className="h-4 w-4 text-[#dfc497]" />
          CVOS Assistant
        </div>
        <div className="mt-3 flex h-8 items-center gap-3">
          <div className="flex gap-1.5">
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} className="h-2 w-2 rounded-full bg-[#dfc497]"></motion.span>
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="h-2 w-2 rounded-full bg-[#dfc497]"></motion.span>
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="h-2 w-2 rounded-full bg-[#dfc497]"></motion.span>
          </div>
          <span className="text-[13px] text-[#85a7b0]/80 animate-pulse">Analyzing data...</span>
        </div>
      </div>
    </motion.div>
  );
}

export function AIChatAssistantPage() {
  const { state, sendAssistantMessage } = useResumeFlow();
  const hasMessages = (state?.assistantMessages?.length || 0) > 0;

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
              <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Capabilities</p>
              <div className="mt-5 space-y-3">
                {assistantJobs.map((job) => (
                  <motion.div
                    key={job}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-[#d8d2c6] transition-colors hover:bg-white/[0.08]"
                  >
                    {job}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 transition-all hover:border-white/20">
              <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Prompt Ideas</p>
              <div className="mt-5 space-y-3">
                {promptIdeas.map((prompt) => (
                  <motion.button
                    key={prompt}
                    whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => sendAssistantMessage(prompt)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left text-sm leading-7 text-[#d8d2c6] transition-colors duration-300"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6 transition-all hover:border-white/20">
              <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Best Practices</p>
              <div className="mt-5 space-y-3">
                {guidance.map((rule) => (
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
              className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition-all hover:shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-4 sm:px-6 bg-[#0d1013]/80 backdrop-blur-md z-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">AI Optimization</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">CVOS Assistant</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#85a7b0]/18 bg-[#85a7b0]/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#dfc497]">
                  Active Session
                </div>
              </div>

              <div className="px-5 py-6 sm:px-6">
                {!hasMessages ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.5 }}
                    className="flex min-h-[24rem] items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center"
                  >
                    <div className="max-w-xl">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10">
                        <MessageSquareText className="h-5 w-5 text-[#dfc497]" />
                      </div>
                      <p className="mt-5 text-lg font-medium text-white">
                        Start the optimization process.
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#c4beb2]">
                        Ask the AI to rewrite bullets, expand on technical details, or tailor your profile to a specific role. Your conversation transcript will appear here.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {(state?.assistantMessages || []).map((message) => (
                        <ChatBubble key={message.id} role={message.role} body={message.body} />
                      ))}
                      
                      {state?.isProcessingChat && <TypingIndicator key="typing-indicator" />}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <div className="border-t border-white/8 px-5 py-5 sm:px-6 bg-[#0d1013]/80 backdrop-blur-md z-10">
                <PromptInputBox
                  placeholder="Ask the assistant to rewrite a bullet, highlight specific skills, or analyze your GitHub."
                  onSend={(message) => sendAssistantMessage(message)}
                />
                
                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[#85a7b0]/70">
                  <Info className="h-3 w-3" />
                  <p>
                    Tip: Type <strong className="text-[#dfc497]">clear</strong> to reset the conversation context and memory.
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