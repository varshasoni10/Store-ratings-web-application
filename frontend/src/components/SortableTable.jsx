export default function SortableTable({ columns, rows, sort, onSort, rowKey = 'id', emptyText = 'No records found' }) {
  const toggle = (key) => {
    const order = sort.sortBy === key && sort.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    onSort({ sortBy: key, sortOrder: order });
  };

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={c.sortable ? 'sortable' : ''}
                onClick={c.sortable ? () => toggle(c.key) : undefined}
              >
                {c.label}
                {c.sortable && (
                  <span className="sort-indicator">
                    {sort.sortBy === c.key ? (sort.sortOrder === 'ASC' ? ' ▲' : ' ▼') : ' ⇅'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row[rowKey]}>
                {columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? '—'}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
