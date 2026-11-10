import { bg } from "../config/localeBg.js";
import { TOWERS, BALANCE, PAD_POSITIONS } from "../config/balance.js";
import { SOURCES } from "../config/chapters.js";
import { menuView, waveMark } from "./menuView.js";
import { journalView, chapterView } from "./bookView.js";
import { saveProgress } from "../storage/progress.js";

const actionButton = (action, text, classes = "button primary") =>
  `<button class="${classes}" data-action="${action}">${text}</button>`;
export class UIController {
  constructor(model, audio) {
    this.model = model;
    this.audio = audio;
    this.selectedPad = null;
    this.selectedType = null;
    this.hoverPad = null;
    this.modal = null;
    this.chapter = 1;
    this.lastPhase = "";
    this.lastPanel = "";
    this.lastHud = 0;
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.root = document.querySelector("#app");
    this.root.innerHTML = `<header class="site-header"><button class="brand" data-action="home" aria-label="${bg.mainMenu}">${waveMark}<span>${bg.title}</span></button><nav aria-label="${bg.mainMenu}"><button class="text-button" data-action="journal">${bg.book}<span class="menu-progress">0 / 3</span></button><button class="text-button" data-action="credits">${bg.credits}</button><button class="sound-button" data-action="mute" aria-label="${bg.mute}"><span aria-hidden="true">♫</span><span class="sound-text">${bg.mute}</span></button></nav></header>
      ${menuView()}
      <main id="game-shell" class="game-shell inactive"><div class="game-stage"><div id="canvas-host"></div>
        <div id="hud" class="hud"><div class="health-group"><span class="hud-label">${bg.health}</span><div class="health-row"><span class="health-icon" aria-hidden="true">♡</span><strong id="health-value">10 / 10</strong><div class="health-track"><span id="health-fill"></span></div></div></div>
        <div class="wave-group"><span id="wave-count" class="hud-label"></span><strong id="wave-name"></strong></div><div class="currency-group"><span class="hud-label">${bg.currency}</span><strong><i aria-hidden="true">◈</i> <span id="credits-value">110</span></strong></div>
        <div class="hud-controls"><button class="small-button" data-action="pause">${bg.pause}</button><button class="small-button restart-button" data-action="restart">${bg.restart}</button></div></div>
        <div class="wave-intro"><span class="eyebrow" id="stage-status"></span><p id="stage-hint"></p></div>
        <div id="boss-hud" class="boss-hud" hidden><div><span id="boss-name"></span><span id="boss-hp"></span></div><div class="boss-track"><span id="boss-fill"></span></div><small id="boss-ability"></small></div>
        <div class="pad-controls">${PAD_POSITIONS.map((p, i) => `<button class="pad-hit" data-action="pad" data-pad="${i}" aria-label="${bg.pad(i)} — ${bg.emptyPad}" style="left:${p.x / 12.8}%;top:${p.y / 7.2}%"></button>`).join("")}</div>
        <div id="tutorial" class="tutorial" hidden><strong>${bg.tutorialTitle}</strong><ol>${bg.tutorial.map((t) => `<li>${t}</li>`).join("")}</ol>${actionButton("dismiss-tutorial", bg.tutorialDismiss, "text-button")}</div>
        <div id="ending-caption" class="ending-caption" hidden></div><button id="skip-ending" class="text-button skip-ending" data-action="skip" hidden>${bg.skip} →</button>
        <div class="shop" id="shop"><div class="shop-towers">${Object.entries(
          TOWERS,
        )
          .map(
            ([type, t]) =>
              `<button class="tower-card" data-action="tower" data-type="${type}" title="${bg.towers[type].description} ${bg.towers[type].stats}"><img src="./assets/art/${type}.svg" alt=""><span><small>${bg.towers[type].role}</small><strong>${bg.towers[type].name}</strong><em>${t.cost} <span>${bg.currency}</span></em></span></button>`,
          )
          .join(
            "",
          )}</div><div id="selection-panel" class="selection-panel"></div><button id="start-wave" class="button primary start-wave" data-action="start">${bg.startWave}<span>→</span></button></div>
      </div><div class="game-foot"><button class="text-button" data-action="journal">${bg.book} <span id="book-count">0 / 3</span></button><span>${bg.keyboardHint}</span></div></main>
      <dialog id="dialog" aria-labelledby="dialog-title"><div id="dialog-content"></div></dialog><div id="announcer" class="sr-only" role="status" aria-live="polite"></div>`;
    this.dialog = this.root.querySelector("#dialog");
    this.root.addEventListener("click", (e) => {
      const button = e.target.closest("[data-action]");
      if (!button || button.disabled) return;
      this.audio.enable();
      this.action(button.dataset.action, button.dataset);
    });
    this.root.addEventListener("pointerover", (e) => {
      const pad = e.target.closest("[data-pad]");
      if (pad) this.hoverPad = Number(pad.dataset.pad);
    });
    this.root.addEventListener("pointerout", (e) => {
      if (e.target.closest("[data-pad]")) this.hoverPad = null;
    });
    this.dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      this.escape();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.dialog.open) {
        e.preventDefault();
        this.escape();
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.model.phase === "playing") {
        this.model.paused = true;
        this.refresh(true);
      }
    });
    this.refresh(true);
  }
  ready() {
    this.loaded = true;
  }
  error() {
    this.root.querySelector("#announcer").textContent = bg.loadError;
  }
  onPad(pad) {
    if (!this.model.canBuild) return;
    this.selectedPad = pad;
    if (!this.model.towers.some((t) => t.pad === pad) && this.selectedType)
      this.model.build(this.selectedType, pad);
    this.refresh(true);
  }
  handleEvent(event) {
    this.audio.play(event.type);
    if (event.type === "progress") saveProgress(this.model.progress);
    if (event.type === "reset") {
      this.selectedPad = null;
      this.selectedType = null;
      this.lastPanel = "";
    }
    if (event.type === "boss")
      this.root.querySelector("#announcer").textContent =
        `${bg.bossArrival} ${bg.enemyNames[event.enemy.type]}. ${bg.bossAbilities[event.enemy.type]}`;
  }
  action(action, data = {}) {
    const m = this.model;
    if (
      action === "play" ||
      action === "play-again" ||
      action === "confirm-restart"
    ) {
      this.closeModal();
      m.reset();
      this.tutorialVisible = !this.tutorialSeen;
      this.selectedPad = null;
      this.selectedType = null;
    } else if (action === "tower") {
      if (!m.canBuild) return;
      this.selectedType = data.type;
      if (
        this.selectedPad !== null &&
        !m.towers.some((t) => t.pad === this.selectedPad)
      )
        m.build(data.type, this.selectedPad);
      else this.selectedPad = null;
    } else if (action === "pad") this.onPad(Number(data.pad));
    else if (action === "upgrade") m.upgrade(this.selectedPad);
    else if (action === "sell") m.sell(this.selectedPad);
    else if (action === "start") {
      this.tutorialVisible = false;
      this.tutorialSeen = true;
      m.startWave();
    } else if (action === "dismiss-tutorial") {
      this.tutorialVisible = false;
      this.tutorialSeen = true;
    } else if (action === "pause") {
      if (["prep", "playing"].includes(m.phase)) m.paused = true;
    } else if (action === "resume") m.paused = false;
    else if (action === "mute") {
      m.progress.mute = !m.progress.mute;
      saveProgress(m.progress);
    } else if (action === "journal") this.openModal("journal");
    else if (action === "chapter") {
      if (m.progress.unlockedChapters.includes(Number(data.id))) {
        this.chapter = Number(data.id);
        this.openModal("chapter");
      }
    } else if (action === "credits") this.openModal("credits");
    else if (action === "close") this.closeModal();
    else if (action === "restart") this.openModal("restart");
    else if (action === "home") {
      if (["menu", "complete"].includes(m.phase)) {
        this.closeModal();
        m.reset("menu");
      } else this.openModal("home");
    } else if (action === "confirm-home") {
      this.closeModal();
      m.reset("menu");
    } else if (action === "retry") {
      this.closeModal();
      m.retry();
    } else if (action === "continue-story") {
      this.closeModal();
      m.continueStory();
    } else if (action === "skip") m.skipEnding();
    this.refresh(true);
  }
  escape() {
    if (this.modal) this.closeModal();
    else if (this.model.paused) this.model.paused = false;
    else if (this.selectedPad !== null || this.selectedType) {
      this.selectedPad = null;
      this.selectedType = null;
    } else if (["prep", "playing"].includes(this.model.phase))
      this.model.paused = true;
    this.refresh(true);
  }
  openModal(name) {
    if (["ending", "message", "book"].includes(this.model.phase)) return;
    this.modal = name;
    this.model.overlayOpen = true;
  }
  closeModal() {
    this.modal = null;
    this.model.overlayOpen = false;
  }
  refresh(force = false) {
    const m = this.model;
    const phaseKey = `${m.phase}:${m.wave}:${m.paused}:${this.modal}:${this.chapter}`;
    if (phaseKey !== this.lastPhase) {
      this.lastPhase = phaseKey;
      this.renderModal();
      document.body.dataset.phase = m.phase;
      this.root.querySelector("#menu").hidden = m.phase !== "menu";
      this.root
        .querySelector("#game-shell")
        .classList.toggle("inactive", m.phase === "menu");
      this.root
        .querySelector(".site-header")
        .classList.toggle("in-game", m.phase !== "menu");
      this.root.querySelector("#announcer").textContent =
        m.phase === "prep" ? `${bg.wave(m.wave + 1)}. ${bg.prepare}.` : "";
      force = true;
    }
    if (!force && performance.now() - this.lastHud < 100) return;
    this.lastHud = performance.now();
    const set = (id, value) => {
      this.root.querySelector(id).textContent = value;
    };
    set("#health-value", `${m.health} / ${BALANCE.health}`);
    this.root.querySelector("#health-fill").style.width =
      `${(m.health / BALANCE.health) * 100}%`;
    set("#credits-value", m.credits);
    set("#wave-count", bg.wave(m.wave + 1));
    set("#wave-name", bg.waveNames[m.wave]);
    set("#stage-status", m.phase === "prep" ? bg.prepare : bg.playing);
    set(
      "#stage-hint",
      m.phase === "prep" && m.wave === 0 ? bg.buildHint : bg.waveHint,
    );
    this.root.querySelector(".wave-intro").hidden = ![
      "prep",
      "playing",
    ].includes(m.phase);
    set("#book-count", `${m.progress.unlockedChapters.length} / 3`);
    this.root.querySelectorAll(".menu-progress").forEach((e) => {
      e.textContent = `${m.progress.unlockedChapters.length} / 3`;
    });
    this.root.querySelectorAll('[data-action="mute"]').forEach((e) => {
      e.setAttribute("aria-label", m.progress.mute ? bg.unmute : bg.mute);
      e.querySelector(".sound-text").textContent = m.progress.mute
        ? bg.unmute
        : bg.mute;
      e.setAttribute("aria-pressed", String(m.progress.mute));
    });
    this.root.querySelector("#tutorial").hidden =
      !this.tutorialVisible || m.phase !== "prep" || m.wave !== 0;
    this.root.querySelector("#start-wave").hidden = m.phase !== "prep";
    this.root.querySelector("#shop").hidden = !["prep", "playing"].includes(
      m.phase,
    );
    this.root.querySelector("#hud").hidden =
      ["ending", "message", "complete"].includes(m.phase) ||
      (m.phase === "book" && m.wave === 2);
    this.root.querySelectorAll(".pad-hit").forEach((e, i) => {
      e.disabled = !m.canBuild;
      const tower = m.towers.find((t) => t.pad === i);
      e.setAttribute(
        "aria-label",
        `${bg.pad(i)} — ${tower ? bg.towers[tower.type].name : bg.emptyPad}`,
      );
      e.setAttribute("aria-pressed", String(this.selectedPad === i));
    });
    this.root.querySelectorAll(".tower-card").forEach((e) => {
      e.disabled = !m.canBuild || m.credits < TOWERS[e.dataset.type].cost;
      e.classList.toggle("selected", this.selectedType === e.dataset.type);
      e.setAttribute(
        "aria-pressed",
        String(this.selectedType === e.dataset.type),
      );
    });
    const boss = m.enemies.find((e) => e.boss && !e.dead);
    this.root.querySelector("#boss-hud").hidden =
      !boss || m.phase !== "playing";
    if (boss) {
      set("#boss-name", bg.enemyNames[boss.type]);
      set("#boss-hp", `${Math.max(0, Math.ceil(boss.hp))} / ${boss.maxHp}`);
      set("#boss-ability", bg.bossAbilities[boss.type]);
      this.root.querySelector("#boss-fill").style.width =
        `${(boss.hp / boss.maxHp) * 100}%`;
    }
    const ending = m.phase === "ending";
    this.root.querySelector("#ending-caption").hidden = !ending;
    this.root.querySelector("#skip-ending").hidden = !ending;
    if (ending) {
      const t = m.endingTime;
      this.root.querySelector("#ending-caption").innerHTML =
        t < 3
          ? `<p class="eyebrow">${bg.finalWave}</p>`
          : t < 17
            ? `<p>${t < 6 ? bg.distantSurge : ""}</p>`
            : `<div class="ending-lines">${bg.finalLines
                .slice(0, Math.min(4, 1 + Math.floor((t - 17) / 2)))
                .map((line, i) => `<p class="line-${i}">${line}</p>`)
                .join("")}</div>`;
    }
    const tower = m.towers.find((t) => t.pad === this.selectedPad);
    const panelKey = `${this.selectedPad}:${this.selectedType}:${tower?.type}:${tower?.level}:${m.credits}:${m.canBuild}:${tower?.disabledUntil > m.clock}`;
    if (panelKey !== this.lastPanel) {
      this.lastPanel = panelKey;
      this.renderSelection(tower);
    }
  }
  renderSelection(tower) {
    const panel = this.root.querySelector("#selection-panel");
    if (tower) {
      const def = TOWERS[tower.type];
      panel.innerHTML = `<span class="hud-label">${bg.pad(tower.pad)} · ${bg.level(tower.level)}</span><strong>${bg.towers[tower.type].name}</strong><small>${tower.disabledUntil > this.model.clock ? bg.disabled : tower.level ? bg.towers[tower.type].upgrade : bg.towers[tower.type].stats}</small><div class="tower-actions"><button class="small-button" data-action="upgrade" ${tower.level || !this.model.canBuild || this.model.credits < def.upgradeCost ? "disabled" : ""}>${tower.level ? bg.upgraded : `${bg.upgrade} · ${def.upgradeCost}`}</button><button class="text-button" data-action="sell" ${!this.model.canBuild ? "disabled" : ""}>${bg.sell} · ${Math.floor(tower.invested * BALANCE.sellRatio)}</button></div>`;
    } else {
      const text = this.selectedType
        ? bg.towers[this.selectedType].description
        : bg.selectHint;
      panel.innerHTML = `<span class="hud-label">${this.selectedPad !== null ? bg.pad(this.selectedPad) : bg.build}</span><strong>${this.selectedPad !== null ? bg.emptyPad : bg.selectPad}</strong><small>${text}</small>`;
    }
  }
  renderModal() {
    const m = this.model;
    let content = "";
    let paper = false;
    if (this.modal === "journal") {
      content = journalView(m.progress.unlockedChapters);
      paper = true;
    } else if (this.modal === "chapter") {
      content = chapterView(this.chapter);
      paper = true;
    } else if (this.modal === "credits") {
      paper = true;
      content = `<section class="credits-page"><p class="eyebrow">${bg.category}</p><h2 id="dialog-title">${bg.credits}</h2><p>${bg.creditsIntro}</p><div class="credits-grid"><div><h3>${bg.team}</h3>${bg.creators.map((n) => `<p>${n}</p>`).join("")}<h3>${bg.artCredit}</h3><p>${bg.artLicense}</p><h3>${bg.technology}</h3><p>${bg.technologies}</p></div><div><h3>${bg.sources}</h3>${Object.values(
        SOURCES,
      )
        .map(
          (s) =>
            `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label} →</a>`,
        )
        .join(
          "",
        )}</div></div>${actionButton("close", "← " + bg.back, "button ink")}</section>`;
    } else if (["restart", "home"].includes(this.modal)) {
      content = this.simpleDialog(
        bg.restartTitle,
        bg.restartBody,
        actionButton(
          this.modal === "home" ? "confirm-home" : "confirm-restart",
          this.modal === "home" ? bg.mainMenu : bg.restartRun,
        ) + actionButton("close", bg.cancel, "text-button"),
      );
    } else if (m.paused)
      content = this.simpleDialog(
        bg.pause,
        bg.pauseBody,
        actionButton("resume", bg.resume) +
          actionButton("restart", bg.restartRun, "text-button"),
      );
    else if (m.phase === "defeat")
      content = this.simpleDialog(
        m.failure === "boss" ? bg.bossLeak : bg.defeat,
        bg.defeatBody,
        actionButton("retry", bg.retry) +
          actionButton("confirm-restart", bg.restartRun, "text-button"),
      );
    else if (m.phase === "book") {
      content = chapterView(m.wave + 1, true);
      paper = true;
    } else if (m.phase === "message") {
      content = `<section class="final-message"><span class="message-wave">∿</span><h2 id="dialog-title">${bg.finalLines[0]}<br><em>${bg.finalLines[1]}</em></h2><p>${bg.finalLines[2]}</p><p class="message-action">${bg.finalLines[3]}</p>${actionButton("continue-story", bg.continue + " →")}</section>`;
    } else if (m.phase === "complete") {
      content = `<section class="closing"><p class="eyebrow">${bg.didNotSurvive}</p><h2 id="dialog-title">${bg.nextTurtle}</h2><p>${bg.closingNote}</p><div class="closing-actions">${actionButton("journal", bg.readBook)}${actionButton("play-again", bg.playAgain, "button outline")}${actionButton("home", bg.mainMenu, "text-button")}</div></section>`;
    }
    if (content) {
      this.dialog.className = paper ? "paper-dialog" : "ocean-dialog";
      this.root.querySelector("#dialog-content").innerHTML = content;
      if (!this.dialog.open) this.dialog.showModal();
      this.dialog
        .querySelector("button:not(:disabled)")
        ?.focus({ preventScroll: true });
    } else if (this.dialog.open) this.dialog.close();
  }
  simpleDialog(title, body, buttons) {
    return `<section class="simple-dialog"><span class="message-wave">∿</span><h2 id="dialog-title">${title}</h2><p>${body}</p><div class="dialog-actions">${buttons}</div></section>`;
  }
}
