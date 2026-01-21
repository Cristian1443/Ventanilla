import * as React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: DivProps) => {
  const base = "rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50";
  return <div className={className ? `${base} ${className}` : base} {...props} />;
};

export const CardHeader = ({ className, ...props }: DivProps) => {
  const base = "flex flex-col space-y-1.5 p-6";
  return <div className={className ? `${base} ${className}` : base} {...props} />;
};

export const CardTitle = ({ className, ...props }: DivProps) => {
  const base = "text-2xl font-semibold leading-none tracking-tight";
  return <div className={className ? `${base} ${className}` : base} {...props} />;
};

export const CardDescription = ({ className, ...props }: DivProps) => {
  const base = "text-sm text-zinc-600 dark:text-zinc-400";
  return <div className={className ? `${base} ${className}` : base} {...props} />;
};

export const CardContent = ({ className, ...props }: DivProps) => {
  const base = "p-6 pt-0";
  return <div className={className ? `${base} ${className}` : base} {...props} />;
};
