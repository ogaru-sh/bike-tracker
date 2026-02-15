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
- Xcode 15+（Mac）
- Apple Developer Program 加入済み
- Cloudflare アカウント

### バックエンド

```bash
cd api
npm install
npx wrangler d1 create bike-tracker-db
npx drizzle-kit generate
npm run dev
```

### フロントエンド

```bash
cd app
npm install
npx expo prebuild --platform ios
cd ios && pod install && cd ..
npx expo run:ios
```

---

## ライセンス

MIT
