import styled from "@emotion/native";
import { useState } from "react";
import { Alert } from "react-native";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "../hooks/useAuth";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("エラー", "メールアドレスとパスワードを入力してください");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      Alert.alert("ログイン失敗", err instanceof Error ? err.message : "不明なエラー");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Input
        label="メールアドレス"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="パスワード"
        placeholder="8文字以上"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button label="ログイン" loading={loading} onPress={handleLogin} />
    </Container>
  );
}

const Container = styled.View`
  gap: 4px;
`;
