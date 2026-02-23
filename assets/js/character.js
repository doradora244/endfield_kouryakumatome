import { escapeHtml, loadJson, toLabel } from "./common.js";

const notFound = document.getElementById("notFound");
const detailView = document.getElementById("detailView");
const charName = document.getElementById("charName");
const metaTag = document.getElementById("metaTag");
const tabOverview = document.getElementById("tab-overview");
const tabSkills = document.getElementById("tab-skills");
const tabGrowth = document.getElementById("tab-growth");
const tabBuild = document.getElementById("tab-build");

function queryId() {
  return new URLSearchParams(location.search).get("id");
}

function bindTabs() {
  const buttons = [...document.querySelectorAll(".tab-btn")];
  const panels = {
    overview: tabOverview,
    skills: tabSkills,
    growth: tabGrowth,
    build: tabBuild
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((node) => node.classList.remove("is-active"));
      button.classList.add("is-active");
      Object.values(panels).forEach((panel) => panel.classList.add("hidden"));
      panels[button.dataset.tab].classList.remove("hidden");
    });
  });
}

function renderStatsTable(rows) {
  if (!rows.length) return `<p class="muted">データなし</p>`;
  const body = rows
    .map(
      (row) => `
      <tr>
        <td>${row.level}</td>
        <td>${row.hp}</td>
        <td>${row.atk}</td>
        <td>${row.def}</td>
      </tr>
    `
    )
    .join("");
  return `
    <table class="data-table">
      <thead><tr><th>Lv</th><th>HP</th><th>ATK</th><th>DEF</th></tr></thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function renderCostTable(rows) {
  if (!rows.length) return `<p class="muted">データなし</p>`;
  const body = rows
    .map(
      (row) => `
      <tr>
        <td>${row.from_level}-${row.to_level}</td>
        <td>${escapeHtml(row.material_name)}</td>
        <td>${row.amount}</td>
        <td>${row.credit_cost}</td>
      </tr>
    `
    )
    .join("");
  return `
    <table class="data-table">
      <thead><tr><th>区間</th><th>素材</th><th>必要数</th><th>クレジット</th></tr></thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

async function init() {
  const id = queryId();
  const [characters, stats, skills, materials, costs] = await Promise.all([
    loadJson("./data/characters.json"),
    loadJson("./data/character_stats.json"),
    loadJson("./data/character_skills.json"),
    loadJson("./data/materials.json"),
    loadJson("./data/upgrade_costs.json")
  ]);

  const character = characters.find((item) => item.id === id);
  if (!character) {
    notFound.classList.remove("hidden");
    return;
  }

  const materialMap = new Map(materials.map((item) => [item.id, item.name]));
  const myStats = stats.filter((item) => item.character_id === id).sort((a, b) => a.level - b.level);
  const mySkills = skills.filter((item) => item.character_id === id);
  const myCosts = costs
    .filter((item) => item.character_id === id)
    .map((item) => ({ ...item, material_name: materialMap.get(item.material_id) ?? item.material_id }));

  charName.textContent = character.name;
  metaTag.textContent = `${character.confidence} / v${character.version}`;

  tabOverview.innerHTML = `
    <div class="kv-grid">
      <p><strong>レア度:</strong> ★${toLabel(character.rarity)}</p>
      <p><strong>属性:</strong> ${escapeHtml(toLabel(character.element))}</p>
      <p><strong>役割:</strong> ${escapeHtml(toLabel(character.role))}</p>
      <p><strong>武器種:</strong> ${escapeHtml(toLabel(character.weapon_type))}</p>
      <p><strong>最終更新:</strong> ${escapeHtml(toLabel(character.updated_at))}</p>
      <p><strong>source:</strong> ${escapeHtml(toLabel(character.source))}</p>
      <p><strong>confidence:</strong> ${escapeHtml(toLabel(character.confidence))}</p>
    </div>
    <p class="muted">${escapeHtml(toLabel(character.description))}</p>
    <h3>ステータス</h3>
    ${renderStatsTable(myStats)}
  `;

  tabSkills.innerHTML = mySkills.length
    ? mySkills
        .map(
          (skill) => `
          <article class="soft-card">
            <h3>${escapeHtml(skill.skill_name)}</h3>
            <p class="muted">${escapeHtml(skill.description)}</p>
            <p class="tiny">type: ${escapeHtml(skill.skill_type)} / cd: ${skill.cooldown}s / cost: ${skill.cost} / hits: ${skill.hit_count}</p>
          </article>
        `
        )
        .join("")
    : `<p class="muted">スキルデータなし</p>`;

  tabGrowth.innerHTML = `
    <h3>必要素材</h3>
    ${renderCostTable(myCosts)}
  `;

  tabBuild.innerHTML = `
    <article class="soft-card">
      <h3>推奨ビルド（暫定）</h3>
      <p class="muted">役割不足を埋める構成を優先。火力不足ならDPS寄り、耐久不足なら支援・防御寄り。</p>
    </article>
  `;

  detailView.classList.remove("hidden");
  bindTabs();
}

init().catch((error) => {
  notFound.classList.remove("hidden");
  notFound.innerHTML = `<p class="muted">読み込みに失敗しました: ${escapeHtml(error.message)}</p>`;
});
