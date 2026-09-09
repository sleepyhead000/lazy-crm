import { forwardRef, type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
      success: "bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success)]",
      warning: "bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning)]",
      danger: "bg-[var(--color-danger-light)] text-[var(--color-danger)] border-[var(--color-danger)]",
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
