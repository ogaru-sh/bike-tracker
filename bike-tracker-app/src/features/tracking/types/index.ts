export type PointInput = {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  recordedAt: string;
};

export type TrackingState = {
  isTracking: boolean;
  routeId: string | null;
  elapsedS: number;
  distanceM: number;
  currentSpeed: number;
  currentLocation: { lat: number; lon: number } | null;
};
