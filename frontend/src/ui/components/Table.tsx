// src/ui/components/Table.tsx
import React from "react";

export type Column<T> = {
  key: keyof T;
  header: string;
  className?: string;
  render?: (value: T[keyof T], row: T, rowIndex: number) => React.ReactNode;
};

export type TableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  data: T[];
  getRowKey?: (row: T, index: number) => React.Key;
  emptyText?: string;
  className?: string;
};

function Table<T extends Record<string, unknown>>({
  columns,
  data,
  getRowKey = (_row, i) => i,
  emptyText = "No data",
  className = "",
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-2xl shadow-soft border border-slate-200/50 scrollbar-modern ${className}`}>
      <table className="min-w-full border-collapse bg-white/80 backdrop-blur-sm">
        <thead>
          <tr className="bg-gradient-to-r from-slate-50 via-primary-50/30 to-accent-50/20 border-b-2 border-slate-200">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`text-left px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-700 ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td
                className="px-6 py-12 text-center text-sm text-slate-500 font-medium"
                colSpan={columns.length}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={getRowKey(row, rowIndex)} 
                className="hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-accent-50/30 transition-all duration-200 cursor-pointer group animate-fade-in"
              >
                {columns.map((col) => {
                  const value = row[col.key];
                  return (
                    <td
                      key={String(col.key)}
                      className={`px-6 py-4 text-slate-700 group-hover:text-slate-900 transition-colors ${col.className ?? ""}`}
                    >
                      {col.render ? col.render(value, row, rowIndex) : (value as React.ReactNode)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export { Table };        // <-- named export for `import { Table } from '...';`
export default Table;    // <-- default export for `import Table from '...';`
