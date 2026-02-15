import { useState, useCallback } from "react";
import type { FilterPeriod } from "@/config/constants";
import { routesApi } from "../api/routes.api";
import type { Route } from "../types";

type Summary = {
  totalRoutes: number;
  totalDistanceM: number;
  totalDurationS: number;
};

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary>({
    totalRoutes: 0,
    totalDistanceM: 0,
    totalDurationS: 0,
  });

  const fetchRoutes = useCallback(async (period: FilterPeriod = "all") => {
    setLoading(true);
    try {
      const res = await routesApi.list(period);
      const data = res.data;
      setRoutes(data);
      setSummary({
        totalRoutes: data.length,
        totalDistanceM: data.reduce((sum, r) => sum + (r.distanceM ?? 0), 0),
        totalDurationS: data.reduce((sum, r) => sum + (r.durationS ?? 0), 0),
      });
    } catch (err) {
      console.error("[useRoutes] fetch error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRoute = useCallback(
    async (id: string) => {
      try {
        await routesApi.delete(id);
        setRoutes((prev) => prev.filter((r) => r.id !== id));
      } catch (err) {
        console.error("[useRoutes] delete error", err);
      }
    },
    [],
  );

  return { routes, loading, summary, fetchRoutes, deleteRoute };
}
