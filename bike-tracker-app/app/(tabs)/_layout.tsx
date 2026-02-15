import styled from "@emotion/native";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0F172A",
          borderTopColor: "#1E293B",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#64748B",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "マップ",
          tabBarIcon: ({ color }) => <TabIcon style={{ color }}>🗺</TabIcon>,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "履歴",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabIcon style={{ color }}>📋</TabIcon>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "設定",
          tabBarIcon: ({ color }) => <TabIcon style={{ color }}>⚙️</TabIcon>,
        }}
      />
    </Tabs>
  );
}

const TabIcon = styled.Text`
  font-size: 24px;
`;
