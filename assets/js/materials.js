import { escapeHtml, loadJson } from "./common.js";

const materialSearch = document.getElementById("materialSearch");
const materialList = document.getElementById("materialList");

function render(materials, usageMap, keyword = "") {
  const q = keyword.trim().toLowerCase();
  const filtered = materials.filter((material) => material.name.toLowerCase().includes(q));

  materialList.innerHTML = filtered
    .map((material) => {
      const users = usageMap.get(material.id) ?? [];
      const userList = users.length ? users.join(", ") : "使用データなし";
      return `
        <article class="soft-card">
          <div class="row">
            <h3>${escapeHtml(material.name)}</h3>
            <span class="chip">${escapeHtml(material.category)}</span>
          </div>
          <p class="tiny">source: ${escapeHtml(material.source)} / updated: ${escapeHtml(material.updated_at)}</p>
          <p><strong>使用キャラ:</strong> ${escapeHtml(userList)}</p>
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
    const list = usageMap.get(cost.material_id) ?? [];
    const name = charMap.get(cost.character_id) ?? cost.character_id;
    if (!list.includes(name)) list.push(name);
    usageMap.set(cost.material_id, list);
  });

  render(materials, usageMap);
  materialSearch.addEventListener("input", () => render(materials, usageMap, materialSearch.value));
}

init().catch((error) => {
  materialList.innerHTML = `<p class="muted">読み込みに失敗しました: ${escapeHtml(error.message)}</p>`;
});
