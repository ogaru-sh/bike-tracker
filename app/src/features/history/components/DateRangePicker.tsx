import styled from "@emotion/native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useCallback, useState } from "react";
import { View } from "react-native";

type DateRange = { from: Date; to: Date };

type Props = {
  initial: DateRange;
  onApply: (range: DateRange) => void;
};

export function DateRangePicker({ initial, onApply }: Props) {
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);

  const handleFromChange = useCallback(
    (_: DateTimePickerEvent, date?: Date) => {
      if (!date) return;
      setFrom(date);
      const newTo = date > to ? date : to;
      if (date > to) setTo(date);
      onApply({ from: date, to: newTo });
    },
    [to, onApply],
  );

  const handleToChange = useCallback(
    (_: DateTimePickerEvent, date?: Date) => {
      if (!date) return;
      setTo(date);
      const newFrom = date < from ? date : from;
      if (date < from) setFrom(date);
      onApply({ from: newFrom, to: date });
    },
    [from, onApply],
  );

  return (
    <Container>
      <Row>
        <FieldBox>
          <FieldLabel>開始</FieldLabel>
          <View>
            <DateTimePicker
              value={from}
              mode="date"
              display="compact"
              onChange={handleFromChange}
              maximumDate={new Date()}
              locale="ja"
              themeVariant="dark"
            />
          </View>
        </FieldBox>
        <Arrow>→</Arrow>
        <FieldBox>
          <FieldLabel>終了</FieldLabel>
          <View>
            <DateTimePicker
              value={to}
              mode="date"
              display="compact"
              onChange={handleToChange}
              maximumDate={new Date()}
              locale="ja"
              themeVariant="dark"
            />
          </View>
        </FieldBox>
      </Row>
    </Container>
  );
}

const Container = styled.View`
  background-color: #1e293b;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const FieldBox = styled.View`
  flex: 1;
  align-items: center;
  gap: 6px;
`;

const FieldLabel = styled.Text`
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
`;

const Arrow = styled.Text`
  color: #475569;
  font-size: 18px;
`;
