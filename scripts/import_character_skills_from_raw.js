"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const RAW_PATH = path.join(ROOT, "raw", "character_skills.source.json");
const OUT_PATH = path.join(ROOT, "data", "character_skills.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalizeSkill(input, today, version) {
  const id = String(input.id || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_");
  if (!id) throw new Error(`Invalid skill id: ${JSON.stringify(input)}`);

  return {
    id,
    character_id: String(input.character_id || "").trim(),
    skill_name: String(input.skill_name || "").trim(),
    skill_type: String(input.skill_type || "Active").trim(),
    description: String(input.description || "").trim(),
    multiplier_data: input.multiplier_data || { atk_scale: Number(input.atk_scale || 1) },
    cooldown: Number(input.cooldown || 0),
    cost: Number(input.cost || 0),
    hit_count: Number(input.hit_count || 1),
    version: String(input.version || version).trim(),
    source: String(input.source || "community_verification").trim(),
    confidence: String(input.confidence || "provisional").trim(),
    updated_at: String(input.updated_at || today).trim()
  };
}

function main() {
  if (!fs.existsSync(RAW_PATH)) {
    console.log("raw/character_skills.source.json not found. skip.");
    return;
  }
  const args = process.argv.slice(2);
  const versionArg = args.find((arg) => arg.startsWith("--version="));
  const version = versionArg ? versionArg.split("=")[1] : "0.1.0";
  const today = new Date().toISOString().slice(0, 10);

  const src = readJson(RAW_PATH);
  if (!Array.isArray(src)) throw new Error("raw/character_skills.source.json must be an array");
  const normalized = src.map((row) => normalizeSkill(row, today, version));
  writeJson(OUT_PATH, normalized);
  console.log(`Imported ${normalized.length} skills -> data/character_skills.json`);
}

main();
