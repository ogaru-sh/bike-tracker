import { Alert } from "react-native";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function showConfirm({
  title,
  message,
  confirmLabel = "OK",
  destructive = false,
  onConfirm,
}: ConfirmOptions) {
  Alert.alert(title, message, [
    { text: "キャンセル", style: "cancel" },
    { text: confirmLabel, style: destructive ? "destructive" : "default", onPress: onConfirm },
  ]);
}
