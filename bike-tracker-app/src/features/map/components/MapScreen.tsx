/**
 * メイン地図画面
 * MapLibre GL + OpenFreeMap でリアルタイム地図表示
 */

import styled from "@emotion/native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { useMemo, useRef } from "react";
import { Alert, StyleSheet } from "react-native";
import { MAP } from "@/config/constants";
import { TrackingControls, TrackingStats, useTracking } from "@/features/tracking";
import { SearchBar } from "./SearchBar";

export function MapScreen() {
  const tracking = useTracking();
  const cameraRef = useRef<MapLibreGL.Camera>(null);

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

  const centerCoordinate = tracking.currentLocation
    ? [tracking.currentLocation.lon, tracking.currentLocation.lat]
    : MAP.DEFAULT_CENTER;

  return (
    <Container>
      <MapLibreGL.MapView style={styles.map} mapStyle={MAP.STYLE_URL}>
        <MapLibreGL.Camera
          ref={cameraRef}
          centerCoordinate={centerCoordinate}
          zoomLevel={MAP.DEFAULT_ZOOM}
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

      <OverlayTop>
        <SearchBar />
      </OverlayTop>

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

const styles = StyleSheet.create({
  map: { flex: 1 },
});

const Container = styled.View`
  flex: 1;
  background-color: #0f172a;
`;

const OverlayTop = styled.View`
  position: absolute;
  top: 60px;
  left: 16px;
  right: 16px;
`;

const OverlayBottom = styled.View`
  position: absolute;
  bottom: 100px;
  left: 16px;
  right: 16px;
`;
