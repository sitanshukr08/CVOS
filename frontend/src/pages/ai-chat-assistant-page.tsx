import { motion } from "framer-motion";
import { Bot, CheckCircle2, MessageSquareText, Info } from "lucide-react";

import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { useResumeFlow } from "@/lib/resume-flow";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";

const assistantJobs = [
  "Ask follow-up questions when facts are vague or incomplete.",
  "Push the user toward metrics, tools, scale, and outcomes.",
  "Prepare cleaner evidence before review and scoring."
] as const;

const promptIdeas = [
  "Make this bullet more specific without inventing numbers.",
  "Use GitHub evidence to strengthen this project.",
  "What metrics should I add to this internship entry?",
  "Rewrite this profile summary to sound more technical."
] as const;

const guidance = [
  "Bring exact tools, frameworks, and platforms into the reply.",
  "Prefer measurable outcomes over generic responsibility statements.",
  "Use GitHub context only when it actually improves credibility."
] as const;

function ChatBubble({
  role,
  body
}: {
  role: "assistant" | "user";
  body: string;
}) {
  const isAssistant = role === "assistant";
  const safeBodyText = typeof body === "string" ? body : JSON.stringify(body);

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
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
    </div>
  );
}

function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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
          <span className="text-[13px] text-[#85a7b0]/80 animate-pulse">Thinking & evaluating data...</span>
        </div>
      </div>
    </motion.div>
  );
}

export function AIChatAssistantPage() {
  const { state, sendAssistantMessage } = useResumeFlow();
  const hasMessages = state.assistantMessages.length > 0;

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
                {assistantJobs.map((job) => (
                  <div
                    key={job}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-[#d8d2c6]"
                  >
                    {job}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6">
              <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Prompt ideas</p>
              <div className="mt-5 space-y-3">
                {promptIdeas.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendAssistantMessage(prompt)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left text-sm leading-7 text-[#d8d2c6] transition-colors duration-300 hover:bg-white/[0.06]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] p-6">
              <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Guidance</p>
              <div className="mt-5 space-y-3">
                {guidance.map((rule) => (
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
              className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0d1013)] shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
            >
              <div className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-[#85a7b0]">Live conversation</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">CVOS Assistant</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#85a7b0]/18 bg-[#85a7b0]/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#dfc497]">
                  Session draft
                </div>
              </div>

              <div className="px-5 py-6 sm:px-6">
                {!hasMessages ? (
                  <div className="flex min-h-[24rem] items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
                    <div className="max-w-xl">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10">
                        <MessageSquareText className="h-5 w-5 text-[#dfc497]" />
                      </div>
                      <p className="mt-5 text-lg font-medium text-white">
                        Start the conversation when the draft needs stronger evidence.
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#c4beb2]">
                        Use the prompt box to push on vague bullets, missing metrics, or weak
                        project framing. Once messages are sent, the transcript will replace this
                        empty state.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {state.assistantMessages.map((message) => (
                      <ChatBubble key={message.id} role={message.role} body={message.body} />
                    ))}
                    
                    {/* Render the animated typing indicator when processing */}
                    {state.isProcessingChat && <TypingIndicator />}
                  </div>
                )}
              </div>

              <div className="border-t border-white/8 px-5 py-5 sm:px-6">
                <PromptInputBox
                  placeholder="Ask the assistant to improve a bullet, pull stronger evidence, or use GitHub context."
                  onSend={(message) => sendAssistantMessage(message)}
                />
                
                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[#85a7b0]/70">
                  <Info className="h-3 w-3" />
                  <p>
                    Tip: Type <strong className="text-[#dfc497]">clear</strong> in the chat to completely wipe the AI's memory and start fresh.
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