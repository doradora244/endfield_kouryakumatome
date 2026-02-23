# Endfield 情報まとめサイト

このフォルダは静的サイトです。`index.html` をそのまま公開できます。

## MVPページ

- `index.html` : トップ
- `characters.html` : キャラ一覧（検索・フィルタ）
- `character.html?id=<character_id>` : キャラ詳細
- `materials.html` : 素材一覧 + 逆引き
- `calculator.html` : 育成コスト計算（簡易）
- `updates.html` : 更新履歴

## データファイル

- `data/characters.json`
- `data/character_stats.json`
- `data/character_skills.json`
- `data/materials.json`
- `data/upgrade_costs.json`
- `data/updates.json`

## 設計メモ

- 仕様書（日本語）: `docs/END_FIELD_SPEC.md`
- Claude向け実装メモ: `claude.md`

## 公開方法（GitHub Pages）

1. GitHubで新しいリポジトリを作成（例: `endfield-guide`）
2. このフォルダで以下を実行

```powershell
git init
git add .
git commit -m "Initial Endfield site"
git branch -M main
git remote add origin https://github.com/<your-name>/endfield-guide.git
git push -u origin main
```

3. GitHubのリポジトリ画面で `Settings > Pages` を開く
4. `Build and deployment` で以下を選択
- `Source`: `Deploy from a branch`
- `Branch`: `main` / `/(root)`
5. 数分待って公開URLを確認
- `https://<your-name>.github.io/endfield-guide/`

## 別案（最速）

- Netlify / Cloudflare Pages にこのフォルダをドラッグ&ドロップでも公開できます。

## 更新方法

```powershell
git add .
git commit -m "Update site content"
git push
```
