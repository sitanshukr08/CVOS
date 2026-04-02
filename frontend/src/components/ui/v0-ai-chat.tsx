"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpIcon,
  CircleUserRound,
  GitBranch,
  MessageSquareMore,
  Paperclip,
  PlusIcon,
  Sparkles,
  Target
} from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;

      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [maxHeight, minHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

const messages = [
  {
    role: "assistant",
    label: "CVOS Assistant",
    text:
      "I have your baseline profile. Before we generate anything, tell me which project best proves you can ship real work."
  },
  {
    role: "user",
    label: "You",
    text:
      "My strongest project is an analytics dashboard, but I need help making the impact clearer and more technical."
  },
  {
    role: "assistant",
    label: "CVOS Assistant",
    text:
      "Good. I would push on three gaps: scale, tools, and measurable outcome. Start with who used it, what stack you built it with, and what changed because of it."
  }
] as const;

const quickActions = [
  { icon: <Target className="h-4 w-4" />, label: "Add metrics" },
  { icon: <GitBranch className="h-4 w-4" />, label: "Use GitHub evidence" },
  { icon: <Sparkles className="h-4 w-4" />, label: "Rewrite weak bullet" },
  { icon: <CircleUserRound className="h-4 w-4" />, label: "Fix profile summary" }
];

export function VercelV0Chat() {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 220
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (value.trim()) {
        setValue("");
        adjustHeight(true);
      }
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#15191d,#0e1114)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6">
        <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#85a7b0]">Conversation</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Strengthen the facts before review</h2>
          </div>
          <div className="rounded-full border border-[#85a7b0]/20 bg-[#85a7b0]/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#dfc497]">
            Session Draft
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {messages.map((message) => {
            const isAssistant = message.role === "assistant";

            return (
              <div
                key={`${message.role}-${message.text.slice(0, 12)}`}
                className={cn("flex", isAssistant ? "justify-start" : "justify-end")}
              >
                <div
                  className={cn(
                    "max-w-[42rem] rounded-[1.5rem] border px-4 py-4 sm:px-5",
                    isAssistant
                      ? "border-white/10 bg-white/[0.04]"
                      : "border-[#dfc497]/20 bg-[#dfc497]/10"
                  )}
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#85a7b0]">
                    {isAssistant ? (
                      <MessageSquareMore className="h-4 w-4 text-[#dfc497]" />
                    ) : (
                      <CircleUserRound className="h-4 w-4 text-[#dfc497]" />
                    )}
                    {message.label}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#e7e1d5] sm:text-[15px]">
                    {message.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#14181c,#0d1013)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="overflow-y-auto">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask the assistant to strengthen a bullet, extract better evidence, or clarify a project."
            className={cn(
              "min-h-[60px] w-full resize-none border-none bg-transparent px-4 py-3 text-sm text-white shadow-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0"
            )}
            style={{ overflow: "hidden" }}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-white/8 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="group flex items-center gap-1 rounded-lg p-2 transition-colors hover:bg-white/[0.05]"
            >
              <Paperclip className="h-4 w-4 text-white" />
              <span className="hidden text-xs text-[#b7b1a4] group-hover:inline">Attach notes</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg border border-dashed border-white/10 px-3 py-2 text-sm text-[#b7b1a4] transition-colors hover:border-[#85a7b0]/30 hover:bg-white/[0.04]"
            >
              <PlusIcon className="h-4 w-4" />
              Focus area
            </button>
            <button
              type="button"
              className={cn(
                "flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors",
                value.trim()
                  ? "border-[#dfc497] bg-[#dfc497] text-[#101216]"
                  : "border-white/10 text-[#8a8479] hover:bg-white/[0.04]"
              )}
            >
              <ArrowUpIcon className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {quickActions.map((action) => (
          <ActionButton key={action.label} icon={action.icon} label={action.label} />
        ))}
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[#c9c3b7] transition-colors hover:border-[#85a7b0]/30 hover:bg-[#85a7b0]/8 hover:text-white"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}
