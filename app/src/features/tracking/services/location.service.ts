/**
 * バックグラウンドGPS追跡サービス
 * expo-location を使用（react-native-background-geolocation は要 prebuild）
 *
 * let 排除: クラスにカプセル化し、シングルトンで export
 */
import * as Location from "expo-location";
import { TRACKING } from "@/config/constants";
import { postRoutesIdPoints } from "@/generated/endpoints/routes/routes";
import type { PostRoutesIdPointsBodyPointsItem } from "@/generated/models";

type OnLocationCallback = (lat: number, lon: number, speed: number) => void;

class LocationTracker {
  private pointBuffer: PostRoutesIdPointsBodyPointsItem[] = [];
  private batchTimer: ReturnType<typeof setInterval> | null = null;
  private routeId: string | null = null;
  private subscription: Location.LocationSubscription | null = null;
  private onLocationCallback: OnLocationCallback | null = null;

  /** 位置情報パーミッションを要求 */
  async requestPermission(): Promise<boolean> {
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== "granted") return false;

    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    return bg === "granted";
  }

  /** GPS追跡を開始 */
  async start(routeId: string, onLocation?: OnLocationCallback): Promise<void> {
    this.routeId = routeId;
    this.pointBuffer = [];
    this.onLocationCallback = onLocation ?? null;

    // バッチ送信タイマー開始
    this.batchTimer = setInterval(() => this.flushBuffer(), TRACKING.BATCH_INTERVAL_S * 1000);

    // 位置情報の監視開始
    this.subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: TRACKING.INTERVAL_S * 1000,
        distanceInterval: TRACKING.MIN_DISTANCE_M,
      },
      (location) => this.handleLocation(location),
    );
  }

  /** GPS追跡を停止 */
  async stop(): Promise<void> {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }

    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }

    // 残りのバッファを送信
    await this.flushBuffer();
    this.routeId = null;
    this.onLocationCallback = null;
  }

  /** バッファ内のポイント数 */
  getBufferCount(): number {
    return this.pointBuffer.length;
  }

  // ── private ──

  private handleLocation(location: Location.LocationObject): void {
    const { coords, timestamp } = location;

    // 精度フィルター
    if (coords.accuracy && coords.accuracy > TRACKING.ACCURACY_FILTER_M) return;

    this.pointBuffer.push({
      latitude: coords.latitude,
      longitude: coords.longitude,
      altitude: coords.altitude ?? undefined,
      speed: coords.speed ?? undefined,
      heading: coords.heading ?? undefined,
      accuracy: coords.accuracy ?? undefined,
      recordedAt: new Date(timestamp).toISOString(),
    });

    this.onLocationCallback?.(coords.latitude, coords.longitude, coords.speed ?? 0);

    if (this.pointBuffer.length >= TRACKING.BATCH_MAX_POINTS) {
      this.flushBuffer();
    }
  }

  private async flushBuffer(): Promise<void> {
    if (!this.routeId || this.pointBuffer.length === 0) return;
    const points = [...this.pointBuffer];
    this.pointBuffer = [];

    try {
      await postRoutesIdPoints(this.routeId, { points });
    } catch (err) {
      console.warn("[GPS] バッチ送信失敗、バッファに戻します", err);
      this.pointBuffer = [...points, ...this.pointBuffer];
    }
  }
}

export const locationTracker = new LocationTracker();
