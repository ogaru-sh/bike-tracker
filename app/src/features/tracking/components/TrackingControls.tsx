import styled from "@emotion/native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  isTracking: boolean;
  onStart: () => void;
  onStop: () => void;
};

export function TrackingControls({ isTracking, onStart, onStop }: Props) {
  return (
    <Wrapper>
      <TrackingButton
        bg={isTracking ? "#EF4444" : "#22C55E"}
        onPress={isTracking ? onStop : onStart}
        activeOpacity={0.8}
      >
        <Ionicons name={isTracking ? "stop" : "radio-button-on"} size={22} color="#FFF" />
        <ButtonLabel>{isTracking ? "記録停止" : "記録開始"}</ButtonLabel>
      </TrackingButton>
    </Wrapper>
  );
}

const Wrapper = styled.View`
  align-items: center;
`;

const TrackingButton = styled.TouchableOpacity<{ bg: string }>`
  flex-direction: row;
  align-items: center;
  background-color: ${(p) => p.bg};
  border-radius: 28px;
  height: 56px;
  padding: 0 36px;
  gap: 8px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 8;
`;

const ButtonLabel = styled.Text`
  color: #fff;
  font-size: 18px;
  font-weight: 700;
`;
