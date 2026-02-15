import styled from "@emotion/native";

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
        <ButtonIcon>{isTracking ? "⏹" : "⏺"}</ButtonIcon>
        <ButtonLabel>{isTracking ? "記録停止" : "記録開始"}</ButtonLabel>
      </TrackingButton>
    </Wrapper>
  );
}

const Wrapper = styled.View`
  position: absolute;
  bottom: 32px;
  left: 0;
  right: 0;
  align-items: center;
`;

const TrackingButton = styled.TouchableOpacity<{ bg: string }>`
  flex-direction: row;
  align-items: center;
  background-color: ${(p) => p.bg};
  border-radius: 30px;
  padding: 14px 32px;
  gap: 8px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 8;
`;

const ButtonIcon = styled.Text`
  font-size: 20px;
`;

const ButtonLabel = styled.Text`
  color: #fff;
  font-size: 17px;
  font-weight: 800;
`;
