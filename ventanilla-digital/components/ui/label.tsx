"use client";

import * as React from "react";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = ({ className, ...props }: LabelProps) => {
  const base = "text-sm font-medium text-zinc-900 dark:text-zinc-100";
  return <label className={className ? `${base} ${className}` : base} {...props} />;
};

export default Label;
