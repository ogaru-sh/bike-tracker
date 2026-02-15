/**
 * Nominatim (OpenStreetMap) ジオコーディングサービス
 * 無料。レート制限: 1秒1リクエスト。
 */
import { NOMINATIM } from "@/config/constants";
import type { GeocodingResult } from "../types";

const headers = { "User-Agent": NOMINATIM.USER_AGENT, Accept: "application/json" };

/** 住所テキスト → 座標リスト */
export async function searchPlace(query: string): Promise<GeocodingResult[]> {
  const url = `${NOMINATIM.BASE_URL}/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=jp`;
  const res = await fetch(url, { headers });
  if (!res.ok) return [];

  const data = await res.json();
  return data.map((item: any) => ({
    displayName: item.display_name,
    lat: Number.parseFloat(item.lat),
    lon: Number.parseFloat(item.lon),
  }));
}

/** 座標 → 住所テキスト */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `${NOMINATIM.BASE_URL}/reverse?lat=${lat}&lon=${lon}&format=json&zoom=16`;
  const res = await fetch(url, { headers });
  if (!res.ok) return "不明な場所";

  const data = await res.json();
  const addr = data.address;
  // 日本の住所: 市区町村レベルを返す
  return addr?.city || addr?.town || addr?.village || addr?.suburb || data.display_name || "不明な場所";
}

/** ルートタイトル自動生成: 開始地点 → 終了地点 */
export async function generateRouteTitle(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
): Promise<string> {
  try {
    const [startName, endName] = await Promise.all([
      reverseGeocode(startLat, startLon),
      reverseGeocode(endLat, endLon),
    ]);
    if (startName === endName) return `${startName}周辺`;
    return `${startName} → ${endName}`;
  } catch {
    return "無題のルート";
  }
}
