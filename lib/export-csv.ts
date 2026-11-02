/**
 * Export an array of flat records as a downloadable CSV file (Excel-compatible).
 * Mirrors the StockMind demo "Export" behaviour on the Inventory page.
 */
export function exportToCSV(
  rows: Record<string, string | number | null | undefined>[],
  filename: string,
): void {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);

  const escapeCell = (value: string | number | null | undefined): string => {
    const s = value === null || value === undefined ? "" : String(value);
    // Escape quotes / commas / newlines so Excel parses the cell correctly
    if (/[",\n\r]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const csvLines = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(",")),
  ];

  // BOM prefix so Excel detects UTF-8
  const blob = new Blob(["\uFEFF" + csvLines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
