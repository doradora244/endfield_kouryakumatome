import { loadJson } from "./common.js";

const STORAGE_KEY = "endfield_raw_characters";

const form = document.getElementById("characterForm");
const jsonOutput = document.getElementById("jsonOutput");
const editorStatus = document.getElementById("editorStatus");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");

const fields = [
  "id",
  "name",
  "rarity",
  "element",
  "role",
  "weapon_type",
  "description",
  "icon_url",
  "source",
  "confidence",
  "updated_at"
];

function setStatus(message) {
  editorStatus.textContent = message;
}

function normalizeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getFormData() {
  const raw = {};
  fields.forEach((name) => {
    raw[name] = document.getElementById(name).value;
  });
  const id = normalizeId(raw.id || raw.name);
  if (!id) throw new Error("id または名前を入力してください");
  if (!raw.name.trim()) throw new Error("名前を入力してください");
  if (!raw.element.trim()) throw new Error("属性を入力してください");
  if (!raw.role.trim()) throw new Error("役割を入力してください");
  if (!raw.weapon_type.trim()) throw new Error("武器種を入力してください");

  return {
    id,
    name: raw.name.trim(),
    rarity: Number(raw.rarity || 0),
    element: raw.element.trim(),
    role: raw.role.trim(),
    weapon_type: raw.weapon_type.trim(),
    description: raw.description.trim(),
    icon_url: raw.icon_url.trim(),
    source: raw.source.trim() || "community_verification",
    confidence: raw.confidence.trim() || "provisional",
    updated_at: raw.updated_at || getToday()
  };
}

function readCurrentList() {
  const text = jsonOutput.value.trim();
  if (!text) return [];
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error("JSONは配列形式にしてください");
  return parsed;
}

function writeList(list) {
  const pretty = `${JSON.stringify(list, null, 2)}\n`;
  jsonOutput.value = pretty;
  localStorage.setItem(STORAGE_KEY, pretty);
  setStatus(`件数: ${list.length}`);
}

function mergeCharacter(list, character) {
  const idx = list.findIndex((item) => item.id === character.id);
  if (idx >= 0) {
    list[idx] = character;
    return "既存IDを上書きしました";
  }
  list.push(character);
  list.sort((a, b) => String(a.name).localeCompare(String(b.name), "ja"));
  return "新規追加しました";
}

async function initDefaultJson() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    jsonOutput.value = saved;
    setStatus("ローカル保存を読み込みました");
    return;
  }

  try {
    const remote = await loadJson("./raw/characters.source.json");
    writeList(remote);
    setStatus("raw/characters.source.json を読み込みました");
  } catch {
    writeList([]);
    setStatus("初期データなし: 空配列を開始");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const character = getFormData();
    const list = readCurrentList();
    const message = mergeCharacter(list, character);
    writeList(list);
    setStatus(`${message} / 件数: ${list.length}`);
  } catch (error) {
    setStatus(`エラー: ${error.message}`);
  }
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(jsonOutput.value);
    setStatus("JSONをクリップボードにコピーしました");
  } catch {
    setStatus("コピーに失敗しました");
  }
});

downloadBtn.addEventListener("click", () => {
  const blob = new Blob([jsonOutput.value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "characters.source.json";
  a.click();
  URL.revokeObjectURL(url);
  setStatus("characters.source.json をダウンロードしました");
});

resetBtn.addEventListener("click", async () => {
  localStorage.removeItem(STORAGE_KEY);
  await initDefaultJson();
});

document.getElementById("updated_at").value = getToday();
initDefaultJson();
