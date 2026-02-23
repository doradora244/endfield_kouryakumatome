"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const RAW_PATH = path.join(ROOT, "raw", "characters.source.json");
const OUT_PATH = path.join(ROOT, "data", "characters.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalizeCharacter(input, today, version) {
  const id = String(input.id || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_");

  if (!id) {
    throw new Error(`Invalid id: ${JSON.stringify(input)}`);
  }

  return {
    id,
    name: String(input.name || "").trim(),
    rarity: Number(input.rarity || 0),
    element: String(input.element || "").trim(),
    role: String(input.role || "").trim(),
    weapon_type: String(input.weapon_type || "").trim(),
    description: String(input.description || "").trim(),
    icon_url: String(input.icon_url || "").trim(),
    version,
    source: String(input.source || "community_verification").trim(),
    confidence: String(input.confidence || "provisional").trim(),
    updated_at: String(input.updated_at || today).trim()
  };
}

function assertRequired(record) {
  const required = ["id", "name", "rarity", "element", "role", "weapon_type", "version", "source", "confidence", "updated_at"];
  const missing = required.filter((key) => {
    const value = record[key];
    return value === "" || value === 0 || value == null;
  });
  if (missing.length) {
    throw new Error(`Missing required fields for id=${record.id}: ${missing.join(", ")}`);
  }
}

function main() {
  if (!fs.existsSync(RAW_PATH)) {
    throw new Error(`Raw file not found: ${RAW_PATH}`);
  }

  const args = process.argv.slice(2);
  const versionArg = args.find((arg) => arg.startsWith("--version="));
  const version = versionArg ? versionArg.split("=")[1] : "0.1.0";
  const today = new Date().toISOString().slice(0, 10);

  const sourceList = readJson(RAW_PATH);
  if (!Array.isArray(sourceList)) {
    throw new Error("raw/characters.source.json must be an array");
  }

  const normalized = sourceList.map((row) => normalizeCharacter(row, today, version));
  normalized.forEach(assertRequired);
  normalized.sort((a, b) => a.name.localeCompare(b.name));

  writeJson(OUT_PATH, normalized);
  console.log(`Imported ${normalized.length} characters -> data/characters.json`);
}

main();
