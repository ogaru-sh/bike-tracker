import { useLocalSearchParams } from "expo-router";
import { RouteDetailScreen } from "@/features/history/components/RouteDetailScreen";

export default function RouteDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;
  return <RouteDetailScreen routeId={id} />;
}
