---
name: styled-component
description: Emotion Native styled の書き方とデザイントークン。UIコンポーネント作成時に参照する。
---

# スタイリングガイド

## 基本ルール

- `@emotion/native` の `styled` のみ使用
- `StyleSheet.create()` は禁止
- styled コンポーネントはファイル末尾にまとめて定義

## 書き方

```typescript
import styled from "@emotion/native";

export function MyScreen() {
  return (
    <Container>
      <Card>
        <Title>タイトル</Title>
        <SubText>サブテキスト</SubText>
      </Card>
    </Container>
  );
}

// ── Styled ──────────────────────
const Container = styled.View`
  flex: 1;
  background-color: #0f172a;
  padding: 16px;
`;

const Card = styled.View`
  background-color: #1e293b;
  border-radius: 12px;
  padding: 16px;
`;

const Title = styled.Text`
  color: #f8fafc;
  font-size: 18px;
  font-weight: 700;
`;

const SubText = styled.Text`
  color: #94a3b8;
  font-size: 14px;
  margin-top: 4px;
`;
```

## デザイントークン

### カラー

| 用途 | カラーコード |
|------|------------|
| 背景（最深） | `#0F172A` |
| カード背景 | `#1E293B` |
| ボーダー | `#334155` |
| テキスト（主） | `#F8FAFC` |
| テキスト（副） | `#94A3B8` |
| テキスト（薄） | `#64748B` |
| アクセント（青） | `#3B82F6` |
| 成功（緑） | `#22C55E` |
| エラー（赤） | `#EF4444` |
| 警告（黄） | `#F59E0B` |

### サイズ

| 用途 | 値 |
|------|-----|
| カード角丸 | 12px |
| チップ角丸 | 20px |
| ボタン丸角丸 | 50px |
| パディング（標準） | 16px |
| パディング（小） | 8px |
| テキスト（大） | 22px |
| テキスト（中） | 18px |
| テキスト（標準） | 14px |
| テキスト（小） | 12px |
