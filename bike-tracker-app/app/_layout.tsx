/**
 * ルートレイアウト
 * useEffect 排除: 認証リダイレクトは <Redirect> で宣言的に。
 * 初期化はストアの getState().initialize() をモジュールスコープで実行。
 */
import { StatusBar } from "expo-status-bar";
import { Redirect, Slot, useSegments } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { useAuth, useAuthStore } from "@/features/auth";
import { LoadingScreen } from "@/components/LoadingScreen";

// モジュールスコープで初期化（useEffect 不要）
useAuthStore.getState().initialize();

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  if (isLoading) return <LoadingScreen />;

  const inAuthGroup = segments[0] === "(auth)";

  if (!isAuthenticated && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isAuthenticated && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <AuthGate />
    </QueryClientProvider>
  );
}
