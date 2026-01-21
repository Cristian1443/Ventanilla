import * as React from "react";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "info";
};

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border";
  const variants = {
    default: "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700",
    success: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800",
    warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800",
    info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800",
  };

  return (
    <span
      className={`${base} ${variants[variant]}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
};
