import { useState, useCallback } from "react";
import { FlatList, Keyboard, Alert } from "react-native";
import styled from "@emotion/native";
import { searchPlace } from "../services/geocoding.service";
import { openGoogleMapsNav } from "../services/navigation.service";
import type { GeocodingResult } from "../types";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const items = await searchPlace(query);
      setResults(items);
    } catch {
      Alert.alert("検索失敗", "場所を検索できませんでした");
    } finally {
      setSearching(false);
    }
  }, [query]);

  const handleSelect = useCallback((item: GeocodingResult) => {
    setResults([]);
    setQuery("");
    Keyboard.dismiss();
    openGoogleMapsNav(item.lat, item.lon);
  }, []);

  return (
    <Container>
      <Row>
        <SearchInput
          placeholder="目的地を検索..."
          placeholderTextColor="#64748B"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <NavButton onPress={handleSearch} activeOpacity={0.7}>
          <NavText>{searching ? "..." : "検索"}</NavText>
        </NavButton>
      </Row>
      {results.length > 0 && (
        <ResultList>
          <FlatList
            data={results}
            keyExtractor={(_, i) => String(i)}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <ResultItem onPress={() => handleSelect(item)}>
                <ResultText numberOfLines={2}>{item.displayName}</ResultText>
              </ResultItem>
            )}
          />
        </ResultList>
      )}
    </Container>
  );
}

const Container = styled.View`
  position: absolute;
  top: 60px;
  left: 16px;
  right: 16px;
  z-index: 10;
`;

const Row = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  background-color: rgba(30, 41, 59, 0.95);
  border-radius: 12px;
  padding: 12px 16px;
  color: #f8fafc;
  font-size: 15px;
`;

const NavButton = styled.TouchableOpacity`
  background-color: #3b82f6;
  border-radius: 12px;
  padding: 12px 16px;
  justify-content: center;
`;

const NavText = styled.Text`
  color: #fff;
  font-weight: 700;
  font-size: 14px;
`;

const ResultList = styled.View`
  background-color: rgba(30, 41, 59, 0.98);
  border-radius: 12px;
  margin-top: 4px;
  max-height: 200px;
`;

const ResultItem = styled.TouchableOpacity`
  padding: 12px 16px;
  border-bottom-width: 1px;
  border-bottom-color: #334155;
`;

const ResultText = styled.Text`
  color: #e2e8f0;
  font-size: 14px;
`;
