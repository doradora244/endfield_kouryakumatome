const topics = [
  {
    title: "戦闘システム観測メモ",
    body: "公開情報をもとに、編成とアクション要素の注目点を整理する予定。"
  },
  {
    title: "世界観・勢力整理",
    body: "時系列とキーワードベースで、勢力情報を追える形に整備予定。"
  },
  {
    title: "序盤育成の優先度",
    body: "素材消費と戦力効率を軸に、育成優先順位を分かりやすく掲載予定。"
  },
  {
    title: "装備・ビルド研究",
    body: "武器や強化要素の組み合わせ検証を、実用重視で記録予定。"
  }
];

const topicList = document.getElementById("topicList");
const updatedAt = document.getElementById("updatedAt");

updatedAt.textContent = new Date().toLocaleDateString("ja-JP");

topicList.innerHTML = topics
  .map(
    (item, i) => `
      <article class="topic-card" style="animation-delay:${i * 60}ms;">
        <span class="chip endfield">Endfield</span>
        <h3>${item.title}</h3>
        <p>${item.body}</p>
      </article>
    `
  )
  .join("");
