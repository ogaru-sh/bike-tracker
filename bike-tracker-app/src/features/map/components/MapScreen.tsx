/**
 * メイン地図画面
 * MapLibre は要 prebuild のため、初期段階では expo-location の
 * 地図なしビューで代替。MapLibre 導入後に MapView コンポーネントに差し替え。
 */
import { Alert } from "react-native";
import styled from "@emotion/native";
import { useTracking, TrackingControls, TrackingStats } from "@/features/tracking";
import { SearchBar } from "./SearchBar";

export function MapScreen() {
  const tracking = useTracking();

  const handleStart = async () => {
    try {
      await tracking.start();
    } catch (err: any) {
      Alert.alert("エラー", err.message);
    }
  };

  const handleStop = async () => {
    try {
      await tracking.stop();
      Alert.alert("完了", "ルートを保存しました");
    } catch (err: any) {
      Alert.alert("エラー", err.message);
    }
  };

  return (
    <Container>
      {/* MapLibre prebuild 後にここを <MapView> に差し替え */}
      <MapPlaceholder>
        {tracking.currentLocation ? (
          <LocationText>
            📍 {tracking.currentLocation.lat.toFixed(4)}, {tracking.currentLocation.lon.toFixed(4)}
          </LocationText>
        ) : (
          <LocationText>🗺 地図を読み込み中...</LocationText>
        )}
      </MapPlaceholder>

      <SearchBar />

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
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: #0f172a;
`;

const MapPlaceholder = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #1e293b;
`;

const LocationText = styled.Text`
  color: #94a3b8;
  font-size: 16px;
`;
