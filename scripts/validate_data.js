"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function uniqueCheck(items, key, label, errors) {
  const seen = new Set();
  items.forEach((item) => {
    const value = item[key];
    if (value == null || value === "") {
      errors.push(`${label}: missing ${key}`);
      return;
    }
    if (seen.has(value)) errors.push(`${label}: duplicated ${key}=${value}`);
    seen.add(value);
  });
}

function main() {
  const errors = [];
  const characters = readJson("data/characters.json");
  const materials = readJson("data/materials.json");
  const skills = readJson("data/character_skills.json");
  const costs = readJson("data/upgrade_costs.json");
  const stats = readJson("data/character_stats.json");

  uniqueCheck(characters, "id", "characters", errors);
  uniqueCheck(materials, "id", "materials", errors);
  uniqueCheck(skills, "id", "character_skills", errors);
  uniqueCheck(costs, "id", "upgrade_costs", errors);

  const characterIds = new Set(characters.map((c) => c.id));
  const materialIds = new Set(materials.map((m) => m.id));

  skills.forEach((skill) => {
    if (!characterIds.has(skill.character_id)) {
      errors.push(`character_skills: unknown character_id=${skill.character_id} (id=${skill.id})`);
    }
  });

  costs.forEach((cost) => {
    if (cost.character_id !== "*" && !characterIds.has(cost.character_id)) {
      errors.push(`upgrade_costs: unknown character_id=${cost.character_id} (id=${cost.id})`);
    }
    if (!materialIds.has(cost.material_id)) {
      errors.push(`upgrade_costs: unknown material_id=${cost.material_id} (id=${cost.id})`);
    }
  });

  stats.forEach((row, idx) => {
    if (!characterIds.has(row.character_id)) {
      errors.push(`character_stats: unknown character_id=${row.character_id} (index=${idx})`);
    }
  });

  if (errors.length) {
    console.error("Validation failed:");
    errors.forEach((e) => console.error(`- ${e}`));
    process.exit(1);
  }

  console.log("Validation passed.");
}

main();
