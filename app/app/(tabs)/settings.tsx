import styled from "@emotion/native";
import Constants from "expo-constants";
import { Alert } from "react-native";
import { Button } from "@/components/Button";
import { TRACKING } from "@/config/constants";
import { useAuth } from "@/features/auth";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("ログアウト", "ログアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      { text: "ログアウト", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <Container>
      <Header>設定</Header>

      <Section>
        <SectionTitle>アカウント</SectionTitle>
        <InfoRow>
          <InfoLabel>名前</InfoLabel>
          <InfoValue>{user?.name || "未設定"}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>メール</InfoLabel>
          <InfoValue>{user?.email || "Apple IDログイン"}</InfoValue>
        </InfoRow>
      </Section>

      <Section>
        <SectionTitle>GPS設定</SectionTitle>
        <InfoRow>
          <InfoLabel>取得間隔</InfoLabel>
          <InfoValue>{TRACKING.INTERVAL_S}秒</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>最小移動距離</InfoLabel>
          <InfoValue>{TRACKING.MIN_DISTANCE_M}m</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>精度フィルター</InfoLabel>
          <InfoValue>{TRACKING.ACCURACY_FILTER_M}m以上は除外</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>バッチ送信間隔</InfoLabel>
          <InfoValue>{TRACKING.BATCH_INTERVAL_S}秒</InfoValue>
        </InfoRow>
      </Section>

      <Section>
        <SectionTitle>アプリ情報</SectionTitle>
        <InfoRow>
          <InfoLabel>バージョン</InfoLabel>
          <InfoValue>{Constants.expoConfig?.version ?? "1.0.0"}</InfoValue>
        </InfoRow>
      </Section>

      <LogoutWrapper>
        <Button label="ログアウト" variant="danger" onPress={handleLogout} />
      </LogoutWrapper>
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
  margin-bottom: 24px;
`;

const Section = styled.View`
  background-color: #1e293b;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
`;

const SectionTitle = styled.Text`
  color: #3b82f6;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 12px 16px 8px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-top-width: 1px;
  border-top-color: #334155;
`;

const InfoLabel = styled.Text`
  color: #f8fafc;
  font-size: 15px;
`;

const InfoValue = styled.Text`
  color: #94a3b8;
  font-size: 15px;
`;

const LogoutWrapper = styled.View`
  margin-top: 16px;
`;
