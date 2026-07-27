// filepath: src/components/redesign/PillButton.tsx
"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline";

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  leadingIcon?: ReactNode;
}

export default function PillButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  leadingIcon,
  ...rest
}: PillButtonProps) {
  const sizeMap = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-8 text-base",
  };

  const variantMap: Record<Variant, string> = {
    primary:
      "bg-gradient-to-b from-[#e89263] to-[#d97644] text-[#1a0f08] " +
      "shadow-[0_6px_20px_-6px_rgba(217,118,68,0.7),inset_0_1px_0_rgba(255,220,180,0.45)] " +
      "hover:from-[#ed9d6e] hover:to-[#e0834f] active:translate-y-px",
    ghost:
      "bg-transparent text-[#f3ece1] hover:bg-[#f3ece1]/5 border border-transparent",
    outline:
      "bg-transparent text-[#f3ece1] border border-[#3a2f25] hover:border-[#d97644]/60 " +
      "hover:bg-[#d97644]/5",
  };

  return (
    <button
      {...rest}
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-full font-mono uppercase tracking-[0.18em]",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d97644]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizeMap[size],
        variantMap[variant],
        className,
      ].join(" ")}
    >
      {leadingIcon}
      {children}
    </button>
  );
}
