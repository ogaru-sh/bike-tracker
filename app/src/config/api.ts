/** APIベースURL — 開発/本番で切り替え */
export const API_BASE_URL = __DEV__
  ? "http://localhost:8788"
  : "https://bike-tracker-api.ogaru-sosh.workers.dev";
