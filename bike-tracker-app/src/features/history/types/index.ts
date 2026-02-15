export type Route = {
  id: string;
  userId: string;
  title: string | null;
  startedAt: string;
  endedAt: string | null;
  distanceM: number;
  durationS: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  status: "recording" | "completed";
};

export type RoutePoint = {
  id: string;
  routeId: string;
  latitude: number;
  longitude: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  accuracy?: number | null;
  recordedAt: string;
};

export type RouteWithPoints = Route & {
  points: RoutePoint[];
};
