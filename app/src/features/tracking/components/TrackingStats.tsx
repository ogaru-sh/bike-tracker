import styled from "@emotion/native";
import { formatDistance, formatDuration, formatSpeed } from "@/utils/format";

type Props = {
  speed: number;
  elapsedS: number;
  distanceM: number;
};

export function TrackingStats({ speed, elapsedS, distanceM }: Props) {
  return (
    <StatsCard>
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
    </StatsCard>
  );
}

const StatsCard = styled.View`
  flex-direction: row;
  background-color: rgba(30, 41, 59, 0.95);
  border-radius: 20px;
  padding: 16px 12px;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 12px;
  border-top-width: 2px;
  border-top-color: #3b82f6;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 8;
`;

const StatItem = styled.View`
  align-items: center;
`;

const StatValue = styled.Text`
  color: #f8fafc;
  font-size: 24px;
  font-weight: 800;
`;

const StatUnit = styled.Text`
  color: #94a3b8;
  font-size: 11px;
  margin-top: 2px;
`;

const Divider = styled.View`
  width: 1px;
  height: 36px;
  background-color: #475569;
`;
