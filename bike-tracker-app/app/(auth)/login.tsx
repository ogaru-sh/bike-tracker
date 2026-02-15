import styled from "@emotion/native";
import { useRouter } from "expo-router";
import { AppleLoginButton, LoginForm } from "@/features/auth";

export default function LoginPage() {
  const router = useRouter();

  return (
    <Container>
      <Content>
        <AppIcon>🏍</AppIcon>
        <AppTitle>バイクトラッカー</AppTitle>
        <Subtitle>ログイン</Subtitle>

        <LoginForm />
        <AppleLoginButton />

        <SwitchRow>
          <SwitchText>アカウントをお持ちでない方は </SwitchText>
          <SwitchLink onPress={() => router.push("/(auth)/signup")}>
            <SwitchLinkText>新規登録</SwitchLinkText>
          </SwitchLink>
        </SwitchRow>
      </Content>
    </Container>
  );
}

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #0f172a;
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: 40px 24px;
`;

const AppIcon = styled.Text`
  font-size: 48px;
  text-align: center;
`;

const AppTitle = styled.Text`
  color: #f8fafc;
  font-size: 28px;
  font-weight: 800;
  text-align: center;
  margin-top: 8px;
`;

const Subtitle = styled.Text`
  color: #94a3b8;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 32px;
`;

const SwitchRow = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: 24px;
`;

const SwitchText = styled.Text`
  color: #94a3b8;
  font-size: 14px;
`;

const SwitchLink = styled.TouchableOpacity``;

const SwitchLinkText = styled.Text`
  color: #3b82f6;
  font-size: 14px;
  font-weight: 600;
`;
