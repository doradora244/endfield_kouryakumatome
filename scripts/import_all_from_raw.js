"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const SCRIPTS = [
  "import_characters_from_raw.js",
  "import_materials_from_raw.js",
  "import_character_skills_from_raw.js",
  "import_upgrade_costs_from_raw.js",
  "import_character_stats_from_raw.js"
];

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function writeJson(rel, value) {
  fs.writeFileSync(path.join(ROOT, rel), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function run(scriptName, version) {
  const scriptPath = path.join(ROOT, "scripts", scriptName);
  const result = spawnSync(process.execPath, [scriptPath, `--version=${version}`], { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function updateChangelog(version) {
  const updatesPath = "data/updates.json";
  const updates = readJson(updatesPath);
  const entry = {
    id: `v${version.replaceAll(".", "_")}`,
    version,
    date: new Date().toISOString().slice(0, 10),
    summary: "Imported raw source data.",
    items: [
      "Imported characters/materials/skills/costs/stats from raw sources.",
      "Validated cross-file references."
    ],
    data_scope: ["characters", "materials", "character_skills", "upgrade_costs", "character_stats"]
  };
  const filtered = updates.filter((item) => item.version !== version);
  filtered.unshift(entry);
  writeJson(updatesPath, filtered);
}

function main() {
  const args = process.argv.slice(2);
  const versionArg = args.find((arg) => arg.startsWith("--version="));
  const version = versionArg ? versionArg.split("=")[1] : "0.1.0";

  SCRIPTS.forEach((script) => run(script, version));
  run("validate_data.js", version);
  updateChangelog(version);
  console.log(`Import completed. version=${version}`);
}

main();
