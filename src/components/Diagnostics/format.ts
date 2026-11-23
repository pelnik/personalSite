const relativeDays = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

export function formatMB(mb: number) {
  return mb >= 1024 ? formatGB(mb / 1024) : `${mb.toFixed(1)} MB`;
}

export function formatGB(gb: number) {
  return `${gb.toFixed(1)} GB`;
}

export function formatDuration(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds / 3600) % 24;
  const minutes = Math.floor(seconds / 60) % 60;
  const remainder = seconds % 60;

  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${remainder}s`;
  return `${remainder}s`;
}

export function formatDate(iso: string) {
  const date = new Date(iso);
  const days = Math.round((date.getTime() - Date.now()) / 86400000);
  return `${date.toLocaleString()} (${relativeDays.format(days, 'day')})`;
}

export function percent(part: number, whole: number) {
  return whole > 0 ? Math.min(100, Math.max(0, (part / whole) * 100)) : 0;
}
