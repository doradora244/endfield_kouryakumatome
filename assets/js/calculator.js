import { escapeHtml, loadJson } from "./common.js";
import { calculateGrowthCost } from "./growthCostEngine.js";
import { calculateSimpleDamage } from "./damageEngine.js";

const calcForm = document.getElementById("calcForm");
const characterSelect = document.getElementById("characterSelect");
const currentLevel = document.getElementById("currentLevel");
const targetLevel = document.getElementById("targetLevel");
const ownedMaterials = document.getElementById("ownedMaterials");
const calcResult = document.getElementById("calcResult");

const damageForm = document.getElementById("damageForm");
const damageResult = document.getElementById("damageResult");

let characters = [];
let materials = [];
let costs = [];

function parseOwnedMaterials() {
  const raw = ownedMaterials.value.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed == null || Array.isArray(parsed)) {
      throw new Error("object required");
    }
    return parsed;
  } catch {
    throw new Error("所持素材JSONの形式が不正です");
  }
}

function renderGrowthResult() {
  const characterId = characterSelect.value;
  const fromLevel = Number(currentLevel.value);
  const toLevel = Number(targetLevel.value);

  if (!characterId) throw new Error("キャラを選択してください");
  if (!Number.isInteger(fromLevel) || !Number.isInteger(toLevel) || fromLevel < 1 || toLevel > 60 || fromLevel >= toLevel) {
    throw new Error("レベル範囲が不正です（1 <= 現在 < 目標 <= 60）");
  }

  const materialMap = new Map(materials.map((item) => [item.id, item.name]));
  const result = calculateGrowthCost({
    characterId,
    fromLevel,
    toLevel,
    costs,
    ownedByMaterial: parseOwnedMaterials()
  });

  if (!result.found) {
    return "<p class='muted'>該当する育成コストデータがありません。</p>";
  }

  const rows = result.breakdown
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(materialMap.get(item.material_id) ?? item.material_id)}</td>
        <td>${item.required}</td>
        <td>${item.owned}</td>
        <td>${item.shortage}</td>
      </tr>
    `
    )
    .join("");

  return `
    <article class="soft-card">
      <p><strong>必要クレジット:</strong> ${result.creditTotal.toLocaleString()}</p>
      <table class="data-table">
        <thead>
          <tr><th>素材</th><th>必要</th><th>所持</th><th>不足</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </article>
  `;
}

function readDamageInput() {
  const getNumber = (id) => Number(document.getElementById(id).value);
  return {
    atk: getNumber("dAtk"),
    skillMultiplier: getNumber("dMultiplier"),
    critRate: getNumber("dCritRate"),
    critDamage: getNumber("dCritDamage"),
    elementModifier: getNumber("dElementModifier"),
    flatBuff: getNumber("dFlatBuff"),
    percentBuff: getNumber("dPercentBuff"),
    enemyDef: getNumber("dEnemyDef"),
    enemyResist: getNumber("dEnemyResist"),
    hitCount: getNumber("dHitCount")
  };
}

function renderDamageResult() {
  const output = calculateSimpleDamage(readDamageInput());
  return `
    <article class="soft-card">
      <p><strong>1ヒットダメージ:</strong> ${output.per_hit.toFixed(2)}</p>
      <p><strong>総ダメージ:</strong> ${output.total.toFixed(2)}</p>
      <p><strong>会心期待値（1ヒット）:</strong> ${output.expected_crit_per_hit.toFixed(2)}</p>
      <p><strong>会心期待値（総ダメージ）:</strong> ${output.expected_crit_total.toFixed(2)}</p>
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

  calcForm.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      calcResult.innerHTML = renderGrowthResult();
    } catch (error) {
      calcResult.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
    }
  });

  damageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      damageResult.innerHTML = renderDamageResult();
    } catch (error) {
      damageResult.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
    }
  });
}

init().catch((error) => {
  calcResult.innerHTML = `<p class="muted">読み込みに失敗しました: ${escapeHtml(error.message)}</p>`;
  damageResult.innerHTML = "";
});
