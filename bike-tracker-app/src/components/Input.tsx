import styled from "@emotion/native";
import type { TextInputProps } from "react-native";

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, ...props }: Props) {
  return (
    <Wrapper>
      {label && <LabelText>{label}</LabelText>}
      <StyledInput hasError={!!error} placeholderTextColor="#64748B" {...props} />
      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
}

const Wrapper = styled.View`
  margin-bottom: 12px;
`;

const LabelText = styled.Text`
  color: #94a3b8;
  font-size: 14px;
  margin-bottom: 6px;
`;

const StyledInput = styled.TextInput<{ hasError: boolean }>`
  background-color: #1e293b;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  color: #f8fafc;
  border-width: 1px;
  border-color: ${(p) => (p.hasError ? "#EF4444" : "#334155")};
`;

const ErrorText = styled.Text`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
`;
