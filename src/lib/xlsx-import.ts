import * as XLSX from 'xlsx';

export function readSheet(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      try {
        const wb = XLSX.read(reader.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
        resolve(json);
      } catch (e) {
        reject(e);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export function mapRows(
  rows: Record<string, any>[],
  mapping: Record<string, string>,
): Record<string, any>[] {
  return rows.map((row) => {
    const out: Record<string, any> = {};
    for (const [excelKey, fieldKey] of Object.entries(mapping)) {
      const v = row[excelKey] ?? row[excelKey?.toLowerCase?.()] ?? row[excelKey?.toUpperCase?.()];
      if (v !== undefined && v !== '') out[fieldKey] = v;
    }
    return out;
  });
}
