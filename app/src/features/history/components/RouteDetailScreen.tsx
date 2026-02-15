import styled from "@emotion/native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet } from "react-native";
import { Button } from "@/components/Button";
import { showConfirm } from "@/components/ConfirmDialog";
import { MAP } from "@/config/constants";
import {
  getGetRoutesIdQueryKey,
  getGetRoutesQueryKey,
  useDeleteRoutesId,
  useGetRoutesId,
  usePatchRoutesId,
} from "@/generated/endpoints/routes/routes";
import type { GetRoutesId200 } from "@/generated/models/getRoutesId200";
import { formatDate, formatDistance, formatDuration } from "@/utils/format";

type Props = { routeId: string };

function RouteMap({ route }: { route: GetRoutesId200 }) {
  const points = route.points ?? [];
  const coordinates = points.map((p) => [p.longitude, p.latitude] as [number, number]);

  if (coordinates.length === 0) {
    return (
      <MapFallback>
        <MapFallbackText>ポイントデータがありません</MapFallbackText>
      </MapFallback>
    );
  }

  const bounds = coordinates.reduce(
    (acc, [lon, lat]) => ({
      minLon: Math.min(acc.minLon, lon),
      maxLon: Math.max(acc.maxLon, lon),
      minLat: Math.min(acc.minLat, lat),
      maxLat: Math.max(acc.maxLat, lat),
    }),
    {
      minLon: coordinates[0][0],
      maxLon: coordinates[0][0],
      minLat: coordinates[0][1],
      maxLat: coordinates[0][1],
    },
  );

  const routeGeoJSON = {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates },
      },
    ],
  };

  return (
    <MapContainer>
      <MapLibreGL.MapView style={rnStyles.map} mapStyle={MAP.STYLE_URL}>
        <MapLibreGL.Camera
          bounds={{
            ne: [bounds.maxLon, bounds.maxLat],
            sw: [bounds.minLon, bounds.minLat],
            paddingTop: 40,
            paddingBottom: 40,
            paddingLeft: 40,
            paddingRight: 40,
          }}
        />
        <MapLibreGL.ShapeSource id="routeDetail" shape={routeGeoJSON}>
          <MapLibreGL.LineLayer
            id="routeDetailLine"
            style={{
              lineColor: MAP.ROUTE_COLOR,
              lineWidth: MAP.ROUTE_WIDTH,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </MapLibreGL.ShapeSource>
      </MapLibreGL.MapView>
    </MapContainer>
  );
}

export function RouteDetailScreen({ routeId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");

  const { data: route, isLoading } = useGetRoutesId(routeId);

  // route が取得されたら title を同期（TanStack Query v5 では onSuccess 廃止）
  const routeTitle = route?.title ?? "";
  if (!editing && title !== routeTitle && route) {
    setTitle(routeTitle);
  }

  const patchMutation = usePatchRoutesId();
  const deleteMutation = useDeleteRoutesId();

  const handleSaveTitle = () => {
    if (!route) return;
    patchMutation.mutate(
      { id: route.id, data: { title } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetRoutesIdQueryKey(routeId) });
          setEditing(false);
        },
        onError: () => Alert.alert("エラー", "タイトルの更新に失敗しました"),
      },
    );
  };

  const handleDelete = () => {
    showConfirm({
      title: "ルート削除",
      message: "このルートを完全に削除しますか？\nこの操作は取り消せません。",
      confirmLabel: "削除する",
      destructive: true,
      onConfirm: () =>
        deleteMutation.mutate(
          { id: routeId },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getGetRoutesQueryKey() });
              router.back();
            },
            onError: () => Alert.alert("エラー", "削除に失敗しました"),
          },
        ),
    });
  };

  if (isLoading) {
    return (
      <Container>
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 100 }} />
      </Container>
    );
  }

  if (!route) {
    return (
      <Container>
        <EmptyText>ルートが見つかりませんでした</EmptyText>
      </Container>
    );
  }

  return (
    <Container>
      <ContentScroll showsVerticalScrollIndicator={false}>
        {/* ルート地図 */}
        <RouteMap route={route} />

        {/* タイトル（タップで編集） */}
        {editing ? (
          <TitleEditRow>
            <TitleInput
              value={title}
              onChangeText={setTitle}
              autoFocus
              placeholder="ルート名を入力"
              placeholderTextColor="#64748B"
            />
            <SaveBtn onPress={handleSaveTitle} activeOpacity={0.7}>
              <SaveBtnText>保存</SaveBtnText>
            </SaveBtn>
          </TitleEditRow>
        ) : (
          <TitleRow onPress={() => setEditing(true)} activeOpacity={0.7}>
            <TitleText>{route.title || "無題のルート"}</TitleText>
            <EditHint>✏️</EditHint>
          </TitleRow>
        )}

        <DateLabel>{formatDate(route.startedAt)}</DateLabel>

        {/* 統計グリッド */}
        <StatsGrid>
          <StatBox>
            <StatValue>{formatDistance(route.distanceM)}</StatValue>
            <StatLabel>距離</StatLabel>
          </StatBox>
          <StatBox>
            <StatValue>{formatDuration(route.durationS)}</StatValue>
            <StatLabel>時間</StatLabel>
          </StatBox>
          <StatBox>
            <StatValue>{(route.avgSpeedKmh ?? 0).toFixed(1)} km/h</StatValue>
            <StatLabel>平均速度</StatLabel>
          </StatBox>
          <StatBox>
            <StatValue>{(route.maxSpeedKmh ?? 0).toFixed(1)} km/h</StatValue>
            <StatLabel>最高速度</StatLabel>
          </StatBox>
        </StatsGrid>

        <DeleteWrapper>
          <Button label="このルートを削除" variant="danger" onPress={handleDelete} />
        </DeleteWrapper>
      </ContentScroll>
    </Container>
  );
}

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #0f172a;
`;

const ContentScroll = styled.ScrollView`
  flex: 1;
  padding: 0 16px;
`;

const rnStyles = StyleSheet.create({
  map: { flex: 1, borderRadius: 16 },
});

const MapContainer = styled.View`
  height: 250px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
  margin-top: 16px;
`;

const MapFallback = styled.View`
  height: 250px;
  background-color: #1e293b;
  border-radius: 16px;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 16px;
`;

const MapFallbackText = styled.Text`
  color: #94a3b8;
  font-size: 15px;
`;

const TitleRow = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
`;

const TitleText = styled.Text`
  color: #f8fafc;
  font-size: 22px;
  font-weight: 800;
  flex: 1;
`;

const EditHint = styled.Text`
  font-size: 18px;
  margin-left: 8px;
`;

const TitleEditRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
  gap: 8px;
`;

const TitleInput = styled.TextInput`
  flex: 1;
  background-color: #1e293b;
  border-radius: 8px;
  padding: 12px;
  color: #f8fafc;
  font-size: 16px;
  border-width: 1px;
  border-color: #3b82f6;
`;

const SaveBtn = styled.TouchableOpacity`
  background-color: #3b82f6;
  border-radius: 8px;
  padding: 12px 20px;
`;

const SaveBtnText = styled.Text`
  color: #fff;
  font-weight: 700;
`;

const DateLabel = styled.Text`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 20px;
`;

const StatsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 32px;
`;

const StatBox = styled.View`
  background-color: #1e293b;
  border-radius: 12px;
  padding: 16px;
  width: 48%;
  align-items: center;
`;

const StatValue = styled.Text`
  color: #f8fafc;
  font-size: 20px;
  font-weight: 700;
`;

const StatLabel = styled.Text`
  color: #94a3b8;
  font-size: 12px;
  margin-top: 4px;
`;

const EmptyText = styled.Text`
  color: #94a3b8;
  font-size: 16px;
  text-align: center;
  margin-top: 100px;
`;

const DeleteWrapper = styled.View`
  margin-bottom: 40px;
`;
