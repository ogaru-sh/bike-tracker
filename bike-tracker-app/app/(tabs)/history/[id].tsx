import { useLocalSearchParams } from "expo-router";
import { RouteDetailScreen } from "@/features/history";

export default function RouteDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;
  return <RouteDetailScreen routeId={id} />;
}
