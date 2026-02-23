import { escapeHtml, loadJson } from "./common.js";

const updateList = document.getElementById("updateList");

async function init() {
  const updates = await loadJson("./data/updates.json");
  updateList.innerHTML = updates
    .map((entry) => {
      const items = entry.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
      const scope = entry.data_scope.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join(" ");
      return `
        <article class="soft-card">
          <div class="row">
            <h3>v${escapeHtml(entry.version)}</h3>
            <span class="tiny">${escapeHtml(entry.date)}</span>
          </div>
          <p>${escapeHtml(entry.summary)}</p>
          <ul>${items}</ul>
          <div class="chip-row">${scope}</div>
        </article>
      `;
    })
    .join("");
}

init().catch((error) => {
  updateList.innerHTML = `<p class="muted">読み込みに失敗しました: ${escapeHtml(error.message)}</p>`;
});
