# AIサポートブラウザ Pro — Phase 1（土台）

Windows 11 専用のアクセシブルAIブラウザ。
Electron + React + TypeScript + Vite + TailwindCSS。

## このPhase 1でできること

| 機能 | 状態 |
|---|---|
| アプリの起動・独自タイトルバー（最小化／最大化／閉じる） | 完成 |
| 16項目のメインメニュー（左サイドバー＋ホームの大ボタン） | 完成 |
| 内蔵ブラウザ（webview・戻る／進む／更新・URL＋検索の兼用欄・ズーム） | 完成 |
| HTTPS確認と警告バー（暗号化されていないページで赤帯） | 完成 |
| ページ読み上げ（Web Speech API・日本語） | 完成 |
| AI画面（ChatGPT／Claude／Gemini／Genspark を内蔵表示） | 完成 |
| アクセシビリティ（文字100〜175％・3テーマ・かんたんモード・ふりがな・ホバー読み上げ） | 完成 |
| 30分休憩通知 | 完成 |
| 設定の保存（localStorage）とリセット | 完成 |
| ヘルプ画面・キーボード操作（Tab／Enter／Alt+H） | 完成 |
| メール・病院・くすり・カレンダー・メモ・相談・お気に入り・履歴・保存ファイル | 準備中画面（Phase 2以降） |
| Firebase同期・自動更新（electron-updater） | Phase 3以降 |

## 使い方（ターミナル不要の方向け）

1. このフォルダを **GitHub Desktop** で新しいリポジトリとして追加してコミット。
2. GitHub で **Releases → タグ `v1.0.0` を作成** すると、GitHub Actions が
   自動で Windows インストーラー（.exe）を作ります。
3. Actions の実行結果ページ下部 **Artifacts → `AIサポートブラウザPro-Setup`**
   からダウンロードして、そのままインストールできます。

（手元でビルドする場合は `npm install` → `npm run build` → `npm run dist`）

## フォルダ構成

```
electron/main.js        アプリ本体（ウィンドウ・権限・IPC）
electron/preload.js     安全な橋渡し（contextIsolation 有効）
src/App.tsx             画面の切り替え
src/context/            設定の保存と反映
src/components/         タイトルバー・メニュー・共通枠・休憩通知
src/screens/            各画面
src/index.css           デザイントークン（色・文字・テーマ）
.github/workflows/      Windowsインストーラーの自動作成
```

## 設計上の約束

- `contextIsolation: true` / `nodeIntegration: false` を必ず維持する。
- 外部リンクはアプリ内で開かず、既定ブラウザへ渡す（画面の乗っ取り防止）。
- カメラ・位置情報などの権限は既定で拒否。必要になったら明示的に許可する。
- 色は必ず CSS 変数（`--c-*`）経由で使う。直接の色指定を増やさない。
- ボタンの最小高さは 3.5rem。文字は 175％まで拡大しても崩れないこと。
