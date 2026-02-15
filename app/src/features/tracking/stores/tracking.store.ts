/**
 * トラッキング Zustand ストア
 * useEffect を排除: タイマー・GPS をストア内で管理
 */
import { create } from "zustand";
import { patchRoutesIdStop, postRoutes } from "@/generated/endpoints/routes/routes";
import { locationTracker } from "../services/location.service";
import type { TrackingState } from "../types";

type TrackingStore = TrackingState & {
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

/** タイマー参照（ストア外でクラス同様に private 管理） */
const timer = {
  id: null as ReturnType<typeof setInterval> | null,
  startedAt: null as Date | null,

  begin(onTick: (elapsedS: number) => void) {
    this.startedAt = new Date();
    this.id = setInterval(() => {
      if (this.startedAt) {
        onTick(Math.floor((Date.now() - this.startedAt.getTime()) / 1000));
      }
    }, 1000);
  },

  clear() {
    if (this.id) clearInterval(this.id);
    this.id = null;
    this.startedAt = null;
  },
};

export const useTrackingStore = create<TrackingStore>((set) => ({
  isTracking: false,
  routeId: null,
  elapsedS: 0,
  distanceM: 0,
  currentSpeed: 0,
  currentLocation: null,
  trackPoints: [],

  start: async () => {
    const granted = await locationTracker.requestPermission();
    if (!granted) throw new Error("位置情報の許可が必要です");

    // API: ルート記録開始
    const { id } = await postRoutes();

    set({ isTracking: true, routeId: id, elapsedS: 0, distanceM: 0, trackPoints: [] });

    // 経過時間タイマー
    timer.begin((elapsedS) => set({ elapsedS }));

    // GPS追跡開始
    await locationTracker.start(id, (lat, lon, speed) => {
      set((state) => ({
        currentSpeed: speed,
        currentLocation: { lat, lon },
        trackPoints: [...state.trackPoints, [lon, lat] as [number, number]],
      }));
    });
  },

  stop: async () => {
    const { routeId } = useTrackingStore.getState();
    if (!routeId) return;

    // GPS停止（残りバッファ送信含む）
    await locationTracker.stop();

    // API: ルート記録停止
    await patchRoutesIdStop(routeId);

    timer.clear();

    set({
      isTracking: false,
      routeId: null,
      elapsedS: 0,
      distanceM: 0,
      currentSpeed: 0,
      currentLocation: null,
      trackPoints: [],
    });
  },
}));
