# Endfield 情報まとめサイト

静的サイトとして GitHub Pages で公開する構成です。

## ページ

- `index.html` : トップ
- `characters.html` : キャラ一覧（検索・フィルタ）
- `character.html?id=<character_id>` : キャラ詳細
- `materials.html` : 素材一覧 + 逆引き
- `calculator.html` : 育成コスト計算 + ダメージ計算（Stage 1）
- `editor.html` : データ追加ツール（raw JSON 生成）
- `updates.html` : 更新履歴

## データファイル（公開用）

- `data/characters.json`
- `data/materials.json`
- `data/character_skills.json`
- `data/upgrade_costs.json`
- `data/character_stats.json`
- `data/updates.json`

## rawファイル（編集用）

- `raw/characters.source.json`
- `raw/materials.source.json`
- `raw/character_skills.source.json`
- `raw/upgrade_costs.source.json`
- `raw/character_stats.source.json`

`.example.json` はテンプレートです。

## 運用フロー（推奨）

1. `editor.html` でデータ作成し、JSONを保存
2. `raw/*.source.json` に反映
3. インポート一括実行

```powershell
node scripts/import_all_from_raw.js --version=0.1.3
```

4. 整合チェック（単独実行も可能）

```powershell
node scripts/validate_data.js
```

5. 差分をコミットして push

## 取り込みスクリプト（個別）

```powershell
node scripts/import_characters_from_raw.js --version=0.1.3
node scripts/import_materials_from_raw.js
node scripts/import_character_skills_from_raw.js --version=0.1.3
node scripts/import_upgrade_costs_from_raw.js --version=0.1.3
node scripts/import_character_stats_from_raw.js
```

## 設計メモ

- 仕様書（日本語）: `docs/END_FIELD_SPEC.md`
- claude向けメモ: `claude.md`
