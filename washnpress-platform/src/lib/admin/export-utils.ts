export function exportToCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToExcel(filename: string, headers: string[], rows: string[][]) {
  const escape = (v: string) => `<td>${String(v ?? "").replace(/</g, "&lt;")}</td>`;
  const html = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map(escape).join("")}</tr>`)
    .join("")}</tbody></table>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.replace(/\.xlsx?$/, ".xls");
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToPdf(filename: string, title: string, headers: string[], rows: string[][]) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>body{font-family:system-ui,sans-serif;padding:24px}table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>
    <h1>${title}</h1><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>
    <script>window.print();</script></body></html>`);
  w.document.close();
}
