---
name: debug-app
description: バグ調査・修正の手順。エラーログの確認、原因特定、修正、テストの流れ。
---

# デバッグガイド

## 手順

### 1. エラー情報の収集

- Metro bundler のコンソールログ確認
- `console.error` / `console.warn` の出力
- React Native のレッドスクリーンのスタックトレース

### 2. バックエンドのデバッグ

```bash
cd api
npm run dev
# → localhost:8787 のログを確認
# → wrangler tail で本番ログ確認
npx wrangler tail
```

### 3. フロントエンドのデバッグ

```bash
cd app
npx expo start
# → Metro のログ確認
# → React DevTools で状態確認
```

### 4. 型エラー

```bash
# TypeScript チェック
npx tsc --noEmit

# Drizzle の型再生成
npx drizzle-kit generate
```

### 5. よくある問題

| 症状 | 原因 | 対処 |
|------|------|------|
| GPS取得できない | 位置情報パーミッション未許可 | 設定 → プライバシー → 位置情報 で「常に許可」 |
| 地図が表示されない | MapLibre の初期化失敗 | `@maplibre/maplibre-react-native` のバージョン確認 |
| API 401エラー | トークン期限切れ | リフレッシュトークンの処理を確認 |
| Emotion styled の型エラー | props のジェネリクス未指定 | `styled.View<{ active: boolean }>` で明示 |
