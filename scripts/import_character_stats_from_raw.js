"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const RAW_PATH = path.join(ROOT, "raw", "character_stats.source.json");
const OUT_PATH = path.join(ROOT, "data", "character_stats.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalizeStats(input) {
  return {
    character_id: String(input.character_id || "").trim(),
    level: Number(input.level || 1),
    hp: Number(input.hp || 0),
    atk: Number(input.atk || 0),
    def: Number(input.def || 0),
    other_stats: input.other_stats || {
      crit_rate: Number(input.crit_rate || 0),
      crit_damage: Number(input.crit_damage || 0)
    },
    version: String(input.version || "0.1.0").trim(),
    source: String(input.source || "community_verification").trim(),
    confidence: String(input.confidence || "provisional").trim(),
    updated_at: String(input.updated_at || new Date().toISOString().slice(0, 10)).trim()
  };
}

function main() {
  if (!fs.existsSync(RAW_PATH)) {
    console.log("raw/character_stats.source.json not found. skip.");
    return;
  }
  const src = readJson(RAW_PATH);
  if (!Array.isArray(src)) throw new Error("raw/character_stats.source.json must be an array");
  const normalized = src.map(normalizeStats);
  normalized.sort((a, b) => a.character_id.localeCompare(b.character_id) || a.level - b.level);
  writeJson(OUT_PATH, normalized);
  console.log(`Imported ${normalized.length} stats -> data/character_stats.json`);
}

main();
