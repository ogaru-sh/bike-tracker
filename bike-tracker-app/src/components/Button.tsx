import styled from "@emotion/native";
import { ActivityIndicator } from "react-native";

type Variant = "primary" | "danger" | "ghost";

type Props = {
  label: string;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

const COLORS: Record<Variant, { bg: string; border: string }> = {
  primary: { bg: "#3B82F6", border: "#3B82F6" },
  danger: { bg: "#EF4444", border: "#EF4444" },
  ghost: { bg: "transparent", border: "#334155" },
};

export function Button({
  label,
  variant = "primary",
  loading = false,
  disabled = false,
  onPress,
}: Props) {
  const { bg, border } = COLORS[variant];
  return (
    <Container
      bg={bg}
      border={border}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <Label ghost={variant === "ghost"}>{label}</Label>
      )}
    </Container>
  );
}

const Container = styled.TouchableOpacity<{ bg: string; border: string }>`
  background-color: ${(p) => p.bg};
  border-color: ${(p) => p.border};
  border-width: 1px;
  border-radius: 12px;
  padding: 16px;
  align-items: center;
`;

const Label = styled.Text<{ ghost: boolean }>`
  color: ${(p) => (p.ghost ? "#94A3B8" : "#FFF")};
  font-size: 16px;
  font-weight: 700;
`;
