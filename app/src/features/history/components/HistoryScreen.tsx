import styled from "@emotion/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { showConfirm } from "@/components/ConfirmDialog";
import type { FilterPeriod } from "@/config/constants";
import {
  getGetRoutesQueryKey,
  useDeleteRoutesId,
  useGetRoutes,
} from "@/generated/endpoints/routes/routes";
import type { GetRoutes200DataItem } from "@/generated/models";
import { RouteCard } from "./RouteCard";
import { RouteFilter } from "./RouteFilter";
import { RouteSummary } from "./RouteSummary";

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

export function HistoryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<FilterPeriod>("all");

  const params = useMemo(() => {
    const range = getDateRange(period);
    return { ...range } as Record<string, string>;
  }, [period]);

  const { data, isLoading } = useGetRoutes(params);
  const deleteMutation = useDeleteRoutesId();

  const routes = data?.data ?? [];
  const summary = useMemo(
    () => ({
      totalRoutes: routes.length,
      totalDistanceM: routes.reduce((sum, r) => sum + (r.distanceM ?? 0), 0),
      totalDurationS: routes.reduce((sum, r) => sum + (r.durationS ?? 0), 0),
    }),
    [routes],
  );

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
      <RouteFilter value={period} onChange={setPeriod} />
      <RouteSummary {...summary} />

      {isLoading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : routes.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🏍</EmptyIcon>
          <EmptyTitle>まだルートがありません</EmptyTitle>
          <EmptySubtitle>走行を記録してみましょう</EmptySubtitle>
        </EmptyState>
      ) : (
        <FlatList
          data={routes}
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
