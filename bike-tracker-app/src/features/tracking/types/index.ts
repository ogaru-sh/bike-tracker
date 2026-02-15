export type PointInput = {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  accuracy?: number | null;
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
