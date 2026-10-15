/**
 * Formato de fecha almacenado por el CV: `YYYY` o `YYYY-MM`.
 * Se mantiene el valor original si procede de un workspace antiguo con otro formato.
 */
export function formatCvDate(value?: string): string {
  if (!value) return "";
  const match = /^(\d{4})(?:-(\d{2}))?$/.exec(value);
  if (!match) return value;
  return match[2] ? `${match[2]}/${match[1]}` : match[1];
}

export function formatDateRange(start?: string, end?: string, presentLabel = "Present"): string {
  const formattedStart = formatCvDate(start);
  const formattedEnd = formatCvDate(end);
  if (!formattedStart && !formattedEnd) return "";
  if (formattedStart && formattedEnd) return `${formattedStart} — ${formattedEnd}`;
  if (formattedStart) return `${formattedStart} — ${presentLabel}`;
  return formattedEnd;
}
