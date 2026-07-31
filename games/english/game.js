"use strict";

class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

class Collision {
  static isAABB(a, b) {
    return (
      a.x < b.x + b.width
      && a.x + a.width > b.x
      && a.y < b.y + b.height
      && a.y + a.height > b.y
    );
  }
}

class Player extends Entity {
  constructor(canvas) {
    super(canvas.width / 2 - 22, canvas.height - 72, 44, 50);
    this.speed = 330;
    this.lives = 3;
  }

  update(deltaTime, keys, canvas) {
    const direction =
      Number(keys.has("ArrowRight")) - Number(keys.has("ArrowLeft"));
    this.x += direction * this.speed * deltaTime;
    this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
  }

  draw(context, cosmetics) {
    if (cosmetics.has("무지개 오라")) {
      const gradient = context.createRadialGradient(
        this.x + 22, this.y + 25, 5,
        this.x + 22, this.y + 25, 50
      );
      gradient.addColorStop(0, "rgba(250, 204, 21, .55)");
      gradient.addColorStop(0.5, "rgba(56, 189, 248, .3)");
      gradient.addColorStop(1, "rgba(168, 85, 247, 0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(this.x + 22, this.y + 25, 50, 0, Math.PI * 2);
      context.fill();
    }

    if (cosmetics.has("파란 망토")) {
      context.fillStyle = "#2563eb";
      context.beginPath();
      context.moveTo(this.x + 8, this.y + 17);
      context.lineTo(this.x - 9, this.y + 49);
      context.lineTo(this.x + 17, this.y + 43);
      context.fill();
    }

    context.fillStyle = "#fbbf24";
    context.fillRect(this.x + 7, this.y + 14, 30, 32);
    context.fillStyle = "#fde68a";
    context.beginPath();
    context.arc(this.x + 22, this.y + 11, 13, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#172554";
    context.fillRect(this.x + 15, this.y + 8, 3, 3);
    context.fillRect(this.x + 27, this.y + 8, 3, 3);
    context.fillStyle = "#f97316";
    context.fillRect(this.x + 3, this.y + 45, 16, 5);
    context.fillRect(this.x + 25, this.y + 45, 16, 5);

    if (cosmetics.has("ABC 모자")) {
      context.fillStyle = "#7c3aed";
      context.fillRect(this.x + 3, this.y - 7, 38, 9);
      context.fillStyle = "#a78bfa";
      context.beginPath();
      context.moveTo(this.x + 8, this.y - 7);
      context.lineTo(this.x + 22, this.y - 28);
      context.lineTo(this.x + 36, this.y - 7);
      context.fill();
      context.fillStyle = "#fff";
      context.font = "900 10px system-ui";
      context.fillText("ABC", this.x + 13, this.y - 8);
    }

    if (cosmetics.has("황금 왕관")) {
      context.fillStyle = "#facc15";
      context.beginPath();
      context.moveTo(this.x + 8, this.y - 3);
      context.lineTo(this.x + 9, this.y - 17);
      context.lineTo(this.x + 18, this.y - 9);
      context.lineTo(this.x + 23, this.y - 20);
      context.lineTo(this.x + 31, this.y - 9);
      context.lineTo(this.x + 36, this.y - 17);
      context.lineTo(this.x + 36, this.y - 3);
      context.fill();
    }
  }
}

class EnglishOrb extends Entity {
  constructor(canvasWidth, stage) {
    super(Math.random() * (canvasWidth - 58), -65, 58, 58);
    this.stage = stage;
    this.speed = 125 + Math.random() * 75 + stage * 18;
  }

  update(deltaTime) {
    this.y += this.speed * deltaTime;
  }

  draw(context) {
    const colors = ["#38bdf8", "#a78bfa", "#fb7185"];
    context.fillStyle = colors[this.stage];
    context.beginPath();
    context.arc(this.x + 29, this.y + 29, 28, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#ffffff";
    context.lineWidth = 3;
    context.stroke();
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "900 23px system-ui";
    context.fillText(["A", "WORD", "Aa"][this.stage], this.x + 29, this.y + 30);
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
  }
}

class ChallengeFactory {
  static alphabet() {
    const code = 65 + Math.floor(Math.random() * 26);
    const upper = Math.random() < 0.5;
    const value = String.fromCharCode(upper ? code : code + 32);
    return {
      value,
      speech: `${upper ? "capital" : "lowercase"} letter ${value}`,
      hint: upper ? "들은 대문자를 누르세요" : "들은 소문자를 누르세요",
    };
  }

  static word() {
    const words = [
      "apple", "book", "cat", "dog", "egg", "fish", "green", "house",
      "jump", "kite", "lemon", "moon", "nose", "orange", "pencil",
      "queen", "rain", "school", "tree", "water",
    ];
    const value = words[Math.floor(Math.random() * words.length)];
    return { value, speech: value, hint: "들은 단어를 입력하세요" };
  }

  static sentence() {
    const sentences = [
      "I like apples.",
      "This is my book.",
      "The cat is small.",
      "We go to school.",
      "She has a red bag.",
      "He can jump high.",
      "It is a sunny day.",
      "I love my family.",
    ];
    const value = sentences[Math.floor(Math.random() * sentences.length)];
    return { value, speech: value, hint: "들은 문장을 입력하세요" };
  }

  static create(stage) {
    return [this.alphabet, this.word, this.sentence][stage].call(this);
  }
}

class InputController {
  constructor() {
    this.keys = new Set();
    window.addEventListener("keydown", (event) => {
      if (event.code.startsWith("Arrow")) {
        event.preventDefault();
        this.keys.add(event.code);
      }
    });
    window.addEventListener("keyup", (event) => this.keys.delete(event.code));
    window.addEventListener("blur", () => this.keys.clear());
    document.querySelectorAll("[data-key]").forEach((button) => {
      const key = button.dataset.key;
      const press = (event) => {
        event.preventDefault();
        button.setPointerCapture?.(event.pointerId);
        this.keys.add(key);
        button.classList.add("pressed");
      };
      const release = (event) => {
        event.preventDefault();
        this.keys.delete(key);
        button.classList.remove("pressed");
      };
      button.addEventListener("pointerdown", press);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("lostpointercapture", release);
    });
  }
}

class Game {
  constructor(canvas, elements) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.elements = elements;
    this.input = new InputController();
    this.loop = this.loop.bind(this);
    this.isRunning = false;
    this.lastTime = 0;
    this.playerName = "";
    this.records = this.loadRecords();
    this.cosmeticLevels = [
      { score: 50, name: "ABC 모자" },
      { score: 120, name: "파란 망토" },
      { score: 220, name: "황금 왕관" },
      { score: 350, name: "무지개 오라" },
    ];

    elements.startForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.playerName = elements.name.value.trim().slice(0, 12);
      if (!this.playerName) return;
      elements.startScreen.hidden = true;
      this.reset();
    });
    elements.challengeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.checkAnswer();
    });
    elements.listen.addEventListener("click", () => this.speak());
    elements.continueStage.addEventListener("click", () => {
      elements.stageClear.hidden = true;
      this.paused = false;
    });
    elements.restart.addEventListener("click", () => this.showStart());

    this.reset();
    this.showStart();
  }

  loadRecords() {
    try {
      return JSON.parse(localStorage.getItem("english-cloud-records") || "[]");
    } catch {
      return [];
    }
  }

  reset() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    this.player = new Player(this.canvas);
    this.orbs = [];
    this.score = 0;
    this.stage = 0;
    this.correctInStage = 0;
    this.spawnTimer = 0.7;
    this.paused = false;
    this.gameOver = false;
    this.challenge = null;
    this.unlockedCosmetics = new Set();
    this.unlockMessage = "";
    this.unlockTimer = 0;
    this.elements.challenge.hidden = true;
    this.elements.stageClear.hidden = true;
    this.elements.gameOver.hidden = true;
    this.updateStatus();
  }

  showStart() {
    this.paused = true;
    this.gameOver = true;
    this.elements.challenge.hidden = true;
    this.elements.gameOver.hidden = true;
    this.elements.startScreen.hidden = false;
    this.elements.name.value = this.playerName;
    this.renderLeaderboard();
    requestAnimationFrame(() => this.elements.name.focus());
  }

  renderLeaderboard() {
    const leaders = [...this.records]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
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
    this.player.update(deltaTime, this.input.keys, this.canvas);
    this.spawnTimer -= deltaTime;
    this.unlockTimer = Math.max(0, this.unlockTimer - deltaTime);

    if (this.spawnTimer <= 0) {
      this.orbs.push(new EnglishOrb(this.canvas.width, this.stage));
      this.spawnTimer = Math.max(0.55, 1.25 - this.score * 0.001);
    }

    for (const orb of this.orbs) orb.update(deltaTime);
    const collected = this.orbs.find((orb) =>
      Collision.isAABB(this.player, orb)
    );
    if (collected) {
      this.orbs = this.orbs.filter((orb) => orb !== collected);
      this.openChallenge();
    }
    this.orbs = this.orbs.filter((orb) => orb.y < this.canvas.height + 70);
  }

  openChallenge() {
    this.paused = true;
    this.challenge = ChallengeFactory.create(this.stage);
    this.elements.challenge.hidden = false;
    this.elements.stageLabel.textContent =
      ["알파벳 단계", "단어 단계", "문장 단계"][this.stage];
    this.elements.prompt.textContent = this.challenge.hint;
    this.elements.answer.value = "";
    this.elements.answer.maxLength = this.stage === 0 ? 1 : 80;
    this.elements.feedback.textContent = "";
    this.speak();
    requestAnimationFrame(() => this.elements.answer.focus());
  }

  speak() {
    if (!this.challenge || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const repeatCount = this.stage === 0 ? 2 : 1;
    const englishVoice = speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith("en-us"));

    for (let count = 0; count < repeatCount; count += 1) {
      const speech = new SpeechSynthesisUtterance(this.challenge.speech);
      speech.lang = "en-US";
      speech.rate = this.stage === 0 ? 0.62 : this.stage === 2 ? 0.72 : 0.82;
      speech.pitch = 1;
      speech.volume = 1;
      if (englishVoice) speech.voice = englishVoice;
      speechSynthesis.speak(speech);
    }
  }

  normalize(value) {
    return value.trim().replace(/\s+/g, " ").replace(/[.?!]$/, "").toLowerCase();
  }

  checkAnswer() {
    const entered = this.elements.answer.value;
    const correct = this.stage === 0
      ? entered === this.challenge.value
      : this.normalize(entered) === this.normalize(this.challenge.value);

    if (correct) {
      const points = [10, 20, 40][this.stage];
      this.score += points;
      this.correctInStage += 1;
      this.elements.feedback.textContent = `정답! +${points}점`;
      this.checkCosmetics();
    } else {
      this.player.lives -= 1;
      this.elements.feedback.textContent =
        `정답은 “${this.challenge.value}” · 목숨 -1`;
    }

    this.updateStatus();
    this.elements.submit.disabled = true;
    window.setTimeout(() => {
      this.elements.submit.disabled = false;
      this.elements.challenge.hidden = true;
      if (this.player.lives <= 0) {
        this.endGame();
        return;
      }
      if (correct && this.correctInStage >= 8 && this.stage < 2) {
        this.stage += 1;
        this.correctInStage = 0;
        this.elements.clearTitle.textContent =
          `${["", "단어", "문장"][this.stage]} 단계 해금!`;
        this.elements.clearText.textContent =
          `${this.playerName}님, 다음 영어 단계로 올라갔어요!`;
        this.elements.stageClear.hidden = false;
      } else {
        this.paused = false;
      }
      this.challenge = null;
      this.updateStatus();
    }, 1000);
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
    const stageName = ["알파벳", "단어", "문장"][this.stage];
    const items = [...this.unlockedCosmetics].join(" · ");
    this.elements.status.textContent =
      `${this.playerName || "탐험가"} · ${stageName} 단계 · 점수 ${this.score}`
      + ` · 목숨 ${"♥".repeat(this.player.lives)}`
      + (items ? ` · 아이템: ${items}` : "");
  }

  endGame() {
    this.gameOver = true;
    this.paused = true;
    const existing = this.records.find((record) => record.name === this.playerName);
    if (existing) {
      existing.score = Math.max(existing.score, this.score);
    } else {
      this.records.push({ name: this.playerName, score: this.score });
    }
    localStorage.setItem("english-cloud-records", JSON.stringify(this.records));
    const best = this.records.find((record) => record.name === this.playerName).score;
    this.elements.final.textContent =
      `${this.playerName} · 점수 ${this.score}점 · 개인 최고 ${best}점`;
    this.elements.gameOver.hidden = false;
  }

  render() {
    const gradient = this.context.createLinearGradient(
      0, 0, 0, this.canvas.height
    );
    gradient.addColorStop(0, "#4f46e5");
    gradient.addColorStop(1, "#bae6fd");
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.fillStyle = "rgba(255,255,255,.75)";
    for (let i = 0; i < 9; i += 1) {
      const x = (i * 127 + 35) % this.canvas.width;
      const y = (i * 71 + 30) % this.canvas.height;
      this.context.beginPath();
      this.context.arc(x, y, 18, 0, Math.PI * 2);
      this.context.arc(x + 22, y + 4, 24, 0, Math.PI * 2);
      this.context.fill();
    }

    for (const orb of this.orbs) orb.draw(this.context);
    this.player.draw(this.context, this.unlockedCosmetics);

    const stageName = ["알파벳", "단어", "문장"][this.stage];
    this.context.fillStyle = "rgba(15,23,42,.8)";
    this.context.fillRect(14, 12, 300, 64);
    this.context.fillStyle = "#ffffff";
    this.context.font = "800 22px system-ui";
    this.context.fillText(`${stageName} · ${this.score}점`, 28, 39);
    this.context.font = "700 16px system-ui";
    this.context.fillText(
      `목숨 ${"♥".repeat(this.player.lives)} · 단계 정답 ${this.correctInStage}/8`,
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
      this.context.fillText(
        `다음 아이템 ${next.score}점`,
        this.canvas.width - 208,
        37
      );
    }

    if (this.unlockTimer > 0) {
      this.context.fillStyle = "rgba(15,23,42,.9)";
      this.context.fillRect(195, 98, 410, 66);
      this.context.strokeStyle = "#facc15";
      this.context.lineWidth = 4;
      this.context.strokeRect(195, 98, 410, 66);
      this.context.fillStyle = "#fef08a";
      this.context.textAlign = "center";
      this.context.font = "900 24px system-ui";
      this.context.fillText(this.unlockMessage, 400, 138);
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
  challenge: document.querySelector("#challenge"),
  challengeForm: document.querySelector("#challengeForm"),
  stageLabel: document.querySelector("#stageLabel"),
  listen: document.querySelector("#listen"),
  prompt: document.querySelector("#prompt"),
  answer: document.querySelector("#answer"),
  feedback: document.querySelector("#feedback"),
  submit: document.querySelector("#submitAnswer"),
  stageClear: document.querySelector("#stageClear"),
  clearTitle: document.querySelector("#clearTitle"),
  clearText: document.querySelector("#clearText"),
  continueStage: document.querySelector("#continueStage"),
  gameOver: document.querySelector("#gameOver"),
  final: document.querySelector("#finalScore"),
  restart: document.querySelector("#restart"),
  status: document.querySelector("#status"),
});
game.start();
