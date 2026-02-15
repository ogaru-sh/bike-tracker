/**
 * トラッキング hook
 * useEffect 排除: タイマー・GPS管理をすべて Zustand ストアに移行
 */
import { useCallback } from "react";
import { useTrackingStore } from "../stores/tracking.store";

export function useTracking() {
  const state = useTrackingStore();

  const start = useCallback(async () => {
    await useTrackingStore.getState().start();
  }, []);

  const stop = useCallback(async () => {
    await useTrackingStore.getState().stop();
  }, []);

  return {
    isTracking: state.isTracking,
    routeId: state.routeId,
    elapsedS: state.elapsedS,
    distanceM: state.distanceM,
    currentSpeed: state.currentSpeed,
    currentLocation: state.currentLocation,
    start,
    stop,
  };
}
