import { escapeHtml, loadJson, toLabel } from "./common.js";

const notFound = document.getElementById("notFound");
const detailView = document.getElementById("detailView");
const charName = document.getElementById("charName");
const metaTag = document.getElementById("metaTag");
const tabOverview = document.getElementById("tab-overview");
const tabSkills = document.getElementById("tab-skills");
const tabGrowth = document.getElementById("tab-growth");
const tabBuild = document.getElementById("tab-build");

const ELEM_CLASS = {
  "物理": "elem-physical",
  "灼熱": "elem-fire",
  "寒冷": "elem-ice",
  "電磁": "elem-elec",
  "自然": "elem-nature"
};

const ROLE_CLASS = {
  "前衛": "role-frontline",
  "先鋒": "role-vanguard",
  "重装": "role-defender",
  "術師": "role-caster",
  "補助": "role-support",
  "突撃": "role-assault"
};

// E0〜E4: 昇進を行うときの from_level（昇進コストのキー）
const ASCENSION_FROM_LEVELS = [20, 40, 60, 80];

const ASCENSION_STAGES = [
  { value: 0, label: "E0（Lv上限 20）" },
  { value: 1, label: "E1（Lv上限 40）" },
  { value: 2, label: "E2（Lv上限 60）" },
  { value: 3, label: "E3（Lv上限 80）" },
  { value: 4, label: "E4（Lv上限 90）" }
];

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

function calcGrowthMaterials(myCosts, fromStage, toStage) {
  if (fromStage >= toStage) return null;

  const neededLevels = new Set();
  for (let s = fromStage; s < toStage; s++) {
    neededLevels.add(ASCENSION_FROM_LEVELS[s]);
  }

  const relevant = myCosts.filter(
    (c) => c.upgrade_type === "ascension" && neededLevels.has(c.from_level)
  );
  if (!relevant.length) return null;

  const totals = new Map();
  let totalCredits = 0;
  relevant.forEach((c) => {
    if (c.material_id) {
      totals.set(c.material_id, (totals.get(c.material_id) || 0) + c.amount);
    }
    if (c.credit_cost) totalCredits += c.credit_cost;
  });

  return { totals, totalCredits };
}

function renderGrowthResult(result, materialDetailsMap) {
  if (!result) return `<p class="muted">このキャラの昇進コストデータはまだありません。</p>`;

  const { totals, totalCredits } = result;
  const rows = [];

  totals.forEach((amount, matId) => {
    const mat = materialDetailsMap.get(matId);
    const name = mat ? mat.name : matId;
    const methods =
      mat && mat.acquisition_methods && mat.acquisition_methods.length
        ? mat.acquisition_methods.join(" · ")
        : "—";
    const badge = mat && mat.confidence === "provisional"
      ? ' <span class="chip" style="font-size:0.68rem;padding:0.1rem 0.4rem">暫定</span>'
      : "";
    rows.push(`
      <article class="soft-card">
        <div class="row">
          <strong>${escapeHtml(name)}${badge}</strong>
          <span class="chip">× ${amount}</span>
        </div>
        <p class="tiny" style="margin:0.3rem 0 0">${escapeHtml(methods)}</p>
      </article>
    `);
  });

  if (totalCredits > 0) {
    rows.push(`
      <article class="soft-card">
        <div class="row">
          <strong>折金券（クレジット）</strong>
          <span class="chip">× ${totalCredits.toLocaleString()}</span>
        </div>
        <p class="tiny" style="margin:0.3rem 0 0">協約空間「通貨」周回 · クエスト報酬 · デイリー報酬</p>
      </article>
    `);
  }

  return rows.join("");
}

function setupGrowthTab(myCosts, materialDetailsMap) {
  const fromOpts = ASCENSION_STAGES.slice(0, 4)
    .map((s) => `<option value="${s.value}">${escapeHtml(s.label)}</option>`)
    .join("");
  const toOpts = ASCENSION_STAGES.slice(1)
    .map((s) => `<option value="${s.value}" ${s.value === 4 ? "selected" : ""}>${escapeHtml(s.label)}</option>`)
    .join("");

  tabGrowth.innerHTML = `
    <h3 style="margin:0 0 0.7rem">昇進コスト計算</h3>
    <div class="form-grid filters" style="margin-bottom:1rem">
      <label>
        現在の昇進段階
        <select id="fromStage">${fromOpts}</select>
      </label>
      <label>
        目標昇進段階
        <select id="toStage">${toOpts}</select>
      </label>
    </div>
    <div id="growthResult" class="stack"></div>
    <p class="tiny" style="margin-top:1rem;color:var(--muted)">
      ※「暫定」マークはwiki等から取得した未確認情報です。ゲーム内で確認次第修正します。
    </p>
  `;

  function update() {
    const fromStage = parseInt(document.getElementById("fromStage").value, 10);
    const toStage = parseInt(document.getElementById("toStage").value, 10);
    const result = calcGrowthMaterials(myCosts, fromStage, toStage);
    document.getElementById("growthResult").innerHTML = renderGrowthResult(result, materialDetailsMap);
  }

  document.getElementById("fromStage").addEventListener("change", update);
  document.getElementById("toStage").addEventListener("change", update);
  update();
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

  const materialDetailsMap = new Map(materials.map((item) => [item.id, item]));
  const myStats = stats.filter((item) => item.character_id === id).sort((a, b) => a.level - b.level);
  const mySkills = skills.filter((item) => item.character_id === id);
  const myCosts = costs.filter(
    (item) => item.character_id === id || item.character_id === "*"
  );

  charName.textContent = character.name;
  metaTag.textContent = character.confidence === "confirmed" ? "確認済" : "暫定";

  const ec = ELEM_CLASS[character.element] || "";
  const rc = ROLE_CLASS[character.role] || "";
  const stars = "★".repeat(character.rarity);
  const weaponChip =
    character.weapon_type && character.weapon_type !== "不明"
      ? `<span class="chip">${escapeHtml(character.weapon_type)}</span>`
      : "";

  tabOverview.innerHTML = `
    <div class="char-detail-chips chip-row">
      <span class="chip ${ec}">${escapeHtml(character.element)}</span>
      <span class="chip ${rc}">${escapeHtml(character.role)}</span>
      ${weaponChip}
      <span class="chip char-stars">${stars}</span>
    </div>
    <p class="char-detail-desc">${escapeHtml(toLabel(character.description))}</p>
    <p class="char-meta-line">
      更新: ${escapeHtml(character.updated_at)}
      &nbsp;·&nbsp; ソース: ${escapeHtml(character.source)}
      &nbsp;·&nbsp; 確度: ${escapeHtml(character.confidence)}
    </p>
    <h3 style="margin:0 0 0.3rem">ステータス</h3>
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

  setupGrowthTab(myCosts, materialDetailsMap);

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
