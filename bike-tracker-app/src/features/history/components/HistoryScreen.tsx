import { useState, useCallback } from "react";
import { FlatList, ActivityIndicator } from "react-native";
import styled from "@emotion/native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { showConfirm } from "@/components/ConfirmDialog";
import { useRoutes } from "../hooks/useRoutes";
import { RouteFilter } from "./RouteFilter";
import { RouteSummary } from "./RouteSummary";
import { RouteCard } from "./RouteCard";
import type { FilterPeriod } from "@/config/constants";
import type { Route } from "../types";

export function HistoryScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<FilterPeriod>("all");
  const { routes, loading, summary, fetchRoutes, deleteRoute } = useRoutes();

  useFocusEffect(
    useCallback(() => {
      fetchRoutes(period);
    }, [period, fetchRoutes]),
  );

  const handleChangePeriod = useCallback(
    (p: FilterPeriod) => {
      setPeriod(p);
      fetchRoutes(p);
    },
    [fetchRoutes],
  );

  const handleDelete = useCallback(
    (id: string) => {
      showConfirm({
        title: "ルート削除",
        message: "このルートを完全に削除しますか？\nこの操作は取り消せません。",
        confirmLabel: "削除する",
        destructive: true,
        onConfirm: () => deleteRoute(id),
      });
    },
    [deleteRoute],
  );

  const renderItem = useCallback(
    ({ item }: { item: Route }) => (
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
      <RouteFilter value={period} onChange={handleChangePeriod} />
      <RouteSummary {...summary} />

      {loading ? (
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
