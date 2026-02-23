import { escapeHtml, loadJson, uniqueValues } from "./common.js";

const searchInput = document.getElementById("searchInput");
const rarityFilter = document.getElementById("rarityFilter");
const elementFilter = document.getElementById("elementFilter");
const roleFilter = document.getElementById("roleFilter");
const weaponFilter = document.getElementById("weaponFilter");
const characterGrid = document.getElementById("characterGrid");
const characterCount = document.getElementById("characterCount");

function fillSelect(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function renderCards(characters) {
  characterCount.textContent = `${characters.length}件`;
  characterGrid.innerHTML = characters
    .map(
      (character) => `
      <article class="info-card">
        <div class="row">
          <h3>${escapeHtml(character.name)}</h3>
          <span class="chip">★${character.rarity}</span>
        </div>
        <p class="muted">${escapeHtml(character.description)}</p>
        <p class="tiny">${escapeHtml(character.element)} / ${escapeHtml(character.role)} / ${escapeHtml(character.weapon_type)}</p>
        <a class="text-link" href="./character.html?id=${encodeURIComponent(character.id)}">詳細を見る</a>
      </article>
    `
    )
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

  renderCards(filtered);
}

async function init() {
  const characters = await loadJson("./data/characters.json");
  fillSelect(rarityFilter, uniqueValues(characters, "rarity").map(String));
  fillSelect(elementFilter, uniqueValues(characters, "element"));
  fillSelect(roleFilter, uniqueValues(characters, "role"));
  fillSelect(weaponFilter, uniqueValues(characters, "weapon_type"));
  renderCards(characters);

  [searchInput, rarityFilter, elementFilter, roleFilter, weaponFilter].forEach((node) => {
    node.addEventListener("input", () => applyFilter(characters));
    node.addEventListener("change", () => applyFilter(characters));
  });
}

init().catch((error) => {
  characterGrid.innerHTML = `<p class="muted">読み込みに失敗しました: ${escapeHtml(error.message)}</p>`;
});
