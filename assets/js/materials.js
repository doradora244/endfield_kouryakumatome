import { escapeHtml, loadJson } from "./common.js";

const materialSearch = document.getElementById("materialSearch");
const materialList = document.getElementById("materialList");

const CATEGORY_CLASS = {
  "昇進": "cat-ascend",
  "スキル強化": "cat-skill",
  "採集素材": "cat-gather",
  "経験値": "cat-exp",
  "通貨": "cat-credit"
};

function render(materials, usageMap, keyword = "") {
  const q = keyword.trim().toLowerCase();
  const filtered = materials.filter(
    (m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
  );

  if (!filtered.length) {
    materialList.innerHTML = `<p class="muted">該当する素材が見つかりません。</p>`;
    return;
  }

  materialList.innerHTML = filtered
    .map((material) => {
      const users = usageMap.get(material.id) ?? [];
      const userList = users.length ? users.join("・") : "—";
      const catClass = CATEGORY_CLASS[material.category] || "";
      const badge =
        material.confidence === "provisional"
          ? ' <span class="chip" style="font-size:0.68rem;padding:0.1rem 0.4rem">暫定</span>'
          : "";
      const methods =
        material.acquisition_methods && material.acquisition_methods.length
          ? material.acquisition_methods.map((m) => `<li>${escapeHtml(m)}</li>`).join("")
          : "<li>—</li>";

      return `
        <article class="soft-card">
          <div class="row">
            <h3 style="font-size:1rem;margin:0">${escapeHtml(material.name)}${badge}</h3>
            <span class="chip ${catClass}">${escapeHtml(material.category)}</span>
          </div>
          <p class="tiny" style="margin:0.3rem 0 0.5rem">
            使用キャラ: <span style="color:var(--text)">${escapeHtml(userList)}</span>
          </p>
          <p class="tiny" style="margin:0 0 0.25rem;font-weight:600;color:var(--text)">入手方法</p>
          <ul class="tiny" style="margin:0;padding-left:1.2rem;color:var(--text)">${methods}</ul>
        </article>
      `;
    })
    .join("");
}

async function init() {
  const [materials, characters, costs] = await Promise.all([
    loadJson("./data/materials.json"),
    loadJson("./data/characters.json"),
    loadJson("./data/upgrade_costs.json")
  ]);

  const charMap = new Map(characters.map((item) => [item.id, item.name]));
  const usageMap = new Map();

  costs.forEach((cost) => {
    if (!cost.material_id) return;
    const list = usageMap.get(cost.material_id) ?? [];
    const name =
      cost.character_id === "*"
        ? "全キャラ共通"
        : (charMap.get(cost.character_id) ?? cost.character_id);
    if (!list.includes(name)) list.push(name);
    usageMap.set(cost.material_id, list);
  });

  render(materials, usageMap);
  materialSearch.addEventListener("input", () =>
    render(materials, usageMap, materialSearch.value)
  );
}

init().catch((error) => {
  materialList.innerHTML = `<p class="muted">読み込みに失敗しました: ${escapeHtml(error.message)}</p>`;
});
