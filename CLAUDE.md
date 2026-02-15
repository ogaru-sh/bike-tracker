# CLAUDE.md

## プロジェクト: バイクトラッカー

バイク走行ルートを記録・管理するiOSアプリ。

## コマンド

```bash
# バックエンド
cd api
npm run dev          # ローカル開発サーバー (localhost:8787)
npm run deploy       # Cloudflare Workers デプロイ
npm run db:generate  # Drizzle マイグレーション生成
npm run db:migrate:local   # ローカルDB適用
npm run db:migrate:remote  # 本番DB適用

# フロントエンド
cd app
npx expo start       # Metro bundler 起動
npx expo run:ios     # iOS ビルド & 実行
npx expo prebuild    # ネイティブプロジェクト生成
```

## 重要なルール

- フロントエンドは **Bulletproof React Feature パターン** に従う
- スタイリングは **@emotion/native の styled** のみ使用（StyleSheet.create 禁止）
- feature 間の import は **barrel export（index.ts）経由** のみ
- app/ ディレクトリは **ルーティングのみ**（ロジックを書かない）
- API は **Zod バリデーション必須**
- エラーは **統一エラーレスポンス形式**（`{ error: { code, message, details? } }`）
- ダークテーマ: 背景 `#0F172A` / カード `#1E293B` / テキスト `#F8FAFC`
- 地図は **MapLibre + OpenFreeMap**（Google Maps APIは不使用）
- ジオコーディングは **Nominatim**（無料、1秒1リクエスト制限）

## パスエイリアス

`@/` = `src/`（tsconfig.json + Expo tsconfigPaths で解決）

## 技術スタック

- **フロント**: React Native + Expo, Expo Router, MapLibre, Zustand, Emotion Native
- **バック**: Cloudflare Workers + Hono, D1 + Drizzle ORM, Zod, jose (JWT)
- **認証**: メール+パスワード / Apple ID
- **GPS**: react-native-background-geolocation（5秒間隔、30秒バッチ送信）
- **リンター/フォーマッター**: Biome（ルートの biome.json で全パッケージ統一）
- **パッケージマネージャー**: npm（yarn/pnpm/bun は使わない）

## 技術判断メモ

### パッケージマネージャー: npm を採用（2025-02）

bun（高速だがExpoとの互換性が不完全）、yarn（npmとの差が縮小）、
pnpm（モノレポ向きだが導入コスト）を検討した結果、
npm を採用。理由: Node.js標準で安定性最高、Expo/wrangler との互換性問題なし、
個人開発ではインストール速度の差が開発効率に大きく影響しない。
