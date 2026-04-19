/**
 * Pure formatters for the Forge backup pill.
 *
 *   timeAgo(null)         → 'never'
 *   timeAgo(<5s ago>)     → 'just now'
 *   timeAgo(<3m ago>)     → '3m ago'
 *   timeAgo(<2h ago>)     → '2h ago'
 *   timeAgo(<5d ago>)     → '5d ago'
 *
 *   formatBytes(null)     → ''
 *   formatBytes(184_000)  → '184 KB'
 *   formatBytes(1_200_000)→ '1.2 MB'
 */

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return 'never';
  const diff = Date.now() - then;
  if (diff < 10_000) return 'just now';
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export function formatBytes(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
