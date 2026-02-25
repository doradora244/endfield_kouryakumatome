import { escapeHtml, loadJson, uniqueValues } from "./common.js";

const searchInput = document.getElementById("searchInput");
const rarityFilter = document.getElementById("rarityFilter");
const elementFilter = document.getElementById("elementFilter");
const roleFilter = document.getElementById("roleFilter");
const weaponFilter = document.getElementById("weaponFilter");
const sortOrder = document.getElementById("sortOrder");
const characterGrid = document.getElementById("characterGrid");
const characterCount = document.getElementById("characterCount");

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

function iconHtml(character) {
  const ec = ELEM_CLASS[character.element] || "";
  const label = character.name.slice(0, 2);
  if (character.icon_url) {
    return `<div class="char-icon ${ec}"><img src="${escapeHtml(character.icon_url)}" alt="${escapeHtml(character.name)}" loading="lazy"></div>`;
  }
  return `<div class="char-icon ${ec}">${escapeHtml(label)}</div>`;
}

function fillSelect(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function sortCharacters(characters, key) {
  return [...characters].sort((a, b) => {
    if (key === "rarity_asc") return a.rarity - b.rarity;
    if (key === "name") return a.name.localeCompare(b.name, "ja");
    return b.rarity - a.rarity; // rarity_desc default
  });
}

function renderCards(characters) {
  characterCount.textContent = `${characters.length}件`;
  characterGrid.innerHTML = characters
    .map((character) => {
      const ec = ELEM_CLASS[character.element] || "";
      const rc = ROLE_CLASS[character.role] || "";
      const stars = "★".repeat(character.rarity);
      const weaponChip =
        character.weapon_type && character.weapon_type !== "不明"
          ? `<span class="chip">${escapeHtml(character.weapon_type)}</span>`
          : "";
      return `
        <article
          class="info-card char-card rarity-${character.rarity}"
          data-element="${escapeHtml(character.element)}"
          onclick="location.href='./character.html?id=${encodeURIComponent(character.id)}'"
        >
          <div class="char-card-top">
            ${iconHtml(character)}
            <div class="char-card-meta">
              <div class="char-stars rarity-stars-${character.rarity}">${stars}</div>
              <h3>${escapeHtml(character.name)}</h3>
            </div>
          </div>
          <div class="chip-row">
            <span class="chip ${ec}">${escapeHtml(character.element)}</span>
            <span class="chip ${rc}">${escapeHtml(character.role)}</span>
            ${weaponChip}
          </div>
        </article>
      `;
    })
    .join("");
}

function applyFilter(all) {
  const q = searchInput.value.trim().toLowerCase();
  const rarity = rarityFilter.value;
  const element = elementFilter.value;
  const role = roleFilter.value;
  const weapon = weaponFilter.value;

  const filtered = all.filter((character) => {
    if (q && !character.name.toLowerCase().includes(q)) return false;
    if (rarity && String(character.rarity) !== rarity) return false;
    if (element && character.element !== element) return false;
    if (role && character.role !== role) return false;
    if (weapon && character.weapon_type !== weapon) return false;
    return true;
  });

  renderCards(sortCharacters(filtered, sortOrder.value));
}

async function init() {
  const characters = await loadJson("./data/characters.json");
  fillSelect(rarityFilter, uniqueValues(characters, "rarity").map(String));
  fillSelect(elementFilter, uniqueValues(characters, "element"));
  fillSelect(roleFilter, uniqueValues(characters, "role"));
  fillSelect(weaponFilter, uniqueValues(characters, "weapon_type"));
  applyFilter(characters);

  [searchInput, rarityFilter, elementFilter, roleFilter, weaponFilter, sortOrder].forEach((node) => {
    node.addEventListener("input", () => applyFilter(characters));
    node.addEventListener("change", () => applyFilter(characters));
  });
}

init().catch((error) => {
  characterGrid.innerHTML = `<p class="muted">読み込みに失敗しました: ${escapeHtml(error.message)}</p>`;
});
