import { escapeHtml, loadJson } from "./common.js";
import { calculateGrowthCost } from "./growthCostEngine.js";

const form = document.getElementById("calcForm");
const characterSelect = document.getElementById("characterSelect");
const currentLevel = document.getElementById("currentLevel");
const targetLevel = document.getElementById("targetLevel");
const ownedMaterials = document.getElementById("ownedMaterials");
const calcResult = document.getElementById("calcResult");

let characters = [];
let materials = [];
let costs = [];

function parseOwned() {
  const raw = ownedMaterials.value.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || Array.isArray(parsed) || parsed == null) throw new Error("object expected");
    return parsed;
  } catch {
    throw new Error("所持素材JSONの形式が不正です");
  }
}

function calculate() {
  const id = characterSelect.value;
  const from = Number(currentLevel.value);
  const to = Number(targetLevel.value);
  if (!id) throw new Error("キャラを選択してください");
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to > 60 || from >= to) {
    throw new Error("レベル範囲が不正です（1 <= 現在 < 目標 <= 60）");
  }

  const owned = parseOwned();
  const materialMap = new Map(materials.map((item) => [item.id, item.name]));
  const result = calculateGrowthCost({
    characterId: id,
    fromLevel: from,
    toLevel: to,
    costs,
    ownedByMaterial: owned
  });

  if (!result.found) {
    return "<p class='muted'>該当する育成コストデータがありません。</p>";
  }

  const rows = result.breakdown.map((item) => {
    return `
      <tr>
        <td>${escapeHtml(materialMap.get(item.material_id) ?? item.material_id)}</td>
        <td>${item.required}</td>
        <td>${item.owned}</td>
        <td>${item.shortage}</td>
      </tr>
    `;
  });

  return `
    <article class="soft-card">
      <p><strong>必要クレジット:</strong> ${result.creditTotal.toLocaleString()}</p>
      <table class="data-table">
        <thead><tr><th>素材</th><th>必要</th><th>所持</th><th>不足</th></tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </article>
  `;
}

async function init() {
  [characters, materials, costs] = await Promise.all([
    loadJson("./data/characters.json"),
    loadJson("./data/materials.json"),
    loadJson("./data/upgrade_costs.json")
  ]);

  characterSelect.innerHTML = characters
    .map((character) => `<option value="${escapeHtml(character.id)}">${escapeHtml(character.name)}</option>`)
    .join("");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      calcResult.innerHTML = calculate();
    } catch (error) {
      calcResult.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
    }
  });
}

init().catch((error) => {
  calcResult.innerHTML = `<p class="muted">読み込みに失敗しました: ${escapeHtml(error.message)}</p>`;
});
