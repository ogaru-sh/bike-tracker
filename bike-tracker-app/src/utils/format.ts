/** 距離表示: メートル → "XX.X km" or "XXX m" */
export function formatDistance(meters: number | null | undefined): string {
  if (!meters) return "0 m";
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

/** 秒数 → "Xh XXm" */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}m`;
}

/** 速度表示: m/s → "XX.X km/h" */
export function formatSpeed(mps: number | null | undefined): string {
  if (!mps || mps < 0) return "0.0";
  return (mps * 3.6).toFixed(1);
}

/** ISO日時 → "YYYY/MM/DD HH:mm" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
