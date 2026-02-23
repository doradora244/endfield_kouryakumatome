"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const RAW_PATH = path.join(ROOT, "raw", "upgrade_costs.source.json");
const OUT_PATH = path.join(ROOT, "data", "upgrade_costs.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalizeCost(input, today, version) {
  const id = String(input.id || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_");
  if (!id) throw new Error(`Invalid cost id: ${JSON.stringify(input)}`);

  return {
    id,
    character_id: String(input.character_id || "").trim(),
    upgrade_type: String(input.upgrade_type || "level").trim(),
    from_level: Number(input.from_level || 1),
    to_level: Number(input.to_level || 1),
    material_id: String(input.material_id || "").trim(),
    amount: Number(input.amount || 0),
    credit_cost: Number(input.credit_cost || 0),
    version: String(input.version || version).trim(),
    source: String(input.source || "in_game").trim(),
    confidence: String(input.confidence || "confirmed").trim(),
    updated_at: String(input.updated_at || today).trim()
  };
}

function main() {
  if (!fs.existsSync(RAW_PATH)) {
    console.log("raw/upgrade_costs.source.json not found. skip.");
    return;
  }
  const args = process.argv.slice(2);
  const versionArg = args.find((arg) => arg.startsWith("--version="));
  const version = versionArg ? versionArg.split("=")[1] : "0.1.0";
  const today = new Date().toISOString().slice(0, 10);

  const src = readJson(RAW_PATH);
  if (!Array.isArray(src)) throw new Error("raw/upgrade_costs.source.json must be an array");
  const normalized = src.map((row) => normalizeCost(row, today, version));
  writeJson(OUT_PATH, normalized);
  console.log(`Imported ${normalized.length} costs -> data/upgrade_costs.json`);
}

main();
