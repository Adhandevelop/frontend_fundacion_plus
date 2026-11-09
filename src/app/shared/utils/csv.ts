/** RFC-style CSV escaping plus spreadsheet formula neutralization for text cells. */
export function createCsv(rows: readonly (readonly string[])[]): string {
  const cell = (value: string) => {
    const safe = /^[\s\uFEFF]*[=+@-]/u.test(value) || /^[\t\r\n]/u.test(value) ? `'${value}` : value;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n');
}
