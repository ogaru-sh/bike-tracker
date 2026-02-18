/** GPS 追跡設定 */
export const TRACKING = {
  /** GPS取得間隔（秒） */
  INTERVAL_S: 5,
  /** 最小移動距離（メートル） */
  MIN_DISTANCE_M: 10,
  /** 精度フィルター（メートル） - これを超えるポイントは除外 */
  ACCURACY_FILTER_M: 50,
  /** バッチ送信間隔（秒） */
  BATCH_INTERVAL_S: 30,
  /** バッファ最大件数（これを超えると即送信） */
  BATCH_MAX_POINTS: 50,
} as const;

/** 地図設定 */
export const MAP = {
  /** OpenFreeMap スタイルURL */
  STYLE_URL: "https://tiles.openfreemap.org/styles/liberty",
  /** デフォルト中心（東京） */
  DEFAULT_CENTER: [139.7671, 35.6812] as [number, number],
  DEFAULT_ZOOM: 12,
  /** ルート線の色 */
  ROUTE_COLOR: "#3B82F6",
  ROUTE_WIDTH: 4,
} as const;

/** Nominatim API */
export const NOMINATIM = {
  BASE_URL: "https://nominatim.openstreetmap.org",
  USER_AGENT: "BikeTracker/1.0",
} as const;

/** 履歴フィルター期間 */
export type FilterPeriod = "all" | "week" | "month" | "year" | "custom";

export const FILTER_OPTIONS: { label: string; value: FilterPeriod }[] = [
  { label: "全期間", value: "all" },
  { label: "1週間", value: "week" },
  { label: "1ヶ月", value: "month" },
  { label: "1年", value: "year" },
  { label: "カスタム", value: "custom" },
];

/** 履歴ソート */
export type SortKey = "date" | "distance";
export type SortOrder = "asc" | "desc";

export const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "日付", value: "date" },
  { label: "距離", value: "distance" },
];
