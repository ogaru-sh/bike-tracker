import { ActivityIndicator } from "react-native";
import styled from "@emotion/native";

export function LoadingScreen() {
  return (
    <Container>
      <ActivityIndicator size="large" color="#3B82F6" />
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #0f172a;
`;
