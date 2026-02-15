/**
 * Google Maps アプリ連携（URLスキーム）
 * アプリ起動は無料。API呼び出しなし。
 */
import { Linking, Platform } from "react-native";

/** 座標指定でナビ起動 */
export function openGoogleMapsNav(lat: number, lon: number): void {
  const googleMapsUrl = `comgooglemaps://?daddr=${lat},${lon}&directionsmode=driving`;
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;

  if (Platform.OS === "ios") {
    Linking.canOpenURL("comgooglemaps://").then((supported) => {
      Linking.openURL(supported ? googleMapsUrl : webUrl);
    });
  } else {
    Linking.openURL(webUrl);
  }
}

/** テキスト検索でナビ起動 */
export function openGoogleMapsNavByQuery(query: string): void {
  const googleMapsUrl = `comgooglemaps://?daddr=${encodeURIComponent(query)}&directionsmode=driving`;
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving`;

  if (Platform.OS === "ios") {
    Linking.canOpenURL("comgooglemaps://").then((supported) => {
      Linking.openURL(supported ? googleMapsUrl : webUrl);
    });
  } else {
    Linking.openURL(webUrl);
  }
}
