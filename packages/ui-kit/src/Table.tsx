interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
}

export const Table = <T,>({
  columns,
  data,
  emptyMessage = 'No data found',
}: TableProps<T>) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={`px-4 py-3 font-medium text-gray-600 ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {columns.map((col, j) => (
                  <td key={j} className={`px-4 py-3 text-gray-700 ${col.className ?? ''}`}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : String(row[col.accessor] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}