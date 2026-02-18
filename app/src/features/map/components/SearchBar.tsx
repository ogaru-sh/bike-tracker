import styled from "@emotion/native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Alert, FlatList, Keyboard } from "react-native";
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

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return (
    <Container>
      <PillContainer>
        <Ionicons name="search" size={20} color="#94A3B8" />
        <SearchInput
          placeholder="目的地を検索..."
          placeholderTextColor="#64748B"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searching ? (
          <Ionicons name="ellipsis-horizontal" size={20} color="#64748B" />
        ) : query.length > 0 ? (
          <ClearButton onPress={handleClear} activeOpacity={0.6}>
            <Ionicons name="close-circle" size={20} color="#64748B" />
          </ClearButton>
        ) : null}
      </PillContainer>
      {results.length > 0 && (
        <ResultList>
          <FlatList
            data={results}
            keyExtractor={(_, i) => String(i)}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <ResultItem onPress={() => handleSelect(item)}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#94A3B8"
                  style={{ marginRight: 10 }}
                />
                <ResultText numberOfLines={2}>{item.displayName}</ResultText>
              </ResultItem>
            )}
          />
        </ResultList>
      )}
    </Container>
  );
}

const Container = styled.View``;

const PillContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(30, 41, 59, 0.92);
  border-radius: 28px;
  padding: 0 16px;
  height: 52px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 8;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  padding: 0 12px;
  color: #f8fafc;
  font-size: 16px;
`;

const ClearButton = styled.TouchableOpacity`
  padding: 4px;
`;

const ResultList = styled.View`
  background-color: rgba(30, 41, 59, 0.98);
  border-radius: 20px;
  margin-top: 8px;
  max-height: 200px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 8;
`;

const ResultItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 14px 16px;
  border-bottom-width: 1px;
  border-bottom-color: #334155;
`;

const ResultText = styled.Text`
  flex: 1;
  color: #e2e8f0;
  font-size: 14px;
`;
