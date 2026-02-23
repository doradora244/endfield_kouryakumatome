import { loadJson } from "./common.js";

const STORAGE_PREFIX = "endfield_raw_";
const FILES = {
  characters: "characters.source.json",
  materials: "materials.source.json",
  character_skills: "character_skills.source.json",
  upgrade_costs: "upgrade_costs.source.json",
  character_stats: "character_stats.source.json"
};

const SCHEMA = {
  characters: {
    formId: "characterForm",
    fields: [
      ["id", "text", "perlica"],
      ["name", "text", "ペリカ"],
      ["rarity", "number", "5"],
      ["element", "text", "氷"],
      ["role", "text", "支援"],
      ["weapon_type", "text", "杖"],
      ["description", "text", "説明文"],
      ["icon_url", "text", "https://example.com/icon.png"],
      ["source", "text", "official"],
      ["confidence", "text", "confirmed"],
      ["updated_at", "date", ""]
    ],
    key: (v) => v.id
  },
  materials: {
    formId: "materialForm",
    fields: [
      ["id", "text", "refined_alloy"],
      ["name", "text", "精製合金"],
      ["category", "text", "育成"],
      ["icon_url", "text", "https://example.com/material.png"],
      ["source", "text", "in_game"],
      ["updated_at", "date", ""]
    ],
    key: (v) => v.id
  },
  character_skills: {
    formId: "skillForm",
    fields: [
      ["id", "text", "perlica_skill_1"],
      ["character_id", "text", "perlica"],
      ["skill_name", "text", "コマンドウィーブ"],
      ["skill_type", "text", "Active"],
      ["description", "text", "短時間、味方の攻撃力を上昇。"],
      ["atk_scale", "number", "1.2"],
      ["cooldown", "number", "16"],
      ["cost", "number", "30"],
      ["hit_count", "number", "1"],
      ["version", "text", "0.1.0"],
      ["source", "text", "community_verification"],
      ["confidence", "text", "provisional"],
      ["updated_at", "date", ""]
    ],
    key: (v) => v.id
  },
  upgrade_costs: {
    formId: "costForm",
    fields: [
      ["id", "text", "perlica_lv1_20_alloy"],
      ["character_id", "text", "perlica"],
      ["upgrade_type", "text", "level"],
      ["from_level", "number", "1"],
      ["to_level", "number", "20"],
      ["material_id", "text", "refined_alloy"],
      ["amount", "number", "8"],
      ["credit_cost", "number", "1200"],
      ["version", "text", "0.1.0"],
      ["source", "text", "in_game"],
      ["confidence", "text", "confirmed"],
      ["updated_at", "date", ""]
    ],
    key: (v) => v.id
  },
  character_stats: {
    formId: "statsForm",
    fields: [
      ["id", "text", "perlica_lv1"],
      ["character_id", "text", "perlica"],
      ["level", "number", "1"],
      ["hp", "number", "700"],
      ["atk", "number", "90"],
      ["def", "number", "60"],
      ["crit_rate", "number", "0.05"],
      ["crit_damage", "number", "0.5"],
      ["version", "text", "0.1.0"],
      ["source", "text", "community_verification"],
      ["confidence", "text", "provisional"],
      ["updated_at", "date", ""]
    ],
    key: (v) => v.id
  }
};

const datasetSelect = document.getElementById("datasetSelect");
const jsonOutput = document.getElementById("jsonOutput");
const editorStatus = document.getElementById("editorStatus");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");

const state = {
  lists: {}
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function status(text) {
  editorStatus.textContent = text;
}

function normalizeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function storageKey(dataset) {
  return `${STORAGE_PREFIX}${dataset}`;
}

function buildForm(dataset) {
  const config = SCHEMA[dataset];
  const form = document.getElementById(config.formId);
  const fieldHtml = config.fields
    .map(([name, type, placeholder]) => {
      const value = type === "date" && !placeholder ? today() : "";
      return `
        <label>${name}
          <input data-dataset="${dataset}" data-field="${name}" type="${type}" placeholder="${placeholder}" value="${value}">
        </label>
      `;
    })
    .join("");
  form.innerHTML = `${fieldHtml}<button class="btn-primary" type="submit">追加/上書き</button>`;
}

function parseFormValue(input) {
  if (input.type === "number") return Number(input.value || 0);
  return String(input.value || "").trim();
}

function buildRecord(dataset) {
  const config = SCHEMA[dataset];
  const inputs = [...document.querySelectorAll(`input[data-dataset="${dataset}"]`)];
  const raw = {};
  inputs.forEach((input) => {
    raw[input.dataset.field] = parseFormValue(input);
  });

  if (raw.id) raw.id = normalizeId(raw.id);
  if (!raw.id && raw.name) raw.id = normalizeId(raw.name);
  if (!raw.updated_at) raw.updated_at = today();

  if (dataset === "character_skills") {
    raw.multiplier_data = { atk_scale: Number(raw.atk_scale || 0) };
    delete raw.atk_scale;
  }

  if (dataset === "character_stats") {
    raw.other_stats = {
      crit_rate: Number(raw.crit_rate || 0),
      crit_damage: Number(raw.crit_damage || 0)
    };
    delete raw.crit_rate;
    delete raw.crit_damage;
  }

  return raw;
}

function mergeByKey(dataset, record) {
  const list = state.lists[dataset] ?? [];
  const key = SCHEMA[dataset].key(record);
  if (!key) throw new Error("idが空です");
  const idx = list.findIndex((item) => SCHEMA[dataset].key(item) === key);
  if (idx >= 0) {
    list[idx] = record;
    return { mode: "updated", count: list.length };
  }
  list.push(record);
  state.lists[dataset] = list;
  return { mode: "created", count: list.length };
}

function renderSelectedJson() {
  const dataset = datasetSelect.value;
  const list = state.lists[dataset] ?? [];
  const text = `${JSON.stringify(list, null, 2)}\n`;
  jsonOutput.value = text;
  localStorage.setItem(storageKey(dataset), text);
  status(`${FILES[dataset]} 件数: ${list.length}`);
}

function bindFormSubmit(dataset) {
  const form = document.getElementById(SCHEMA[dataset].formId);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      const record = buildRecord(dataset);
      const result = mergeByKey(dataset, record);
      renderSelectedJson();
      status(`${FILES[dataset]} ${result.mode === "created" ? "追加" : "更新"} / 件数: ${result.count}`);
    } catch (error) {
      status(`エラー: ${error.message}`);
    }
  });
}

function bindTabSwitch() {
  const buttons = [...document.querySelectorAll(".tab-btn")];
  const panels = ["editor-characters", "editor-materials", "editor-skills", "editor-costs", "editor-stats"];
  const tabToDataset = {
    "editor-characters": "characters",
    "editor-materials": "materials",
    "editor-skills": "character_skills",
    "editor-costs": "upgrade_costs",
    "editor-stats": "character_stats"
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");
      panels.forEach((panelId) => document.getElementById(panelId).classList.add("hidden"));
      document.getElementById(button.dataset.tab).classList.remove("hidden");
      datasetSelect.value = tabToDataset[button.dataset.tab];
      renderSelectedJson();
    });
  });
}

async function loadDataset(dataset) {
  const fromStorage = localStorage.getItem(storageKey(dataset));
  if (fromStorage) {
    state.lists[dataset] = JSON.parse(fromStorage);
    return;
  }

  try {
    const loaded = await loadJson(`./raw/${FILES[dataset]}`);
    state.lists[dataset] = Array.isArray(loaded) ? loaded : [];
  } catch {
    state.lists[dataset] = [];
  }
}

async function init() {
  Object.keys(SCHEMA).forEach(buildForm);
  Object.keys(SCHEMA).forEach(bindFormSubmit);
  bindTabSwitch();

  for (const dataset of Object.keys(FILES)) {
    await loadDataset(dataset);
  }

  datasetSelect.addEventListener("change", renderSelectedJson);

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput.value);
      status("JSONをコピーしました");
    } catch {
      status("コピーに失敗しました");
    }
  });

  downloadBtn.addEventListener("click", () => {
    const dataset = datasetSelect.value;
    const blob = new Blob([jsonOutput.value], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = FILES[dataset];
    a.click();
    URL.revokeObjectURL(url);
    status(`${FILES[dataset]} をダウンロードしました`);
  });

  resetBtn.addEventListener("click", async () => {
    const dataset = datasetSelect.value;
    localStorage.removeItem(storageKey(dataset));
    await loadDataset(dataset);
    renderSelectedJson();
    status(`ローカル保存をリセットしました: ${FILES[dataset]}`);
  });

  renderSelectedJson();
}

init().catch((error) => status(`初期化エラー: ${error.message}`));
