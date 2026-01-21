"use client";

import * as React from "react";

type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
};

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
};

const isSelectItem = (node: React.ReactNode): node is React.ReactElement<SelectItemProps> => {
  return React.isValidElement(node) && node.type === SelectItem;
};

const isSelectValue = (node: React.ReactNode): node is React.ReactElement<{ placeholder?: string }> => {
  return React.isValidElement(node) && node.type === SelectValue;
};

const isSelectContent = (node: React.ReactNode): node is React.ReactElement<{ children?: React.ReactNode }> => {
  return React.isValidElement(node) && node.type === SelectContent;
};

const walkNodes = (node: React.ReactNode, cb: (child: React.ReactNode) => void) => {
  React.Children.forEach(node, (child) => {
    cb(child);
    if (React.isValidElement(child) && child.props?.children) {
      walkNodes(child.props.children, cb);
    }
  });
};

export const Select = ({ value, defaultValue, onValueChange, children }: SelectProps) => {
  let placeholder: string | undefined;
  const items: SelectItemProps[] = [];

  walkNodes(children, (child) => {
    if (isSelectValue(child)) {
      placeholder = child.props.placeholder;
    }
    if (isSelectContent(child)) {
      React.Children.forEach(child.props.children, (contentChild) => {
        if (isSelectItem(contentChild)) {
          items.push(contentChild.props);
        }
      });
    }
  });

  const base =
    "flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100";

  return (
    <select
      className={base}
      value={value}
      defaultValue={value === undefined ? defaultValue ?? (placeholder ? "" : undefined) : undefined}
      onChange={(event) => onValueChange?.(event.target.value)}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.children}
        </option>
      ))}
    </select>
  );
};

export const SelectTrigger = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>;
export const SelectValue = (_props: { placeholder?: string }) => null;
export const SelectContent = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const SelectItem = (_props: SelectItemProps) => null;

