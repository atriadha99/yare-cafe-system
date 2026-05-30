import React, { HTMLAttributes } from "react";

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  headers: string[];
}

export const Table: React.FC<TableProps> = ({ headers, children, className, ...props }) => (
  <div className="overflow-x-auto">
    <table className={`w-full border-collapse ${className}`} {...props}>
      <thead>
        <tr className="bg-gray-100 border-b">
          {headers.map((header, i) => (
            <th
              key={i}
              className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}

export const TableRow: React.FC<TableRowProps> = ({ children, className, ...props }) => (
  <tr className={`border-b hover:bg-gray-50 ${className}`} {...props}>
    {children}
  </tr>
);

export interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {}

export const TableCell: React.FC<TableCellProps> = ({ children, className, ...props }) => (
  <td className={`px-4 py-3 text-sm text-gray-900 ${className}`} {...props}>
    {children}
  </td>
);

export interface TableHeaderCellProps extends HTMLAttributes<HTMLTableCellElement> {}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ children, className, ...props }) => (
  <th className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 ${className}`} {...props}>
    {children}
  </th>
);
