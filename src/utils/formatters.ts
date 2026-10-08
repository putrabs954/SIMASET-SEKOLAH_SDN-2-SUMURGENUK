import QRCode from 'qrcode';

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    // Return empty fallback
    return '';
  }
}

export function exportToCsv(
  arg1: string | Record<string, any>[],
  arg2?: string[] | string,
  arg3?: (string | number | boolean)[][]
): void {
  let filename = 'export';
  let headers: string[] = [];
  let rows: (string | number | boolean)[][] = [];

  if (Array.isArray(arg1)) {
    // Called as exportToCsv(dataArray, filename)
    filename = (arg2 as string) || 'export';
    if (arg1.length > 0) {
      headers = Object.keys(arg1[0]);
      rows = arg1.map(item => headers.map(h => item[h]));
    }
  } else {
    // Called as exportToCsv(filename, headers, rows)
    filename = arg1 || 'export';
    headers = (arg2 as string[]) || [];
    rows = arg3 || [];
  }

  const sanitize = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(sanitize).join(','),
    ...rows.map(row => row.map(sanitize).join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel(
  arg1: string | Record<string, any>[],
  arg2?: string[] | string,
  arg3?: (string | number)[][],
  title?: string
): void {
  let filename = 'export';
  let headers: string[] = [];
  let rows: (string | number)[][] = [];

  if (Array.isArray(arg1)) {
    // Called as exportToExcel(dataArray, filename, title)
    filename = (arg2 as string) || 'export';
    if (arg1.length > 0) {
      headers = Object.keys(arg1[0]);
      rows = arg1.map(item => headers.map(h => (typeof item[h] === 'number' ? item[h] : String(item[h] ?? ''))));
    }
  } else {
    // Called as exportToExcel(filename, headers, rows, title)
    filename = arg1 || 'export';
    headers = (arg2 as string[]) || [];
    rows = arg3 || [];
  }

  let tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
    <style>
      table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 11pt; }
      th { background-color: #1e3a8a; color: #ffffff; border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
      td { border: 1px solid #cbd5e1; padding: 6px; }
      .header-title { font-size: 14pt; font-weight: bold; margin-bottom: 12px; color: #0f172a; }
    </style>
  </head>
  <body>
    ${title ? `<div class="header-title">${title}</div>` : ''}
    <table>
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map(row => `<tr>${row.map(c => `<td>${c ?? ''}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  </body>
  </html>`;

  const blob = new Blob(['\uFEFF' + tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
