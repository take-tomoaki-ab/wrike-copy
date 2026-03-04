# Wrike Copy - Chrome Extension

Wrikeのチケット URLをコピーする際に、自動的にSlack用のHTMLリンク形式に変換するChrome拡張機能です。

## 機能

- WrikeのチケットURLをコピーすると、自動的にチケットタイトル付きのHTMLリンクとしてクリップボードに保存
- Slackに貼り付けると、URLではなくチケットタイトルがリンクとして表示される
- 通常のテキストとHTMLの両形式でクリップボードに保存されるため、どのアプリケーションでも使用可能

## インストール方法

この拡張機能はTypeScriptで開発されているため、ビルドが必要です。

1. このリポジトリをクローンまたはダウンロード
   ```bash
   git clone <repository-url>
   cd wrike-copy
   ```

2. 依存関係のインストールとビルド
   ```bash
   npm install
   npm run build
   ```

3. Chromeで `chrome://extensions/` を開く
4. 右上の「デベロッパーモード」を有効にする
5. 「パッケージ化されていない拡張機能を読み込む」をクリック
6. `wrike-copy/dist` フォルダを選択

## 使い方

以下のいずれかの方法でチケットのリンクをコピーできます：

1. **チケット詳細パネル**の「リンクをこの項目にコピー」ボタン（🔗）
2. **テーブルビュー**でチケット行を右クリック →「リンクをコピー」
3. **テーブルビュー**でチケット行の三点リーダー（⋯）→「リンクをコピー」
4. **左サイドバー**のフォルダ・プロジェクトを右クリックまたは三点リーダー →「リンクをコピー」

Slackに貼り付けると（Cmd+V / Ctrl+V）、URLではなくチケットタイトルがリンクとして表示されます。

## 動作の仕組み

`navigator.clipboard.writeText` を上書きして、WrikeのURLが書き込まれた際にHTML形式のリンクへ変換します。

コピー操作が行われると：
- コピー直前のインタラクション（右クリック・三点リーダークリック）からチケットタイトルを取得
- チケット詳細パネルが開いている場合はパネルのタイトルを使用
- HTMLリンク形式 `<a href="URL">タイトル</a>` を生成
- プレーンテキストとHTMLの両形式でクリップボードに保存

> **技術的補足**: content scriptを `world: "MAIN"` で実行することで、Wrikeのページスクリプトと同じJS環境上で `writeText` の上書きが機能します。

## 技術仕様

- **Manifest Version**: 3
- **対応サイト**:
  - `https://www.wrike.com/*`
  - `https://wrike.com/*`
- **必要な権限**:
  - `clipboardWrite`: クリップボードへの書き込み

## ファイル構成

```
wrike-copy/
├── src/
│   └── content.ts       # メインのスクリプト（TypeScript）
├── dist/                # ビルド後のファイル（Chromeに読み込むディレクトリ）
│   ├── content.js       # コンパイル済みJavaScript
│   └── manifest.json    # 拡張機能の設定ファイル（コピー）
├── manifest.json        # 拡張機能の設定ファイル（ソース）
├── package.json         # npm設定ファイル
├── tsconfig.json        # TypeScript設定ファイル
└── README.md            # このファイル
```

## トラブルシューティング

### チケットタイトルが取得できない場合
- Wrikeのページ構造が変更された可能性があります
- `src/content.ts` の `WRIKE_TITLE_SELECTOR`（詳細パネル用）や `captureTitle` 関数内のセレクタを確認してください
- 変更後は `npm run build` でビルドし直してください

### クリップボードへの書き込みが失敗する場合
- ブラウザのセキュリティ設定を確認してください
- コンソール（F12）でエラーメッセージを確認してください

## 開発者向け情報

### 開発コマンド

```bash
# 依存関係のインストール
npm install

# ビルド（distフォルダに出力）
npm run build

# ウォッチモード（ファイル変更を監視して自動ビルド）
npm run watch

# ビルドファイルのクリーンアップ
npm run clean
```

### カスタマイズ方法

タイトルセレクタの変更（`src/content.ts`）：
```typescript
const WRIKE_TITLE_SELECTOR = '.your-custom-selector';
```

変更後は `npm run build` でビルドしてください。

### デバッグ

Chromeのデベロッパーツール（F12）のコンソールタブで、以下のログメッセージを確認できます：
- `Wrike URL copied with HTML formatting`
- エラーが発生した場合のエラーメッセージ

## ライセンス

このプロジェクトはプライベート利用を目的としています。

## 更新履歴

### v1.1.0 (2026-03-04)
- Wrikeアップデートによりコピー機能が動作しなくなった問題を修正
  - content scriptを `world: "MAIN"` で実行するよう変更し、`writeText` 上書きを有効化
  - チケットタイトルのセレクタを `[aria-label="作業項目タイトル"]` に更新
- テーブルビューの右クリックメニュー・三点リーダーからのコピーに対応
- 左サイドバーの右クリックメニュー・三点リーダーからのコピーに対応
- タイトルキャプチャのロジックをリファクタ（MutationObserver → イベントリスナー）

### v1.0.0 (2026-01-20)
- TypeScriptへの再実装
  - より型安全なコードベース
  - ビルドプロセスの導入（npm scripts）
- 共通機能の最適化
- 開発環境の改善

### v0.1.0 (初回リリース)
- Wrike URLの自動検出
- HTMLリンク形式への変換
- Slack対応