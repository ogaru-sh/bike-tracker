import styled from "@emotion/native";
import { useState } from "react";
import { Alert } from "react-native";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "../hooks/useAuth";

export function SignupForm() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("エラー", "メールアドレスとパスワードを入力してください");
      return;
    }
    if (password.length < 8) {
      Alert.alert("エラー", "パスワードは8文字以上必要です");
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, name || undefined);
    } catch (err: unknown) {
      Alert.alert("登録失敗", err instanceof Error ? err.message : "不明なエラー");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Input label="名前（任意）" placeholder="タロウ" value={name} onChangeText={setName} />
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
      <Button label="アカウント作成" loading={loading} onPress={handleSignup} />
    </Container>
  );
}

const Container = styled.View`
  gap: 4px;
`;
