"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowDownToLine } from "lucide-react";

import { cn } from "@/lib/utils";

interface DownloadHoverButtonProps {
  href?: string;
  fileName?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export default function DownloadHoverButton({
  href = "#",
  fileName,
  disabled = false,
  className,
  label = "Download PDF"
}: DownloadHoverButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const baseClasses = cn(
    "relative inline-flex overflow-hidden",
    disabled ? "cursor-not-allowed" : "cursor-pointer",
    className
  );

  const shell = (
    <motion.div
      initial={false}
      animate={{
        width: isHovered && !disabled ? 228 : 64,
        backgroundColor: disabled ? "rgba(255,255,255,0.06)" : "rgba(52, 211, 153, 0.18)",
        borderColor: disabled ? "rgba(255,255,255,0.1)" : "rgba(52, 211, 153, 0.35)"
      }}
      whileHover={disabled ? undefined : { width: 228 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-16 items-center justify-center border shadow-[0_18px_48px_rgba(0,0,0,0.24)]"
      style={{ borderRadius: 999 }}
    >
      <motion.div
        className="absolute"
        animate={{
          opacity: isHovered && !disabled ? 0 : 1,
          scale: isHovered && !disabled ? 0.82 : 1
        }}
        transition={{ duration: 0.18 }}
      >
        <ArrowDownToLine
          className={cn("h-6 w-6", disabled ? "text-[#8f887c]" : "text-emerald-100")}
        />
      </motion.div>

      <motion.div
        className="flex w-full items-center justify-center"
        initial={false}
        animate={{ opacity: isHovered && !disabled ? 1 : 0 }}
        transition={{ duration: 0.18, delay: isHovered && !disabled ? 0.08 : 0 }}
      >
        <span
          className={cn(
            "whitespace-nowrap text-sm font-semibold tracking-[0.08em]",
            disabled ? "text-[#a49d91]" : "text-emerald-50"
          )}
        >
          {label}
        </span>
      </motion.div>
    </motion.div>
  );

  if (disabled) {
    return (
      <div aria-disabled="true" className={baseClasses}>
        {shell}
      </div>
    );
  }

  return (
    <a href={href} download={fileName} className={baseClasses}>
      {shell}
    </a>
  );
}
