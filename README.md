# 🏍 バイクトラッカー

バイク走行ルートをバックグラウンドGPSで記録・管理するiOSアプリ。

![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-52-000020?logo=expo)
![Hono](https://img.shields.io/badge/Hono-4.6-E36002?logo=hono)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-D1-F38020?logo=cloudflare)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)

---

## 機能

- **ルート記録** — バックグラウンドGPSで走行ルートを自動記録。アプリを閉じても記録継続
- **地図表示** — MapLibre + OpenFreeMapによるリアルタイム地図。現在地・ルートを描画
- **履歴管理** — 走行履歴の一覧表示。期間フィルター（1週間/1ヶ月/1年/全期間）と合計走行距離
- **ルート詳細** — 地図上にルートを描画し、距離・時間・平均速度・最高速度を表示
- **ナビゲーション** — 目的地を検索してGoogle Mapsアプリでナビを起動（ルート記録と併用可能）
- **タイトル自動生成** — 記録完了時に出発地→到着地を逆ジオコーディングで自動命名
- **認証** — メール+パスワード / Apple IDログイン対応

---

## 技術スタック

### フロントエンド

| 技術 | 用途 |
|------|------|
| React Native + Expo | iOSアプリ |
| Expo Router | ファイルベースルーティング |
| MapLibre React Native | 地図描画（無料） |
| OpenFreeMap | ベクタータイル配信（無料・無制限） |
| react-native-background-geolocation | バックグラウンドGPS追跡 |
| Nominatim (OSM) | 住所検索・逆ジオコーディング（無料） |
| Zustand | 状態管理 |
| Emotion Native | styled-components |

### バックエンド

| 技術 | 用途 |
|------|------|
| Cloudflare Workers | サーバーレスランタイム |
| Hono | Webフレームワーク |
| Cloudflare D1 | SQLiteデータベース |
| Drizzle ORM | 型安全なDBアクセス |
| Zod | バリデーション |
| jose | JWT認証 |

---

## アーキテクチャ

### Bulletproof React Feature パターン

```
app/
├── app/                    # ルーティング層（薄いラッパーのみ）
│   ├── (auth)/             #   ログイン・サインアップ
│   └── (tabs)/             #   マップ・履歴・設定
├── src/
│   ├── features/           # Feature モジュール
│   │   ├── auth/           #   認証
│   │   ├── tracking/       #   GPS追跡
│   │   ├── map/            #   地図・検索・ナビ
│   │   ├── history/        #   履歴
│   │   └── settings/       #   設定
│   ├── components/         # 共有UIコンポーネント
│   ├── lib/                # APIクライアント・ストレージ
│   ├── utils/              # フォーマット等
│   └── config/             # 定数
```

---

## セットアップ

### 前提条件

- Node.js 18+
- npm（yarn/pnpm/bun は使わない）
- Xcode 15+（Mac）
- Cloudflare アカウント（workers.dev サブドメイン登録済み）

### 1. 依存関係インストール

```bash
npm install        # ルート
cd api && npm install
cd ../app && npm install
```

### 2. バックエンド（API）初期セットアップ

```bash
cd api

# Cloudflare にログイン
npx wrangler login

# D1 データベース作成（本番）
npx wrangler d1 create bike-tracker-db
# → 出力される database_id を wrangler.toml にセット

# D1 データベース作成（ステージング）
npx wrangler d1 create bike-tracker-db-staging
# → 出力される database_id を wrangler.toml の [env.staging] にセット

# JWT シークレット設定
npx wrangler secret put JWT_SECRET                # 本番
npx wrangler secret put JWT_SECRET --env staging  # ステージング

# マイグレーション生成
npm run db:generate
```

### 3. フロントエンド初期セットアップ

```bash
cd app
npx expo prebuild --clean
npx expo run:ios --device "iPhone 17 Pro"  # シミュレーター
```

ネイティブモジュール追加後は `npx expo prebuild --clean` → `npx expo run:ios` が必要。

---

## 開発コマンド

### バックエンド（api/）

| コマンド | 説明 |
|---------|------|
| `npm run dev` | ローカル開発サーバー（localhost:8788、ローカルD1） |
| `npm run dev:staging` | ステージングDB接続で開発（`--remote`） |
| `npm run db:generate` | Drizzle マイグレーションファイル生成 |
| `npm run db:migrate:local` | ローカルD1にマイグレーション適用 |
| `npm run db:migrate:staging` | ステージングD1にマイグレーション適用 |
| `npm run db:migrate:remote` | 本番D1にマイグレーション適用 |
| `npm run db:seed` | ローカルDBにテストユーザー作成 |
| `npm run deploy` | 本番デプロイ |
| `npm run deploy:staging` | ステージングデプロイ |

### フロントエンド（app/）

```bash
npx expo start                              # Metro bundler 起動
npx expo run:ios                            # iOS ビルド & 実行
npx expo run:ios --device "iPhone 17 Pro"   # シミュレーター指定
npx expo prebuild --clean                   # ネイティブプロジェクト再生成
```

---

## デプロイ

### デプロイ先URL

| 環境 | URL |
|------|-----|
| 本番 | https://bike-tracker-api.ogaru-sosh.workers.dev |
| ステージング | https://bike-tracker-api-staging.ogaru-sosh.workers.dev |

### デプロイ手順

```bash
cd api

# ステージング
npm run db:migrate:staging   # DBマイグレーション
npm run deploy:staging       # Workers デプロイ

# 本番
npm run db:migrate:remote    # DBマイグレーション
npm run deploy               # Workers デプロイ
```

### 注意事項

- PBKDF2 のイテレーション回数は Cloudflare Workers の制限により **100,000回**（ブラウザ標準の 600,000 ではない）
- `JWT_SECRET` は `wrangler secret put` で環境ごとに設定が必要
- ローカル開発時のDBはローカルD1（`.wrangler/state/` 内）を使用

---

## ライセンス

MIT
