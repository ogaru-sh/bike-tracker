import styled from "@emotion/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { showConfirm } from "@/components/ConfirmDialog";
import type { FilterPeriod, SortKey, SortOrder } from "@/config/constants";
import {
  getGetRoutesQueryKey,
  useDeleteRoutesId,
  useGetRoutes,
} from "@/generated/endpoints/routes/routes";
import type { GetRoutes200DataItem } from "@/generated/models";
import { DateRangePicker } from "./DateRangePicker";
import { RouteCard } from "./RouteCard";
import { RouteFilter } from "./RouteFilter";
import { RouteSortBar } from "./RouteSortBar";
import { RouteSummary } from "./RouteSummary";

function getDateRange(
  period: FilterPeriod,
  customRange?: { from: Date; to: Date },
): { from?: string; to?: string } {
  if (period === "all") return {};
  if (period === "custom" && customRange) {
    const to = new Date(customRange.to);
    to.setHours(23, 59, 59, 999);
    return { from: customRange.from.toISOString(), to: to.toISOString() };
  }
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

function formatShort(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function HistoryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<FilterPeriod>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date }>(() => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    return { from, to };
  });
  const handlePeriodChange = useCallback((p: FilterPeriod) => {
    setPeriod(p);
  }, []);

  const handleApplyCustom = useCallback((range: { from: Date; to: Date }) => {
    setCustomRange(range);
  }, []);

  const params = useMemo(() => {
    const range = getDateRange(period, customRange);
    return { ...range } as Record<string, string>;
  }, [period, customRange]);

  const { data, isLoading } = useGetRoutes(params);
  const deleteMutation = useDeleteRoutesId();

  const routes = data?.data ?? [];

  const sortedRoutes = useMemo(() => {
    const sorted = [...routes].sort((a, b) => {
      if (sortKey === "distance") {
        return (a.distanceM ?? 0) - (b.distanceM ?? 0);
      }
      return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
    });
    return sortOrder === "desc" ? sorted.reverse() : sorted;
  }, [routes, sortKey, sortOrder]);

  const summary = useMemo(
    () => ({
      totalRoutes: routes.length,
      totalDistanceM: routes.reduce((sum, r) => sum + (r.distanceM ?? 0), 0),
      totalDurationS: routes.reduce((sum, r) => sum + (r.durationS ?? 0), 0),
    }),
    [routes],
  );

  const customLabel =
    period === "custom"
      ? `${formatShort(customRange.from)} 〜 ${formatShort(customRange.to)}`
      : undefined;

  const handleDelete = useCallback(
    (id: string) => {
      showConfirm({
        title: "ルート削除",
        message: "このルートを完全に削除しますか？\nこの操作は取り消せません。",
        confirmLabel: "削除する",
        destructive: true,
        onConfirm: () =>
          deleteMutation.mutate(
            { id },
            {
              onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetRoutesQueryKey() }),
            },
          ),
      });
    },
    [deleteMutation, queryClient],
  );

  const renderItem = useCallback(
    ({ item }: { item: GetRoutes200DataItem }) => (
      <RouteCard
        route={item}
        onPress={() => router.push(`/(tabs)/history/${item.id}`)}
        onLongPress={() => handleDelete(item.id)}
      />
    ),
    [router, handleDelete],
  );

  return (
    <Container>
      <Header>走行履歴</Header>
      <RouteFilter value={period} onChange={handlePeriodChange} customLabel={customLabel} />
      {period === "custom" && (
        <DateRangePicker initial={customRange} onApply={handleApplyCustom} />
      )}
      <RouteSummary {...summary} />
      <RouteSortBar
        sortKey={sortKey}
        sortOrder={sortOrder}
        onChangeSortKey={setSortKey}
        onToggleOrder={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : sortedRoutes.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🏍</EmptyIcon>
          <EmptyTitle>まだルートがありません</EmptyTitle>
          <EmptySubtitle>走行を記録してみましょう</EmptySubtitle>
        </EmptyState>
      ) : (
        <FlatList
          data={sortedRoutes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Container>
  );
}

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #0f172a;
  padding: 0 16px;
`;

const Header = styled.Text`
  color: #f8fafc;
  font-size: 28px;
  font-weight: 800;
  margin-top: 16px;
  margin-bottom: 16px;
`;

const EmptyState = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const EmptyIcon = styled.Text`
  font-size: 48px;
  margin-bottom: 8px;
`;

const EmptyTitle = styled.Text`
  color: #f8fafc;
  font-size: 18px;
  font-weight: 700;
`;

const EmptySubtitle = styled.Text`
  color: #64748b;
  font-size: 14px;
  margin-top: 8px;
`;
