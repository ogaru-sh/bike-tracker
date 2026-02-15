import styled from "@emotion/native";
import { formatDistance, formatDuration, formatSpeed } from "@/utils/format";

type Props = {
  speed: number;
  elapsedS: number;
  distanceM: number;
};

export function TrackingStats({ speed, elapsedS, distanceM }: Props) {
  return (
    <Overlay>
      <StatItem>
        <StatValue>{formatSpeed(speed)}</StatValue>
        <StatUnit>km/h</StatUnit>
      </StatItem>
      <Divider />
      <StatItem>
        <StatValue>{formatDuration(elapsedS)}</StatValue>
        <StatUnit>時間</StatUnit>
      </StatItem>
      <Divider />
      <StatItem>
        <StatValue>{formatDistance(distanceM)}</StatValue>
        <StatUnit>距離</StatUnit>
      </StatItem>
    </Overlay>
  );
}

const Overlay = styled.View`
  position: absolute;
  bottom: 100px;
  left: 16px;
  right: 16px;
  flex-direction: row;
  background-color: rgba(15, 23, 42, 0.92);
  border-radius: 16px;
  padding: 14px 8px;
  justify-content: space-around;
  align-items: center;
`;

const StatItem = styled.View`
  align-items: center;
`;

const StatValue = styled.Text`
  color: #f8fafc;
  font-size: 20px;
  font-weight: 800;
`;

const StatUnit = styled.Text`
  color: #94a3b8;
  font-size: 11px;
  margin-top: 2px;
`;

const Divider = styled.View`
  width: 1px;
  height: 32px;
  background-color: #334155;
`;
