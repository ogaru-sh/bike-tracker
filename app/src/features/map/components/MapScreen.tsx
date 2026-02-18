/**
 * メイン地図画面
 * MapLibre GL + OpenFreeMap でリアルタイム地図表示
 * Google Maps風のUI/UXレイアウト
 */

import styled from "@emotion/native";
import { Ionicons } from "@expo/vector-icons";
import MapLibreGL from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { MAP } from "@/config/constants";
import { TrackingControls, TrackingStats, useTracking } from "@/features/tracking";
import { SearchBar } from "./SearchBar";

type CameraTarget = {
  center: [number, number];
  ts: number;
};

export function MapScreen() {
  const tracking = useTracking();
  const cameraRef = useRef<MapLibreGL.Camera>(null);
  const [cameraTarget, setCameraTarget] = useState<CameraTarget | null>(null);

  // --- Reanimated: FAB と Bottom の高さ切替 ---
  const fabBottom = useSharedValue(160);

  useEffect(() => {
    fabBottom.value = withTiming(tracking.isTracking ? 260 : 160, {
      duration: 300,
    });
  }, [tracking.isTracking, fabBottom]);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    right: 16,
    bottom: fabBottom.value,
    zIndex: 5,
  }));

  // --- 現在地 ---
  const goToCurrentLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("エラー", "位置情報の許可が必要です");
      return;
    }
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    setCameraTarget({
      center: [loc.coords.longitude, loc.coords.latitude],
      ts: Date.now(),
    });
  }, []);

  useEffect(() => {
    goToCurrentLocation();
  }, [goToCurrentLocation]);

  const handleGoToCurrentLocation = useCallback(async () => {
    try {
      await goToCurrentLocation();
    } catch (err: unknown) {
      Alert.alert("エラー", err instanceof Error ? err.message : "現在地を取得できません");
    }
  }, [goToCurrentLocation]);

  // --- トラッキング操作 ---
  const handleStart = async () => {
    try {
      await tracking.start();
    } catch (err: unknown) {
      Alert.alert("エラー", err instanceof Error ? err.message : "不明なエラー");
    }
  };

  const handleStop = async () => {
    try {
      await tracking.stop();
      Alert.alert("完了", "ルートを保存しました");
    } catch (err: unknown) {
      Alert.alert("エラー", err instanceof Error ? err.message : "不明なエラー");
    }
  };

  // --- ルートGeoJSON ---
  const routeGeoJSON = useMemo(() => {
    if (tracking.trackPoints.length < 2) return null;
    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: tracking.trackPoints,
          },
        },
      ],
    };
  }, [tracking.trackPoints]);

  return (
    <Container>
      {/* 地図 */}
      <MapLibreGL.MapView style={mapStyle} mapStyle={MAP.STYLE_URL}>
        <MapLibreGL.Camera
          ref={cameraRef}
          key={cameraTarget?.ts}
          centerCoordinate={cameraTarget?.center ?? MAP.DEFAULT_CENTER}
          zoomLevel={15}
          animationDuration={cameraTarget ? 500 : 0}
          followUserLocation={tracking.isTracking}
          followZoomLevel={15}
        />
        <MapLibreGL.UserLocation visible />
        {routeGeoJSON && (
          <MapLibreGL.ShapeSource id="route" shape={routeGeoJSON}>
            <MapLibreGL.LineLayer
              id="routeLine"
              style={{
                lineColor: MAP.ROUTE_COLOR,
                lineWidth: MAP.ROUTE_WIDTH,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </MapLibreGL.ShapeSource>
        )}
      </MapLibreGL.MapView>

      {/* 検索バー（ピル型） */}
      <OverlayTop>
        <SearchBar />
      </OverlayTop>

      {/* 現在地 FAB（アニメーション位置） */}
      <Animated.View style={fabAnimatedStyle}>
        <LocationFab onPress={handleGoToCurrentLocation} activeOpacity={0.7}>
          <Ionicons name="navigate" size={24} color="#F8FAFC" />
        </LocationFab>
      </Animated.View>

      {/* ボトム: 統計カード + 記録ボタン */}
      <OverlayBottom>
        {tracking.isTracking && (
          <TrackingStats
            speed={tracking.currentSpeed}
            elapsedS={tracking.elapsedS}
            distanceM={tracking.distanceM}
          />
        )}
        <TrackingControls
          isTracking={tracking.isTracking}
          onStart={handleStart}
          onStop={handleStop}
        />
      </OverlayBottom>
    </Container>
  );
}

const mapStyle = { flex: 1 } as const;

const Container = styled.View`
  flex: 1;
  background-color: #0f172a;
`;

const OverlayTop = styled.View`
  position: absolute;
  top: 60px;
  left: 16px;
  right: 16px;
  z-index: 10;
`;

const LocationFab = styled.TouchableOpacity`
  width: 52px;
  height: 52px;
  border-radius: 26px;
  background-color: #1e293b;
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.35;
  shadow-radius: 8px;
  elevation: 8;
`;

const OverlayBottom = styled.View`
  position: absolute;
  bottom: 40px;
  left: 16px;
  right: 16px;
  z-index: 5;
`;
