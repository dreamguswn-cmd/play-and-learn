"use strict";

class FallingText {
  constructor(text, stage, canvas) {
    this.text = text;
    this.stage = stage;
    this.y = 82;
    this.speed = [32, 38, 44][stage];
    this.width = Math.max(110, text.length * (stage === 2 ? 25 : 34) + 44);
    this.x = 25 + Math.random() * Math.max(1, canvas.width - this.width - 50);
  }

  update(deltaTime, score) {
    this.y += (this.speed + Math.min(score * 0.045, 35)) * deltaTime;
  }

  draw(context) {
    const colors = ["#38bdf8", "#a78bfa", "#fb7185"];
    context.fillStyle = "rgba(15, 23, 42, 0.84)";
    context.fillRect(this.x, this.y, this.width, 58);
    context.strokeStyle = colors[this.stage];
    context.lineWidth = 4;
    context.strokeRect(this.x, this.y, this.width, 58);
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `${this.stage === 2 ? 700 : 900} ${this.stage === 2 ? 20 : 28}px system-ui`;
    context.fillText(this.text, this.x + this.width / 2, this.y + 30);
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
  }
}

class TextFactory {
  static create(stage) {
    const sets = [
      ["가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하"],
      ["학교", "친구", "하늘", "구름", "자동차", "고양이", "강아지", "무지개", "컴퓨터", "도서관", "대한민국", "즐거운"],
      [
        "오늘도 즐겁게 공부해요",
        "푸른 하늘에 구름이 떠요",
        "친구와 함께 학교에 가요",
        "책을 읽으면 생각이 자라요",
        "천천히 정확하게 입력해요",
        "작은 노력도 모이면 힘이 돼요",
      ],
    ];
    const choices = sets[stage];
    return choices[Math.floor(Math.random() * choices.length)];
  }
}

class Character {
  draw(context, cosmetics, wardrobe) {
    if (wardrobe?.draw(context, 350, 330, 100, 125)) return;
    const x = 380;
    const y = 412;
    if (cosmetics.has("반짝이 오라")) {
      const glow = context.createRadialGradient(x + 20, y + 22, 5, x + 20, y + 22, 55);
      glow.addColorStop(0, "rgba(250, 204, 21, .6)");
      glow.addColorStop(1, "rgba(250, 204, 21, 0)");
      context.fillStyle = glow;
      context.beginPath();
      context.arc(x + 20, y + 22, 55, 0, Math.PI * 2);
      context.fill();
    }
    if (cosmetics.has("타자 망토")) {
      context.fillStyle = "#ec4899";
      context.beginPath();
      context.moveTo(x + 8, y + 15);
      context.lineTo(x - 12, y + 48);
      context.lineTo(x + 18, y + 42);
      context.fill();
    }
    context.fillStyle = "#fbbf24";
    context.fillRect(x + 6, y + 13, 29, 32);
    context.fillStyle = "#fde68a";
    context.beginPath();
    context.arc(x + 20, y + 10, 13, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#172554";
    context.fillRect(x + 13, y + 7, 3, 3);
    context.fillRect(x + 25, y + 7, 3, 3);

    if (cosmetics.has("키보드 모자")) {
      context.fillStyle = "#334155";
      context.fillRect(x - 1, y - 10, 43, 12);
      context.fillStyle = "#94a3b8";
      for (let key = 0; key < 6; key += 1) {
        context.fillRect(x + 2 + key * 6, y - 7, 4, 4);
      }
    }
    if (cosmetics.has("황금 왕관")) {
      context.fillStyle = "#facc15";
      context.beginPath();
      context.moveTo(x + 6, y - 2);
      context.lineTo(x + 8, y - 17);
      context.lineTo(x + 17, y - 8);
      context.lineTo(x + 22, y - 20);
      context.lineTo(x + 30, y - 8);
      context.lineTo(x + 35, y - 17);
      context.lineTo(x + 35, y - 2);
      context.fill();
    }
  }
}

class Game {
  constructor(canvas, elements) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.elements = elements;
    this.wardrobe = new CharacterWardrobe(elements.wardrobe);
    this.character = new Character();
    this.loop = this.loop.bind(this);
    this.lastTime = 0;
    this.isRunning = false;
    this.playerName = "";
    this.records = this.loadRecords();
    this.cosmeticLevels = [
      { score: 60, name: "키보드 모자" },
      { score: 150, name: "타자 망토" },
      { score: 280, name: "황금 왕관" },
      { score: 450, name: "반짝이 오라" },
    ];

    elements.startForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.playerName = elements.name.value.trim().slice(0, 12);
      if (!this.playerName) return;
      elements.startScreen.hidden = true;
      this.reset();
      requestAnimationFrame(() => elements.input.focus());
    });
    elements.input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        this.submit();
      }
    });
    elements.continueStage.addEventListener("click", () => {
      elements.stageClear.hidden = true;
      this.paused = false;
      this.spawnText();
      elements.input.focus();
    });
    elements.restart.addEventListener("click", () => this.showStart());

    this.reset();
    this.showStart();
  }

  loadRecords() {
    try {
      return JSON.parse(localStorage.getItem("typing-cloud-records") || "[]");
    } catch {
      return [];
    }
  }

  reset() {
    this.score = 0;
    this.lives = 3;
    this.stage = 0;
    this.correctInStage = 0;
    this.totalTyped = 0;
    this.correctTyped = 0;
    this.current = null;
    this.paused = false;
    this.gameOver = false;
    this.unlockedCosmetics = new Set();
    this.unlockMessage = "";
    this.unlockTimer = 0;
    this.elements.input.value = "";
    this.elements.typingBar.hidden = false;
    this.elements.stageClear.hidden = true;
    this.elements.gameOver.hidden = true;
    this.spawnText();
    this.updateStatus();
  }

  showStart() {
    this.paused = true;
    this.gameOver = true;
    this.elements.typingBar.hidden = true;
    this.elements.stageClear.hidden = true;
    this.elements.gameOver.hidden = true;
    this.elements.startScreen.hidden = false;
    this.elements.name.value = this.playerName;
    this.renderLeaderboard();
    requestAnimationFrame(() => this.elements.name.focus());
  }

  renderLeaderboard() {
    const leaders = [...this.records].sort((a, b) => b.score - a.score).slice(0, 5);
    this.elements.leaderboard.replaceChildren();
    if (!leaders.length) {
      const item = document.createElement("li");
      item.textContent = "아직 기록이 없어요.";
      this.elements.leaderboard.append(item);
      return;
    }
    leaders.forEach((record, index) => {
      const item = document.createElement("li");
      item.textContent = `${index + 1}. ${record.name} — ${record.score}점`;
      this.elements.leaderboard.append(item);
    });
  }

  spawnText() {
    this.current = new FallingText(TextFactory.create(this.stage), this.stage, this.canvas);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  loop(time) {
    const deltaTime = Math.min((time - this.lastTime) / 1000, 0.04);
    this.lastTime = time;
    if (!this.paused && !this.gameOver) this.update(deltaTime);
    this.render();
    requestAnimationFrame(this.loop);
  }

  update(deltaTime) {
    this.current.update(deltaTime, this.score);
    this.unlockTimer = Math.max(0, this.unlockTimer - deltaTime);
    if (this.current.y + 58 >= 405) {
      this.lives -= 1;
      this.totalTyped += 1;
      this.elements.input.value = "";
      if (this.lives <= 0) {
        this.endGame();
      } else {
        this.spawnText();
        this.updateStatus();
      }
    }
  }

  normalize(text) {
    return text.trim().replace(/\s+/g, " ");
  }

  submit() {
    if (this.paused || this.gameOver || !this.current) return;
    const entered = this.normalize(this.elements.input.value);
    if (!entered) return;
    this.totalTyped += 1;

    if (entered === this.current.text) {
      const points = [10, 20, 40][this.stage];
      this.score += points;
      this.correctTyped += 1;
      this.correctInStage += 1;
      this.checkCosmetics();
      this.elements.input.value = "";

      if (this.correctInStage >= 10 && this.stage < 2) {
        this.paused = true;
        this.stage += 1;
        this.correctInStage = 0;
        this.elements.clearTitle.textContent =
          `${["", "단어", "문장"][this.stage]} 단계 해금!`;
        this.elements.clearText.textContent =
          `${this.playerName}님, 더 긴 글에 도전해 보세요!`;
        this.elements.stageClear.hidden = false;
      } else {
        this.spawnText();
      }
    } else {
      this.lives -= 1;
      this.elements.input.classList.add("wrong");
      window.setTimeout(() => this.elements.input.classList.remove("wrong"), 300);
      if (this.lives <= 0) this.endGame();
    }
    this.updateStatus();
  }

  checkCosmetics() {
    for (const item of this.cosmeticLevels) {
      if (this.score >= item.score && !this.unlockedCosmetics.has(item.name)) {
        this.unlockedCosmetics.add(item.name);
        this.unlockMessage = `새 아이템! ${item.name}`;
        this.unlockTimer = 3;
      }
    }
  }

  updateStatus() {
    const stageName = ["낱글자", "단어", "문장"][this.stage];
    const accuracy = this.totalTyped
      ? Math.round(this.correctTyped / this.totalTyped * 100)
      : 100;
    const items = [...this.unlockedCosmetics].join(" · ");
    this.elements.status.textContent =
      `${this.playerName || "타자왕"} · ${stageName} · ${this.score}점`
      + ` · 목숨 ${"♥".repeat(this.lives)} · 정확도 ${accuracy}%`
      + (items ? ` · 아이템: ${items}` : "");
  }

  endGame() {
    this.gameOver = true;
    this.paused = true;
    this.elements.typingBar.hidden = true;
    const existing = this.records.find((record) => record.name === this.playerName);
    if (existing) {
      existing.score = Math.max(existing.score, this.score);
    } else {
      this.records.push({ name: this.playerName, score: this.score });
    }
    localStorage.setItem("typing-cloud-records", JSON.stringify(this.records));
    const best = this.records.find((record) => record.name === this.playerName).score;
    this.elements.final.textContent =
      `${this.playerName} · 점수 ${this.score}점 · 개인 최고 ${best}점`;
    this.elements.gameOver.hidden = false;
  }

  render() {
    const gradient = this.context.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, "#065f46");
    gradient.addColorStop(1, "#a7f3d0");
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.fillStyle = "rgba(255,255,255,.65)";
    for (let i = 0; i < 8; i += 1) {
      const x = (i * 137 + 42) % this.canvas.width;
      const y = (i * 73 + 35) % 370;
      this.context.beginPath();
      this.context.arc(x, y, 17, 0, Math.PI * 2);
      this.context.arc(x + 22, y + 3, 23, 0, Math.PI * 2);
      this.context.fill();
    }

    this.context.fillStyle = "#334155";
    this.context.fillRect(0, 402, this.canvas.width, 9);
    if (this.current) this.current.draw(this.context);
    this.wardrobe.sync(this.score);
    this.character.draw(this.context, this.unlockedCosmetics, this.wardrobe);

    const stageName = ["낱글자", "단어", "문장"][this.stage];
    this.context.fillStyle = "rgba(15,23,42,.82)";
    this.context.fillRect(14, 12, 300, 64);
    this.context.fillStyle = "#fff";
    this.context.font = "800 22px system-ui";
    this.context.fillText(`${stageName} · ${this.score}점`, 28, 39);
    this.context.font = "700 16px system-ui";
    this.context.fillText(
      `목숨 ${"♥".repeat(this.lives)} · 단계 정답 ${this.correctInStage}/10`,
      28,
      64
    );

    const next = this.cosmeticLevels.find(
      (item) => !this.unlockedCosmetics.has(item.name)
    );
    if (next) {
      this.context.fillStyle = "rgba(15,23,42,.72)";
      this.context.fillRect(this.canvas.width - 225, 12, 211, 38);
      this.context.fillStyle = "#fef08a";
      this.context.font = "700 15px system-ui";
      this.context.fillText(`다음 아이템 ${next.score}점`, 592, 37);
    }

    if (this.unlockTimer > 0) {
      this.context.fillStyle = "rgba(15,23,42,.9)";
      this.context.fillRect(195, 95, 410, 66);
      this.context.strokeStyle = "#facc15";
      this.context.lineWidth = 4;
      this.context.strokeRect(195, 95, 410, 66);
      this.context.fillStyle = "#fef08a";
      this.context.textAlign = "center";
      this.context.font = "900 24px system-ui";
      this.context.fillText(this.unlockMessage, 400, 136);
      this.context.textAlign = "left";
    }
  }
}

const canvas = document.querySelector("#gameCanvas");
const game = new Game(canvas, {
  startScreen: document.querySelector("#startScreen"),
  startForm: document.querySelector("#startForm"),
  name: document.querySelector("#playerName"),
  leaderboard: document.querySelector("#leaderboard"),
  typingBar: document.querySelector("#typingBar"),
  input: document.querySelector("#typingInput"),
  stageClear: document.querySelector("#stageClear"),
  clearTitle: document.querySelector("#clearTitle"),
  clearText: document.querySelector("#clearText"),
  continueStage: document.querySelector("#continueStage"),
  gameOver: document.querySelector("#gameOver"),
  final: document.querySelector("#finalScore"),
  restart: document.querySelector("#restart"),
  status: document.querySelector("#status"),
  wardrobe: document.querySelector("#wardrobe"),
});
game.start();
