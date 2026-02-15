import { Alert, Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth } from "../hooks/useAuth";

export function AppleLoginButton() {
  const { loginWithApple } = useAuth();

  if (Platform.OS !== "ios") return null;

  const handlePress = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        Alert.alert("エラー", "Apple IDトークンが取得できませんでした");
        return;
      }

      const name = credential.fullName
        ? `${credential.fullName.familyName ?? ""}${credential.fullName.givenName ?? ""}`.trim()
        : undefined;

      await loginWithApple(credential.identityToken, name || undefined);
    } catch (err: any) {
      if (err.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("エラー", "Apple IDログインに失敗しました");
      }
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
      cornerRadius={12}
      style={{ height: 50, marginTop: 16 }}
      onPress={handlePress}
    />
  );
}
