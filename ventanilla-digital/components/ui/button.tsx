"use client";

import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";
    const variants = {
      default: "bg-black text-white hover:bg-zinc-800",
      outline: "border border-zinc-300 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800",
    };
    const classes = `${base} ${variants[variant]}${className ? ` ${className}` : ""}`;
    return <button ref={ref} className={classes} {...props} />;
  }
);

Button.displayName = "Button";

export default Button;