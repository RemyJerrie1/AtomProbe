import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

type StatusTone = "success" | "danger" | "info";

export function StatusBadge({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return <div className={`status-badge status-badge--${tone}`}>{children}</div>;
}

export function ActionButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="action-button" {...props}>
      {children}
    </button>
  );
}

export function Surface({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section className={`surface ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}
