"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const RAW_PATH = path.join(ROOT, "raw", "materials.source.json");
const OUT_PATH = path.join(ROOT, "data", "materials.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalizeMaterial(input, today) {
  const id = String(input.id || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_");

  if (!id) {
    throw new Error(`Invalid material id: ${JSON.stringify(input)}`);
  }

  return {
    id,
    name: String(input.name || "").trim(),
    category: String(input.category || "General").trim(),
    icon_url: String(input.icon_url || "").trim(),
    acquisition_methods: Array.isArray(input.acquisition_methods) ? input.acquisition_methods : [],
    drop_locations: Array.isArray(input.drop_locations) ? input.drop_locations : [],
    note: String(input.note || "").trim(),
    source: String(input.source || "in_game").trim(),
    confidence: String(input.confidence || "confirmed").trim(),
    updated_at: String(input.updated_at || today).trim()
  };
}

function main() {
  if (!fs.existsSync(RAW_PATH)) {
    throw new Error(`Raw file not found: ${RAW_PATH}`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const sourceList = readJson(RAW_PATH);
  if (!Array.isArray(sourceList)) {
    throw new Error("raw/materials.source.json must be an array");
  }

  const normalized = sourceList.map((row) => normalizeMaterial(row, today));
  normalized.sort((a, b) => a.name.localeCompare(b.name));
  writeJson(OUT_PATH, normalized);
  console.log(`Imported ${normalized.length} materials -> data/materials.json`);
}

main();
