
export function parseCSV(text){
  const sep = text.includes(';') ? ';' : ',';
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(sep).map(h => h.trim());
  return lines.map(line => {
    const cols = line.split(sep).map(c => c.trim());
    const obj = {};
    headers.forEach((h,i) => obj[h] = cols[i] ?? '');
    return obj;
  });
}

export function toCSV(rows){
  if(!rows || !rows.length) return '';
  const headers = Object.keys(rows[0]);
  const body = rows.map(r =>
    headers.map(h => (r[h] ?? '').toString().replaceAll(',', ';')).join(',')
  );
  return [headers.join(','), ...body].join('\n');}
