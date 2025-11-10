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
    <div className={`overflow-x-auto rounded-lg shadow-sm ${className}`}>
      <table className="min-w-full border-collapse bg-white">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`text-left px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-700 ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                className="px-4 py-8 text-center text-sm text-gray-500"
                colSpan={columns.length}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={getRowKey(row, rowIndex)} 
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-gray-100 cursor-pointer"
              >
                {columns.map((col) => {
                  const value = row[col.key];
                  return (
                    <td
                      key={String(col.key)}
                      className={`px-4 py-3 text-gray-700 ${col.className ?? ""}`}
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
