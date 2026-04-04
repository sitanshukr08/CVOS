"use client";

import { ArrowUp, Square } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={1}
      className={cn(
        "flex w-full resize-none rounded-md border-none bg-transparent px-3 py-2.5 text-base text-[#f3ede2] placeholder:text-[#8f887c] focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

interface PromptInputContextType {
  isLoading: boolean;
  value: string;
  setValue: (value: string) => void;
  maxHeight: number | string;
  onSubmit?: () => void;
  disabled?: boolean;
}

const PromptInputContext = React.createContext<PromptInputContextType | null>(null);

function usePromptInput() {
  const context = React.useContext(PromptInputContext);
  if (!context) {
    throw new Error("usePromptInput must be used within a PromptInput");
  }
  return context;
}

const PromptInput = React.forwardRef<
  HTMLDivElement,
  {
    isLoading?: boolean;
    value?: string;
    onValueChange?: (value: string) => void;
    maxHeight?: number | string;
    onSubmit?: () => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onDragOver?: (event: React.DragEvent) => void;
    onDragLeave?: (event: React.DragEvent) => void;
    onDrop?: (event: React.DragEvent) => void;
  }
>(
  (
    {
      className,
      isLoading = false,
      maxHeight = 240,
      value,
      onValueChange,
      onSubmit,
      children,
      disabled = false,
      onDragOver,
      onDragLeave,
      onDrop
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value || "");

    const handleChange = (newValue: string) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };

    return (
      <PromptInputContext.Provider
        value={{
          isLoading,
          value: value ?? internalValue,
          setValue: onValueChange ?? handleChange,
          maxHeight,
          onSubmit,
          disabled
        }}
      >
        <div
          ref={ref}
          className={cn(
            "rounded-[1.75rem] border border-white/10 bg-[#14181c] p-2 shadow-[0_18px_48px_rgba(0,0,0,0.24)] transition-all duration-300",
            isLoading && "border-[#dfc497]/50",
            className
          )}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {children}
        </div>
      </PromptInputContext.Provider>
    );
  }
);
PromptInput.displayName = "PromptInput";

function PromptInputTextarea({
  className,
  onKeyDown,
  disableAutosize = false,
  placeholder,
  ...props
}: {
  disableAutosize?: boolean;
  placeholder?: string;
} & React.ComponentProps<typeof Textarea>) {
  const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (disableAutosize || !textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      typeof maxHeight === "number"
        ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
        : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
  }, [disableAutosize, maxHeight, value]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit?.();
    }
    onKeyDown?.(event);
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={handleKeyDown}
      className={cn("text-base", className)}
      disabled={disabled}
      placeholder={placeholder}
      {...props}
    />
  );
}

function PromptInputActions({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export const PromptInputBox = React.forwardRef<
  HTMLDivElement,
  {
    onSend?: (message: string, files?: File[]) => void;
    isLoading?: boolean;
    placeholder?: string;
    className?: string;
  }
>(({ onSend = () => {}, isLoading = false, placeholder = "Ask the assistant how to improve a weak bullet...", className }, ref) => {
  const [input, setInput] = React.useState("");

  const handleSubmit = () => {
    if (!input.trim()) {
      return;
    }

    onSend(input.trim(), []);
    setInput("");
  };
  const hasContent = input.trim() !== "";

  return (
    <PromptInput
      ref={ref}
      value={input}
      onValueChange={setInput}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      className={className}
      disabled={isLoading}
    >
      <PromptInputTextarea placeholder={placeholder} />

      <PromptInputActions className="justify-end gap-2 p-0 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          className={cn(
            "flex h-9 min-w-9 items-center justify-center rounded-full px-3 transition-all duration-200",
            hasContent
              ? "bg-[#dfc497] text-[#111418] hover:bg-[#e7d0a8]"
              : "bg-white/[0.04] text-[#9ca3af]"
          )}
          disabled={isLoading || !hasContent}
        >
          {isLoading ? (
            <Square className="h-4 w-4 fill-[#111418] animate-pulse" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </button>
      </PromptInputActions>
    </PromptInput>
  );
});

PromptInputBox.displayName = "PromptInputBox";
