import { apiClient } from "@/lib/api-client";
import type { FilterPeriod } from "@/config/constants";
import type { Route, RouteWithPoints } from "../types";

function getDateRange(period: FilterPeriod): { from?: string; to?: string } {
  if (period === "all") return {};
  const now = new Date();
  const from = new Date(now);
  switch (period) {
    case "week":
      from.setDate(from.getDate() - 7);
      break;
    case "month":
      from.setMonth(from.getMonth() - 1);
      break;
    case "year":
      from.setFullYear(from.getFullYear() - 1);
      break;
  }
  return { from: from.toISOString(), to: now.toISOString() };
}

export const routesApi = {
  list: (period: FilterPeriod = "all") => {
    const { from, to } = getDateRange(period);
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return apiClient<{ data: Route[]; nextCursor: string | null }>({
      url: "/routes",
      method: "GET",
      params,
    });
  },

  get: (id: string) =>
    apiClient<RouteWithPoints>({ url: `/routes/${id}`, method: "GET" }),

  updateTitle: (id: string, title: string) =>
    apiClient<{ id: string; title: string }>({
      url: `/routes/${id}`,
      method: "PATCH",
      data: { title },
    }),

  delete: (id: string) =>
    apiClient<{ deleted: boolean }>({ url: `/routes/${id}`, method: "DELETE" }),

  stop: (id: string) =>
    apiClient<{ id: string; status: string; distanceM: number; durationS: number }>({
      url: `/routes/${id}/stop`,
      method: "PATCH",
    }),
};
