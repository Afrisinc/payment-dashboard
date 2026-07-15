import { cn } from "@/lib/cn";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className={cn("w-full", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function TableHeader({
  className,
  children,
  ...props
}: TableHeaderProps) {
  return (
    <thead className={cn("bg-bg-muted", className)} {...props}>
      {children}
    </thead>
  );
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export function TableRow({
  className,
  hover = true,
  children,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={cn(
        "border-t border-border",
        hover && "transition-colors hover:bg-bg-muted",
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export function TableHead({ className, children, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-fg-muted",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td className={cn("px-4 py-3 text-sm text-fg", className)} {...props}>
      {children}
    </td>
  );
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <tbody className={cn("", className)} {...props}>
      {children}
    </tbody>
  );
}
