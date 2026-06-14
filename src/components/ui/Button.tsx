import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "ai" | "warning";

const variants: Record<ButtonVariant, string> = {
  primary: "clay-primary-button hover:shadow-[12px_16px_32px_rgba(201,126,83,0.28),-8px_-8px_18px_rgba(255,255,255,0.82),inset_5px_5px_12px_rgba(175,102,61,0.1),inset_-6px_-6px_14px_rgba(255,244,227,0.86)] active:shadow-[inset_7px_7px_16px_rgba(175,102,61,0.2),inset_-6px_-6px_14px_rgba(255,244,227,0.72)]",
  ai: "clay-secondary-button clay-agent-button hover:text-[#263d71] active:shadow-[inset_7px_7px_16px_rgba(117,128,177,0.18),inset_-6px_-6px_14px_rgba(255,255,255,0.72)]",
  secondary: "clay-secondary-button hover:text-emerald-700 active:shadow-[inset_7px_7px_16px_rgba(126,143,140,0.16),inset_-6px_-6px_14px_rgba(255,255,255,0.76)]",
  ghost: "clay-ghost-button hover:text-emerald-700 active:shadow-[inset_7px_7px_16px_rgba(126,143,140,0.16),inset_-6px_-6px_14px_rgba(255,255,255,0.76)]",
  warning: "clay-secondary-button bg-[#fff1df] text-orange-800 hover:text-orange-900 active:shadow-[inset_7px_7px_16px_rgba(194,134,74,0.16),inset_-6px_-6px_14px_rgba(255,255,255,0.76)]",
  danger: "clay-secondary-button bg-[#ffe7e4] text-red-700 hover:text-red-800 active:shadow-[inset_7px_7px_16px_rgba(194,86,74,0.16),inset_-6px_-6px_14px_rgba(255,255,255,0.76)]"
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export function Button({ children, variant = "primary", icon, className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold leading-none transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfbf6] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60",
        "max-w-full text-center break-words",
        variants[variant],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
