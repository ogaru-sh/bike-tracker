---
name: new-feature
description: バイクトラッカーアプリに新しいfeatureモジュールを追加する。Bulletproof Reactパターンに従い、api/components/hooks/services/stores/types/index.tsの構成で作成する。
---

# 新Feature追加ガイド

## 手順

### 1. ディレクトリ作成

```bash
mkdir -p src/features/{name}/{api,components,hooks,services,stores,types}
```

### 2. barrel export 作成

`src/features/{name}/index.ts` に公開するものだけ export する。

### 3. コンポーネント作成

- 画面コンポーネントは `components/{Name}Screen.tsx`
- Emotion styled でスタイリング（ファイル末尾にまとめる）

### 4. hooks 作成

- API呼び出しは `hooks/use{Name}.ts`
- Zustand ストアは `stores/{name}.store.ts`

### 5. app/ にルート追加

- `app/(tabs)/` 以下にファイル追加
- 画面コンポーネントを import して返すだけ

## チェックリスト

- [ ] barrel export（index.ts）に公開APIを追加
- [ ] 他 feature からの import は index.ts 経由のみ
- [ ] ローディング/エラー/空状態のUIを実装
- [ ] TypeScript strict エラーなし
