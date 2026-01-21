import * as React from "react";

type TableProps = React.TableHTMLAttributes<HTMLTableElement>;
type TableSectionProps = React.HTMLAttributes<HTMLTableSectionElement>;
type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;
type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;
type TableHeadCellProps = React.ThHTMLAttributes<HTMLTableCellElement>;

export const Table = ({ className, ...props }: TableProps) => (
  <div className="w-full overflow-auto">
    <table
      className={`w-full caption-bottom text-sm${className ? ` ${className}` : ""}`}
      {...props}
    />
  </div>
);

export const TableHeader = ({ className, ...props }: TableSectionProps) => (
  <thead className={className ? className : ""} {...props} />
);

export const TableBody = ({ className, ...props }: TableSectionProps) => (
  <tbody className={className ? className : ""} {...props} />
);

export const TableRow = ({ className, ...props }: TableRowProps) => (
  <tr
    className={`border-b border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50${
      className ? ` ${className}` : ""
    }`}
    {...props}
  />
);

export const TableHead = ({ className, ...props }: TableHeadCellProps) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-zinc-600 dark:text-zinc-300${
      className ? ` ${className}` : ""
    }`}
    {...props}
  />
);

export const TableCell = ({ className, ...props }: TableCellProps) => (
  <td
    className={`p-4 align-middle text-zinc-900 dark:text-zinc-100${className ? ` ${className}` : ""}`}
    {...props}
  />
);
