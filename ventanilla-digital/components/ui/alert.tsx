"use client";

import * as React from "react";

type AlertProps = React.HTMLAttributes<HTMLDivElement>;

export const Alert = ({ className, ...props }: AlertProps) => {
  const base = "relative w-full rounded-lg border border-zinc-200 bg-white p-4 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50";
  return <div className={className ? `${base} ${className}` : base} {...props} />;
};

export const AlertDescription = ({ className, ...props }: AlertProps) => {
  const base = "text-sm text-zinc-700 dark:text-zinc-300";
  return <div className={className ? `${base} ${className}` : base} {...props} />;
};
