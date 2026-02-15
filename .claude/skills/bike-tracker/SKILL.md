---
name: bike-tracker
description: バイクルートトラッカーアプリの開発ガイド。プロジェクト構成、技術スタック、コーディング規約、feature パターンを把握した上でコード生成・修正を行う。
---

# バイクトラッカー プロジェクトガイド

## アーキテクチャ

### フロントエンド: Bulletproof React Feature パターン

```
app/          → ルーティング層（薄いラッパーのみ）
src/features/ → ドメインごとの独立モジュール
src/components/ → 共有UIコンポーネント
src/lib/      → 外部ライブラリラッパー
src/utils/    → 純粋ユーティリティ
src/config/   → 定数・設定
```

### Feature モジュールの構造

```
src/features/{feature-name}/
├── api/          # APIコール関数
├── components/   # UIコンポーネント（styled-components）
├── hooks/        # カスタムフック
├── services/     # ビジネスロジック・外部サービス連携
├── stores/       # Zustand ストア
├── types/        # 型定義
└── index.ts      # barrel export（公開API）
```

### Feature 一覧
- **auth**: 認証（メール+パスワード、Apple ID）
- **tracking**: GPS追跡（バックグラウンド記録、バッチ送信）
- **map**: 地図（MapLibre、目的地検索、ナビ連携）
- **history**: 履歴（一覧、詳細、期間フィルター、統計）
- **settings**: 設定（GPS設定表示、ログアウト）

### バックエンドの構造

```
bike-tracker-api/src/
├── index.ts          # エントリーポイント（Honoアプリ）
├── routes/           # APIルートハンドラ
├── middleware/        # 認証・エラーハンドリング
├── services/         # ビジネスロジック
├── db/               # Drizzle スキーマ・マイグレーション
├── validators/       # Zod スキーマ
├── types/            # 型定義
└── utils/            # ユーティリティ（JWT、距離計算、エラー）
```

## コーディング規約

### スタイリング
- `@emotion/native` の `styled` を使用
- `StyleSheet.create()` は使わない
- styled コンポーネントはファイル末尾にまとめて定義

### デザインテーマ（ダークモード）
- 背景: `#0F172A`（最深）、`#1E293B`（カード）、`#334155`（ボーダー）
- テキスト: `#F8FAFC`（主）、`#94A3B8`（副）、`#64748B`（薄い）
- アクセント: `#3B82F6`（青）、`#22C55E`（緑）、`#EF4444`（赤）
- 角丸: 12px（カード）、20px（チップ）、50px（ボタン丸）

## DB テーブル

- **users**: id, email, apple_id, password_hash, name
- **routes**: id, user_id, title, started_at, ended_at, distance_m, duration_s, avg_speed_kmh, max_speed_kmh, status
- **route_points**: id, route_id, latitude, longitude, altitude, speed, heading, accuracy, recorded_at

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /auth/signup | メール登録 |
| POST | /auth/login | メールログイン |
| POST | /auth/apple | Apple IDログイン |
| POST | /auth/refresh | トークンリフレッシュ |
| POST | /routes | ルート記録開始 |
| GET | /routes | 履歴一覧（期間フィルター） |
| GET | /routes/:id | ルート詳細 |
| PATCH | /routes/:id/stop | 記録停止 |
| PATCH | /routes/:id | タイトル編集 |
| DELETE | /routes/:id | ルート削除 |
| POST | /routes/:id/points | GPSポイントバッチ送信 |
