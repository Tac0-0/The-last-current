import { bg } from "../config/localeBg.js";
import { CHAPTERS } from "../config/chapters.js";

export function journalView(unlocked) {
  return `<section class="journal-index"><p class="eyebrow">${bg.journalSubtitle}</p><h2 id="dialog-title">${bg.book}</h2><p>${bg.journalIntro}</p>
    <div class="chapter-grid">${CHAPTERS.map((c) => {
      const open = unlocked.includes(c.id);
      return `<button class="chapter-tile ${open ? "" : "locked"}" data-action="chapter" data-id="${c.id}" ${open ? "" : "disabled"}>
        ${open ? `<img src="${c.illustration}" alt="${bg.artAlt[c.id]}">` : '<div class="locked-plate"><span>⌁</span></div>'}
        <span class="chapter-number">${bg.chapter} ${c.roman}</span><strong>${open ? c.title : bg.undiscovered}</strong><small>${open ? bg.continue + " →" : bg.locked}</small></button>`;
    }).join(
      "",
    )}</div><button class="text-button dark" data-action="close">← ${bg.back}</button></section>`;
}
export function chapterView(id, story = false) {
  const c = CHAPTERS[id - 1];
  return `<article class="book-page"><div class="book-illustration"><img src="${c.illustration}" alt="${bg.artAlt[id]}"><span class="plate-number">${c.roman}</span></div>
    <div class="book-copy"><p class="eyebrow">${story ? bg.unlocked : bg.book} <span> / ${c.roman}</span></p><h2 id="dialog-title">${c.title}</h2>
    <p class="book-fact">${c.fact}</p><div class="book-explanation"><p>${c.cause}</p><p>${c.solution}</p></div>
    <div class="book-bottom"><div class="source-links">${c.sources.map((source) => `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${bg.source}: ${source.label} →</a>`).join("")}</div>
    <button class="button ink" data-action="${story ? "continue-story" : "journal"}">${story ? bg.continue : bg.back} ${story ? "→" : ""}</button></div></div></article>`;
}
