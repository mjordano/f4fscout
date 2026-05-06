/** Utility helpers */

/**
 * Format large numbers: 1200 → "1.2K", 1500000 → "1.5M"
 */
export function formatNumber(n) {
  if (n === null || n === undefined) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/**
 * Format following:followers ratio.
 */
export function formatRatio(following, followers) {
  if (!followers) return '∞';
  const r = following / followers;
  if (r >= 10)  return `${Math.round(r)}:1`;
  return `${r.toFixed(1)}:1`;
}

/**
 * Relative date: "2 days ago", "just now", etc.
 */
export function timeAgo(dateStr) {
  if (!dateStr) return 'Unknown';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff <    60) return 'Just now';
  if (diff <  3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7)  return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / (86400 * 7))}w ago`;
  if (diff < 86400 * 365) return `${Math.floor(diff / (86400 * 30))}mo ago`;
  return `${Math.floor(diff / (86400 * 365))}y ago`;
}

/**
 * Export profiles array to CSV string.
 */
export function toCSV(profiles) {
  const cols = [
    'username','displayName','followers','following','ratio','score',
    'engagementRate','postCount','isVerified','isPrivate','isBusiness',
    'bio','lastPostDate','profileUrl',
  ];
  const header = cols.join(',');
  const rows = profiles.map(p => cols.map(c => {
    let val = c === 'ratio'
      ? formatRatio(p.following, p.followers)
      : (p[c] ?? '');
    if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
      val = `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  }).join(','));
  return [header, ...rows].join('\n');
}

/**
 * Trigger a file download in the browser.
 */
export function downloadFile(content, filename, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard, returns success boolean.
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Debounce a function.
 */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a random ID string.
 */
export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Pluralize: "1 profile" / "3 profiles"
 */
export function pluralize(count, word) {
  return `${count.toLocaleString()} ${count === 1 ? word : word + 's'}`;
}

/**
 * Get score badge color class.
 */
export function scoreBadgeClass(score) {
  if (score >= 75) return 'badge-green';
  if (score >= 50) return 'badge-yellow';
  if (score >= 25) return 'badge-red';
  return 'badge-gray';
}

/**
 * Get score color hex.
 */
export function scoreHex(score) {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  if (score >= 25) return '#f97316';
  return '#ef4444';
}
