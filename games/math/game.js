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
  static isAABB(first, second) {
    return (
      first.x < second.x + second.width
      && first.x + first.width > second.x
      && first.y < second.y + second.height
      && first.y + first.height > second.y
    );
  }
}

class Player extends Entity {
  constructor(canvas) {
    super(canvas.width / 2 - 20, canvas.height - 100, 40, 48);
    this.velocityY = -430;
    this.speed = 280;
    this.lives = 3;
  }

  update(deltaTime, keys, canvas) {
    const direction =
      Number(keys.has("ArrowRight")) - Number(keys.has("ArrowLeft"));
    this.x += direction * this.speed * deltaTime;
    this.velocityY += 980 * deltaTime;
    this.y += this.velocityY * deltaTime;

    if (this.x + this.width < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = -this.width;
  }

  bounce() {
    this.velocityY = -465;
  }

  draw(context, cosmetics = new Set()) {
    if (cosmetics.has("별빛 오라")) {
      const glow = context.createRadialGradient(
        this.x + 20, this.y + 24, 8,
        this.x + 20, this.y + 24, 43
      );
      glow.addColorStop(0, "rgba(250, 204, 21, 0.48)");
      glow.addColorStop(1, "rgba(250, 204, 21, 0)");
      context.fillStyle = glow;
      context.beginPath();
      context.arc(this.x + 20, this.y + 24, 43, 0, Math.PI * 2);
      context.fill();
    }

    if (cosmetics.has("영웅 망토")) {
      context.fillStyle = "#ef4444";
      context.beginPath();
      context.moveTo(this.x + 9, this.y + 18);
      context.lineTo(this.x - 8, this.y + 48);
      context.lineTo(this.x + 15, this.y + 42);
      context.closePath();
      context.fill();
    }

    context.fillStyle = "#fbbf24";
    context.fillRect(this.x + 7, this.y + 13, 26, 31);
    context.fillStyle = "#fde68a";
    context.beginPath();
    context.arc(this.x + 20, this.y + 10, 12, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#1e293b";
    context.fillRect(this.x + 13, this.y + 7, 3, 3);
    context.fillRect(this.x + 24, this.y + 7, 3, 3);
    context.fillStyle = "#f97316";
    context.fillRect(this.x + 4, this.y + 42, 14, 6);
    context.fillRect(this.x + 23, this.y + 42, 14, 6);

    if (cosmetics.has("마법사 모자")) {
      context.fillStyle = "#7c3aed";
      context.beginPath();
      context.moveTo(this.x + 5, this.y + 1);
      context.lineTo(this.x + 21, this.y - 30);
      context.lineTo(this.x + 35, this.y + 1);
      context.closePath();
      context.fill();
      context.fillStyle = "#facc15";
      context.fillRect(this.x + 16, this.y - 14, 6, 6);
      context.fillStyle = "#6d28d9";
      context.fillRect(this.x + 1, this.y - 2, 38, 7);
    }

    if (cosmetics.has("황금 왕관")) {
      context.fillStyle = "#facc15";
      context.beginPath();
      context.moveTo(this.x + 7, this.y - 2);
      context.lineTo(this.x + 9, this.y - 17);
      context.lineTo(this.x + 17, this.y - 8);
      context.lineTo(this.x + 22, this.y - 20);
      context.lineTo(this.x + 29, this.y - 8);
      context.lineTo(this.x + 34, this.y - 17);
      context.lineTo(this.x + 34, this.y - 2);
      context.closePath();
      context.fill();
    }
  }
}

class Platform extends Entity {
  constructor(x, y, width = 125) {
    super(x, y, width, 18);
  }

  draw(context) {
    context.fillStyle = "#a78bfa";
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = "#ddd6fe";
    context.fillRect(this.x, this.y, this.width, 4);
  }
}

class MathOrb extends Entity {
  constructor(canvasWidth, isSpecial) {
    super(Math.random() * (canvasWidth - 52), -60, 52, 52);
    this.isSpecial = isSpecial;
    this.speed = isSpecial ? 130 : 155 + Math.random() * 55;
    this.symbol = isSpecial ? "★" : ["+", "−", "×"][Math.floor(Math.random() * 3)];
  }

  update(deltaTime) {
    this.y += this.speed * deltaTime;
  }

  draw(context) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    context.fillStyle = this.isSpecial ? "#facc15" : "#38bdf8";
    context.beginPath();
    context.arc(centerX, centerY, 25, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = this.isSpecial ? "#fef08a" : "#bae6fd";
    context.lineWidth = 4;
    context.stroke();
    context.fillStyle = "#0f172a";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "900 25px system-ui";
    context.fillText(this.symbol, centerX, centerY + 1);
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
  }
}

class QuestionFactory {
  static random(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  static make(text, answer, isSpecial) {
    return {
      text,
      answer: Number(answer.toFixed(2)),
      points: isSpecial ? 50 : 10,
      isSpecial,
    };
  }

  static create(isSpecial, grade) {
    const r = this.random;
    const type = r(0, 2);

    if (grade === 1) {
      if (type === 0) {
        const a = r(1, isSpecial ? 30 : 15);
        const b = r(1, isSpecial ? 30 : 20 - a);
        return this.make(`${a} + ${b} = ?`, a + b, isSpecial);
      }
      const a = r(5, isSpecial ? 50 : 20);
      const b = r(0, a);
      return this.make(`${a} − ${b} = ?`, a - b, isSpecial);
    }

    if (grade === 2) {
      if (type === 2) {
        const a = r(2, 9);
        const b = r(2, 9);
        return this.make(`${a} × ${b} = ?`, a * b, isSpecial);
      }
      const a = r(10, isSpecial ? 200 : 99);
      const b = type === 0 ? r(1, isSpecial ? 100 : 99) : r(1, a);
      return this.make(
        `${a} ${type === 0 ? "+" : "−"} ${b} = ?`,
        type === 0 ? a + b : a - b,
        isSpecial
      );
    }

    if (grade === 3) {
      if (type === 0) {
        const a = r(100, 999);
        const b = r(10, 999);
        return this.make(`${a} + ${b} = ?`, a + b, isSpecial);
      }
      const divisor = r(2, 9);
      const answer = r(2, isSpecial ? 30 : 12);
      if (type === 1) {
        return this.make(
          `${divisor * answer} ÷ ${divisor} = ?`,
          answer,
          isSpecial
        );
      }
      const a = r(10, 99);
      const b = r(2, 9);
      return this.make(`${a} × ${b} = ?`, a * b, isSpecial);
    }

    if (grade === 4) {
      const a = r(12, 99);
      const b = r(2, isSpecial ? 25 : 12);
      if (type === 0) return this.make(`${a} × ${b} = ?`, a * b, isSpecial);
      const answer = r(10, 99);
      if (type === 1) {
        return this.make(`${answer * b} ÷ ${b} = ?`, answer, isSpecial);
      }
      const c = r(10, 100);
      return this.make(`${a} + ${b} × ${c} = ?`, a + b * c, isSpecial);
    }

    if (grade === 5) {
      const a = r(10, 99) / 10;
      const b = r(10, 99) / 10;
      if (type === 0) return this.make(`${a} + ${b} = ?`, a + b, isSpecial);
      if (type === 1) {
        const big = Math.max(a, b);
        const small = Math.min(a, b);
        return this.make(`${big} − ${small} = ?`, big - small, isSpecial);
      }
      const whole = r(2, 12);
      return this.make(`${a} × ${whole} = ?`, a * whole, isSpecial);
    }

    const a = r(2, 20);
    const b = r(2, 12);
    const c = r(2, 10);
    if (type === 0) {
      return this.make(`(${a} + ${b}) × ${c} = ?`, (a + b) * c, isSpecial);
    }
    if (type === 1) {
      const percent = [10, 20, 25, 50][r(0, 3)];
      const base = r(2, 20) * 20;
      return this.make(`${base}의 ${percent}% = ?`, base * percent / 100, isSpecial);
    }
    const answer = r(5, 30);
    return this.make(`${answer * b} ÷ ${b} + ${c} = ?`, answer + c, isSpecial);
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
  }
}

class Game {
  constructor(canvas, elements) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.elements = elements;
    this.input = new InputController();
    this.loop = this.loop.bind(this);
    this.lastTime = 0;
    this.isRunning = false;
    this.playerName = "";
    this.grade = 1;
    this.records = this.loadRecords();
    this.bestScore = 0;
    this.cosmeticLevels = [
      { score: 30, name: "마법사 모자" },
      { score: 70, name: "영웅 망토" },
      { score: 120, name: "황금 왕관" },
      { score: 200, name: "별빛 오라" },
    ];

    elements.form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.checkAnswer();
    });
    elements.startForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.beginWithProfile();
    });
    elements.grade.addEventListener("change", () => this.renderLeaderboard());
    elements.restart.addEventListener("click", () => this.showStartScreen());
    this.reset();
    this.showStartScreen();
  }

  loadRecords() {
    try {
      return JSON.parse(localStorage.getItem("math-climb-records") || "[]");
    } catch {
      return [];
    }
  }

  beginWithProfile() {
    const name = this.elements.name.value.trim().slice(0, 12);
    if (!name) return;
    this.playerName = name;
    this.grade = Number(this.elements.grade.value);
    this.bestScore = this.getPersonalBest();
    this.elements.startScreen.hidden = true;
    this.reset();
  }

  showStartScreen() {
    this.paused = true;
    this.gameOver = true;
    this.elements.gameOver.hidden = true;
    this.elements.quiz.hidden = true;
    this.elements.startScreen.hidden = false;
    this.elements.name.value = this.playerName;
    this.elements.grade.value = String(this.grade);
    this.renderLeaderboard();
    requestAnimationFrame(() => this.elements.name.focus());
  }

  getPersonalBest() {
    const record = this.records.find(
      (item) => item.name === this.playerName && item.grade === this.grade
    );
    return record ? record.score : 0;
  }

  renderLeaderboard() {
    const grade = Number(this.elements.grade.value);
    const leaders = this.records
      .filter((item) => item.grade === grade)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    this.elements.leaderboard.replaceChildren();
    if (leaders.length === 0) {
      const empty = document.createElement("li");
      empty.textContent = "아직 기록이 없어요.";
      this.elements.leaderboard.append(empty);
      return;
    }
    leaders.forEach((record, index) => {
      const item = document.createElement("li");
      item.textContent = `${index + 1}. ${record.name} — ${record.score}점`;
      this.elements.leaderboard.append(item);
    });
  }

  reset() {
    this.player = new Player(this.canvas);
    this.platforms = [];
    this.orbs = [];
    this.score = 0;
    this.floors = 0;
    this.orbTimer = 1.5;
    this.currentQuestion = null;
    this.unlockedCosmetics = new Set();
    this.unlockMessage = "";
    this.unlockMessageTimer = 0;
    this.paused = false;
    this.gameOver = false;
    this.elements.quiz.hidden = true;
    this.elements.gameOver.hidden = true;
    this.createInitialPlatforms();
    this.updateStatus();
  }

  createInitialPlatforms() {
    const positions = [320, 510, 260, 470, 170, 380, 590];
    for (let index = 0; index < positions.length; index += 1) {
      this.platforms.push(
        new Platform(
          positions[index],
          this.canvas.height - 42 - index * 72
        )
      );
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  loop(currentTime) {
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.04);
    this.lastTime = currentTime;
    if (!this.paused && !this.gameOver) this.update(deltaTime);
    this.render();
    requestAnimationFrame(this.loop);
  }

  update(deltaTime) {
    const previousBottom = this.player.y + this.player.height;
    this.player.update(deltaTime, this.input.keys, this.canvas);

    if (this.player.velocityY > 0) {
      for (const platform of this.platforms) {
        const crossedTop =
          previousBottom <= platform.y
          && this.player.y + this.player.height >= platform.y;
        const overlaps =
          this.player.x + this.player.width > platform.x
          && this.player.x < platform.x + platform.width;

        if (crossedTop && overlaps) {
          this.player.y = platform.y - this.player.height;
          this.player.bounce();
          this.floors += 1;
          this.score += 1;
          break;
        }
      }
    }

    if (this.player.y < 155) {
      const shift = (155 - this.player.y) * 3.4 * deltaTime;
      this.player.y += shift;
      for (const platform of this.platforms) platform.y += shift;
      for (const orb of this.orbs) orb.y += shift * 0.25;
    }

    this.maintainPlatforms();
    this.orbTimer -= deltaTime;
    if (this.orbTimer <= 0) {
      this.orbs.push(new MathOrb(this.canvas.width, Math.random() < 0.14));
      this.orbTimer = Math.max(0.75, 1.8 - this.floors * 0.015);
    }

    for (const orb of this.orbs) orb.update(deltaTime);
    const collected = this.orbs.find((orb) =>
      Collision.isAABB(this.player, orb)
    );
    if (collected) {
      this.orbs = this.orbs.filter((orb) => orb !== collected);
      this.openQuestion(collected.isSpecial);
    }
    this.orbs = this.orbs.filter((orb) => orb.y < this.canvas.height + 70);

    if (this.player.y > this.canvas.height + 40) this.endGame();
    this.updateStatus();
    this.checkCosmeticUnlocks();
    this.unlockMessageTimer = Math.max(0, this.unlockMessageTimer - deltaTime);
  }

  checkCosmeticUnlocks() {
    for (const item of this.cosmeticLevels) {
      if (
        this.score >= item.score
        && !this.unlockedCosmetics.has(item.name)
      ) {
        this.unlockedCosmetics.add(item.name);
        this.unlockMessage = `새 꾸미기 획득! ${item.name}`;
        this.unlockMessageTimer = 3;
      }
    }
  }

  maintainPlatforms() {
    this.platforms = this.platforms.filter(
      (platform) => platform.y < this.canvas.height + 30
    );
    let highest = Math.min(...this.platforms.map((platform) => platform.y));

    while (highest > -80) {
      const lastX = this.platforms.reduce((result, platform) =>
        platform.y === highest ? platform.x : result, 320);
      let x;
      do {
        x = 35 + Math.random() * (this.canvas.width - 195);
      } while (Math.abs(x - lastX) > 250);
      highest -= 72;
      this.platforms.push(new Platform(x, highest));
    }
  }

  openQuestion(isSpecial) {
    this.paused = true;
    this.currentQuestion = QuestionFactory.create(isSpecial, this.grade);
    this.elements.quiz.hidden = false;
    this.elements.quiz.classList.toggle("special", isSpecial);
    this.elements.label.textContent = isSpecial
      ? `${this.grade}학년 특별 문제! 정답이면 50점`
      : `${this.grade}학년 수학 문제! 정답이면 10점`;
    this.elements.question.textContent = this.currentQuestion.text;
    this.elements.answer.value = "";
    this.elements.feedback.textContent = "";
    requestAnimationFrame(() => this.elements.answer.focus());
  }

  checkAnswer() {
    const entered = Number(this.elements.answer.value);
    if (!Number.isFinite(entered)) {
      this.elements.feedback.textContent = "숫자로 답을 입력해 주세요.";
      return;
    }

    if (Math.abs(entered - this.currentQuestion.answer) < 0.001) {
      this.score += this.currentQuestion.points;
      this.checkCosmeticUnlocks();
      this.elements.feedback.textContent =
        `정답! +${this.currentQuestion.points}점`;
    } else {
      this.player.lives -= 1;
      this.elements.feedback.textContent =
        `아쉬워요. 정답은 ${this.currentQuestion.answer}! 목숨 -1`;
    }

    this.updateStatus();
    this.elements.submit.disabled = true;
    window.setTimeout(() => {
      this.elements.submit.disabled = false;
      this.elements.quiz.hidden = true;
      this.currentQuestion = null;
      if (this.player.lives <= 0) {
        this.endGame();
      } else {
        this.paused = false;
      }
    }, 850);
  }

  updateStatus() {
    const items = [...this.unlockedCosmetics].join(" · ");
    this.elements.status.textContent =
      `${this.playerName} · ${this.grade}학년 · 점수 ${this.score}`
      + ` · 목숨 ${"♥".repeat(this.player.lives)} · ${this.floors}계단`
      + (items ? ` · 아이템: ${items}` : "");
  }

  endGame() {
    this.gameOver = true;
    this.paused = true;
    this.bestScore = Math.max(this.bestScore, this.score);
    const existing = this.records.find(
      (item) => item.name === this.playerName && item.grade === this.grade
    );
    if (existing) {
      existing.score = Math.max(existing.score, this.score);
    } else {
      this.records.push({
        name: this.playerName,
        grade: this.grade,
        score: this.score,
      });
    }
    localStorage.setItem("math-climb-records", JSON.stringify(this.records));
    this.elements.final.textContent =
      `${this.playerName} · ${this.grade}학년 · 점수 ${this.score}점 · 개인 최고 ${this.bestScore}점`;
    this.elements.gameOver.hidden = false;
  }

  render() {
    const gradient = this.context.createLinearGradient(
      0, 0, 0, this.canvas.height
    );
    gradient.addColorStop(0, "#0ea5e9");
    gradient.addColorStop(1, "#dbeafe");
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.fillStyle = "rgba(255, 255, 255, 0.8)";
    for (let index = 0; index < 8; index += 1) {
      const x = (index * 143 + 40) % this.canvas.width;
      const y = (index * 89 + this.floors * 3) % this.canvas.height;
      this.context.beginPath();
      this.context.arc(x, y, 18, 0, Math.PI * 2);
      this.context.arc(x + 22, y + 4, 25, 0, Math.PI * 2);
      this.context.fill();
    }

    for (const platform of this.platforms) platform.draw(this.context);
    for (const orb of this.orbs) orb.draw(this.context);
    this.player.draw(this.context, this.unlockedCosmetics);

    this.context.fillStyle = "rgba(15, 23, 42, 0.78)";
    this.context.fillRect(14, 12, 270, 62);
    this.context.fillStyle = "#ffffff";
    this.context.font = "800 22px system-ui";
    this.context.fillText(`점수 ${this.score}`, 28, 39);
    this.context.font = "700 17px system-ui";
    this.context.fillText(
      `목숨 ${"♥".repeat(this.player.lives)}  ·  ${this.floors}계단`,
      28,
      63
    );

    const nextItem = this.cosmeticLevels.find(
      (item) => !this.unlockedCosmetics.has(item.name)
    );
    if (nextItem) {
      this.context.fillStyle = "rgba(15, 23, 42, 0.7)";
      this.context.fillRect(this.canvas.width - 255, 12, 241, 38);
      this.context.fillStyle = "#fef08a";
      this.context.font = "700 15px system-ui";
      this.context.fillText(
        `다음 아이템: ${nextItem.score}점`,
        this.canvas.width - 239,
        37
      );
    }

    if (this.unlockMessageTimer > 0) {
      const pulse = 1 + Math.sin(this.unlockMessageTimer * 8) * 0.025;
      this.context.save();
      this.context.translate(this.canvas.width / 2, 112);
      this.context.scale(pulse, pulse);
      this.context.fillStyle = "rgba(15, 23, 42, 0.88)";
      this.context.fillRect(-205, -34, 410, 68);
      this.context.strokeStyle = "#facc15";
      this.context.lineWidth = 4;
      this.context.strokeRect(-205, -34, 410, 68);
      this.context.fillStyle = "#fef08a";
      this.context.textAlign = "center";
      this.context.font = "900 23px system-ui";
      this.context.fillText(this.unlockMessage, 0, 8);
      this.context.restore();
      this.context.textAlign = "left";
    }
  }
}

const canvas = document.querySelector("#gameCanvas");
const game = new Game(canvas, {
  status: document.querySelector("#status"),
  startScreen: document.querySelector("#startScreen"),
  startForm: document.querySelector("#startForm"),
  name: document.querySelector("#playerName"),
  grade: document.querySelector("#grade"),
  leaderboard: document.querySelector("#leaderboard"),
  quiz: document.querySelector("#quiz"),
  form: document.querySelector("#quizForm"),
  label: document.querySelector("#quizLabel"),
  question: document.querySelector("#question"),
  answer: document.querySelector("#answer"),
  feedback: document.querySelector("#feedback"),
  submit: document.querySelector("#submitAnswer"),
  gameOver: document.querySelector("#gameOver"),
  final: document.querySelector("#finalScore"),
  restart: document.querySelector("#restart"),
});
game.start();
