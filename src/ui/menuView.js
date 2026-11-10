import { bg } from "../config/localeBg.js";
export const waveMark =
  '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M4 15Q12 7 20 15T36 15M4 25Q12 17 20 25T36 25" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
export function menuView() {
  return `<section id="menu" class="menu"><div class="hero-copy"><p class="eyebrow"><span class="tiny-line"></span>${bg.eyebrow}</p><h1>${bg.title.split(" ")[0]}<br><em>${bg.title.split(" ").slice(1).join(" ")}</em><span class="title-stop">.</span></h1><p class="tagline">${bg.tagline}</p>
    <div class="hero-actions"><button class="button primary" data-action="play">${bg.play}<span>→</span></button><button class="text-button" data-action="journal">${bg.book}<span class="menu-progress">0 / 3</span></button></div>
    <p class="duration"><span class="clock-icon" aria-hidden="true"></span>${bg.duration}</p></div>
    <div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><img src="./assets/art/turtle.svg" alt=""><span class="turtle-caption"><i></i>01 / ${bg.shelly}</span><span class="sea-caption">${bg.menuNote}</span></div>
    <footer class="menu-bottom"><span>${bg.menuFooter}</span><span>${bg.category}<i class="small-wave">∿</i></span></footer></section>`;
}
