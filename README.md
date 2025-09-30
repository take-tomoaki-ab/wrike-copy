# Wrike Copy - Chrome Extension

Wrikeのチケット URLをコピーする際に、自動的にSlack用のHTMLリンク形式に変換するChrome拡張機能です。

## 機能

- WrikeのチケットURLをコピーすると、自動的にチケットタイトル付きのHTMLリンクとしてクリップボードに保存
- Slackに貼り付けると、URLではなくチケットタイトルがリンクとして表示される
- 通常のテキストとHTMLの両形式でクリップボードに保存されるため、どのアプリケーションでも使用可能

## インストール方法

1. このリポジトリをクローンまたはダウンロード
2. Chromeで `chrome://extensions/` を開く
3. 右上の「デベロッパーモード」を有効にする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. `wrike-copy` フォルダを選択

## 使い方

1. Wrikeでチケットを開く
2. URLバーからURLをコピー（Cmd+C / Ctrl+C）
3. Slackに貼り付ける（Cmd+V / Ctrl+V）
4. URLではなくチケットタイトルがリンクとして表示される

## 動作の仕組み

この拡張機能は以下の2つの方法でコピーイベントを監視しています：

1. **copyイベントリスナー**: ユーザーがテキストをコピーする際に発火
2. **clipboard.writeText APIの上書き**: プログラムによるクリップボード操作をキャッチ

WrikeのURLが検出されると：
- ページからチケットタイトルを取得（`.title__field` セレクタを使用）
- HTMLリンク形式 `<a href="URL">タイトル</a>` を生成
- プレーンテキストとHTMLの両形式でクリップボードに保存

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
├── manifest.json    # 拡張機能の設定ファイル
├── content.js       # メインのスクリプト
└── README.md        # このファイル
```

## トラブルシューティング

### チケットタイトルが取得できない場合
- Wrikeのページ構造が変更された可能性があります
- `content.js` の `WRIKE_TITLE_SELECTOR` を適切なセレクタに更新してください

### クリップボードへの書き込みが失敗する場合
- ブラウザのセキュリティ設定を確認してください
- コンソール（F12）でエラーメッセージを確認してください

## 開発者向け情報

### カスタマイズ方法

タイトルセレクタの変更：
```javascript
const WRIKE_TITLE_SELECTOR = '.your-custom-selector';
```

### デバッグ

Chromeのデベロッパーツール（F12）のコンソールタブで、以下のログメッセージを確認できます：
- `Wrike URL copied with HTML formatting`
- エラーが発生した場合のエラーメッセージ

## ライセンス

このプロジェクトはプライベート利用を目的としています。

## 更新履歴

- v1.0 - 初回リリース
  - Wrike URLの自動検出
  - HTMLリンク形式への変換
  - Slack対応