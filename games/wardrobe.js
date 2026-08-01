"use strict";

window.eduGameWardrobePaused = false;

class CharacterWardrobe {
  static outfits = [
    { name: "꽃무늬 원피스", score: 0 },
    { name: "하늘빛 모험가", score: 60 },
    { name: "별빛 드레스", score: 150 },
    { name: "보라빛 마법사", score: 300 },
  ];

  static items = [
    { key: "shoes", name: "별빛 신발", score: 30 },
    { key: "bag", name: "모험 가방", score: 90 },
    { key: "wand", name: "마법봉", score: 180 },
    { key: "hat", name: "마법사 모자", score: 240 },
  ];

  constructor(container) {
    this.container = container;
    this.image = new Image();
    this.image.src = "../../assets/character-outfits-transparent.png";
    this.accessoryImage = new Image();
    this.accessoryImage.src = "../../assets/accessories-v2.png";
    this.unlocked = Number(localStorage.getItem("edu-game-outfit-level") || 0);
    this.selected = Math.min(Number(localStorage.getItem("edu-game-selected-outfit") || 0), this.unlocked);
    this.unlockedItems = new Set(JSON.parse(localStorage.getItem("edu-game-unlocked-items") || "[]"));
    this.equippedItems = new Set(JSON.parse(localStorage.getItem("edu-game-equipped-items") || "[]"));
    if (localStorage.getItem("edu-game-accessory-version") !== "2") {
      this.equippedItems.clear();
      localStorage.setItem("edu-game-equipped-items", "[]");
      localStorage.setItem("edu-game-accessory-version", "2");
    }
    const previousMilestone = CharacterWardrobe.outfits[this.unlocked]?.score || 0;
    CharacterWardrobe.items.forEach((item) => {
      if (item.score <= previousMilestone) this.unlockedItems.add(item.key);
    });
    localStorage.setItem("edu-game-unlocked-items", JSON.stringify([...this.unlockedItems]));
    const itemHeading = document.createElement("h3");
    itemHeading.textContent = "🎁 아이템 보관함";
    const itemGrid = document.createElement("div");
    itemGrid.className = "item-grid";
    CharacterWardrobe.items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.item = item.key;
      button.append(`${item.key === "shoes" ? "👟" : item.key === "bag" ? "🎒" : item.key === "wand" ? "🪄" : "🧙"} ${item.name}`);
      button.append(document.createElement("small"));
      itemGrid.append(button);
    });
    const previewButton = document.createElement("button");
    previewButton.type = "button";
    previewButton.className = "wardrobe-preview-button";
    previewButton.textContent = "⏸ 꾸미기·감상 모드";
    container.append(itemHeading, itemGrid, previewButton);
    this.createPreview();
    previewButton.addEventListener("click", () => this.openPreview());
    this.outfitButtons = [...container.querySelectorAll("[data-outfit]")];
    this.itemButtons = [...container.querySelectorAll("[data-item]")];

    this.outfitButtons.forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.outfit);
      if (index > this.unlocked) return;
      this.selected = index;
      localStorage.setItem("edu-game-selected-outfit", String(index));
      this.renderButtons();
    }));
    this.itemButtons.forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.item;
      if (!this.unlockedItems.has(key)) return;
      if (this.equippedItems.has(key)) this.equippedItems.delete(key);
      else this.equippedItems.add(key);
      localStorage.setItem("edu-game-equipped-items", JSON.stringify([...this.equippedItems]));
      this.renderButtons();
    }));
    this.renderButtons();
  }

  sync(score) {
    const earned = CharacterWardrobe.outfits.reduce((level, outfit, index) => score >= outfit.score ? index : level, 0);
    let foundNewItem = false;
    CharacterWardrobe.items.forEach((item) => {
      if (score >= item.score && !this.unlockedItems.has(item.key)) {
        this.unlockedItems.add(item.key);
        foundNewItem = true;
      }
    });
    if (earned > this.unlocked || foundNewItem) {
      this.unlocked = Math.max(this.unlocked, earned);
      localStorage.setItem("edu-game-outfit-level", String(this.unlocked));
      localStorage.setItem("edu-game-unlocked-items", JSON.stringify([...this.unlockedItems]));
      this.container.dataset.newOutfit = "true";
      window.setTimeout(() => delete this.container.dataset.newOutfit, 1800);
      this.renderButtons();
    }
  }

  renderButtons() {
    this.outfitButtons.forEach((button, index) => {
      const outfit = CharacterWardrobe.outfits[index];
      const locked = index > this.unlocked;
      button.disabled = locked;
      button.classList.toggle("selected", index === this.selected);
      button.querySelector("small").textContent = locked ? `${outfit.score}점에 해금` : index === this.selected ? "착용 중" : "갈아입기";
    });
    this.itemButtons.forEach((button) => {
      const item = CharacterWardrobe.items.find(({ key }) => key === button.dataset.item);
      const locked = !this.unlockedItems.has(item.key);
      const equipped = this.equippedItems.has(item.key);
      button.disabled = locked;
      button.classList.toggle("selected", equipped);
      button.setAttribute("aria-pressed", String(equipped));
      button.querySelector("small").textContent = locked ? `${item.score}점에 획득` : equipped ? "착용 중 · 눌러서 벗기" : "눌러서 착용";
    });
    this.preview?.querySelectorAll("[data-preview-outfit]").forEach((button) => {
      const index = Number(button.dataset.previewOutfit);
      button.disabled = index > this.unlocked;
      button.classList.toggle("selected", index === this.selected);
    });
    this.preview?.querySelectorAll("[data-preview-item]").forEach((button) => {
      const key = button.dataset.previewItem;
      button.disabled = !this.unlockedItems.has(key);
      button.classList.toggle("selected", this.equippedItems.has(key));
    });
    this.drawPreview();
  }

  createPreview() {
    this.preview = document.createElement("div");
    this.preview.className = "wardrobe-preview";
    this.preview.hidden = true;
    this.preview.setAttribute("role", "dialog");
    this.preview.setAttribute("aria-modal", "true");
    this.preview.setAttribute("aria-label", "캐릭터 꾸미기 감상 모드");
    const panel = document.createElement("div");
    panel.className = "wardrobe-preview-panel";
    const title = document.createElement("h2");
    title.textContent = "✨ 내 캐릭터 감상하기";
    const message = document.createElement("p");
    message.textContent = "게임은 잠시 멈췄어요. 아래 보관함에서 옷과 아이템을 골라 보세요!";
    this.previewCanvas = document.createElement("canvas");
    this.previewCanvas.width = 240;
    this.previewCanvas.height = 320;
    const previewControls = document.createElement("div");
    previewControls.className = "preview-controls";
    const outfitTitle = document.createElement("strong");
    outfitTitle.textContent = "👗 의상";
    const outfitGrid = document.createElement("div");
    outfitGrid.className = "preview-choice-grid";
    CharacterWardrobe.outfits.forEach((outfit, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.previewOutfit = String(index);
      button.textContent = outfit.name;
      button.addEventListener("click", () => {
        if (index > this.unlocked) return;
        this.selected = index;
        localStorage.setItem("edu-game-selected-outfit", String(index));
        this.renderButtons();
      });
      outfitGrid.append(button);
    });
    const itemTitle = document.createElement("strong");
    itemTitle.textContent = "🎁 아이템";
    const itemChoiceGrid = document.createElement("div");
    itemChoiceGrid.className = "preview-choice-grid";
    CharacterWardrobe.items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.previewItem = item.key;
      button.textContent = item.name;
      button.addEventListener("click", () => {
        if (!this.unlockedItems.has(item.key)) return;
        if (this.equippedItems.has(item.key)) this.equippedItems.delete(item.key);
        else this.equippedItems.add(item.key);
        localStorage.setItem("edu-game-equipped-items", JSON.stringify([...this.equippedItems]));
        this.renderButtons();
      });
      itemChoiceGrid.append(button);
    });
    previewControls.append(outfitTitle, outfitGrid, itemTitle, itemChoiceGrid);
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "wardrobe-continue-button";
    closeButton.textContent = "▶ 게임 계속하기";
    closeButton.addEventListener("click", () => this.closePreview());
    panel.append(title, message, this.previewCanvas, previewControls, closeButton);
    this.preview.append(panel);
    document.body.append(this.preview);
    this.image.addEventListener("load", () => this.drawPreview());
    this.accessoryImage.addEventListener("load", () => this.drawPreview());
  }

  openPreview() {
    window.eduGameWardrobePaused = true;
    this.preview.hidden = false;
    this.drawPreview();
    this.preview.querySelector("button").focus();
  }

  closePreview() {
    this.preview.hidden = true;
    window.eduGameWardrobePaused = false;
    this.container.querySelector(".wardrobe-preview-button").focus();
  }

  drawPreview() {
    if (!this.previewCanvas || this.preview.hidden || !this.image.complete || !this.image.naturalWidth) return;
    const context = this.previewCanvas.getContext("2d");
    context.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
    const gradient = context.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, "#fde7f3");
    gradient.addColorStop(1, "#ddd6fe");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 240, 320);
    context.fillStyle = "rgba(255,255,255,.7)";
    context.beginPath(); context.ellipse(120, 286, 76, 18, 0, 0, Math.PI * 2); context.fill();
    this.draw(context, 45, 16, 150, 270);
  }

  draw(context, x, y, width, height) {
    if (!this.image.complete || !this.image.naturalWidth) return false;
    const cellWidth = this.image.naturalWidth / 2;
    const cellHeight = this.image.naturalHeight / 2;
    const sourceX = (this.selected % 2) * cellWidth;
    const sourceY = Math.floor(this.selected / 2) * cellHeight;
    context.save();
    context.beginPath();
    context.roundRect(x, y, width, height, 10);
    context.clip();
    context.drawImage(this.image, sourceX, sourceY, cellWidth, cellHeight, x, y, width, height);
    context.restore();
    this.drawItems(context, x, y, width, height);
    return true;
  }

  drawItems(context, x, y, width, height) {
    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    if (this.equippedItems.has("shoes")) {
      context.fillStyle = "#312e81"; context.strokeStyle = "#facc15"; context.lineWidth = 1.5;
      [[x + width * .42, y + height - 5], [x + width * .58, y + height - 5]].forEach(([cx, cy]) => {
        context.beginPath(); context.ellipse(cx, cy, 7, 3, 0, 0, Math.PI * 2); context.fill(); context.stroke();
      });
    }
    if (this.equippedItems.has("bag")) {
      context.strokeStyle = "#78350f"; context.fillStyle = "#b45309"; context.lineWidth = 2;
      context.beginPath(); context.arc(x + 14, y + 55, 8, Math.PI, 0); context.stroke();
      context.beginPath(); context.roundRect(x + 7, y + 54, 15, 17, 4); context.fill(); context.stroke();
      context.fillStyle = "#facc15"; context.fillRect(x + 13, y + 61, 3, 3);
    }
    if (this.equippedItems.has("wand")) {
      context.strokeStyle = "#7c3aed"; context.lineWidth = 3;
      context.beginPath(); context.moveTo(x + width - 16, y + 67); context.lineTo(x + width - 5, y + 30); context.stroke();
      context.fillStyle = "#facc15"; context.font = "18px serif"; context.textAlign = "center";
      context.fillText("★", x + width - 4, y + 31);
    }
    if (this.equippedItems.has("hat")) {
      const cx = x + width / 2;
      context.fillStyle = "#4c1d95"; context.strokeStyle = "#facc15"; context.lineWidth = 1.5;
      context.beginPath(); context.moveTo(cx - 15, y + 19); context.lineTo(cx + 2, y - 4); context.lineTo(cx + 14, y + 20); context.closePath(); context.fill(); context.stroke();
      context.beginPath(); context.ellipse(cx, y + 20, 22, 5, 0, 0, Math.PI * 2); context.fill(); context.stroke();
      context.fillStyle = "#facc15"; context.font = "11px serif"; context.fillText("★", cx + 2, y + 13);
    }
    context.restore();
  }
}

CharacterWardrobe.items = [
  { key: "shoes", name: "별빛 리본 구두", score: 30 },
  { key: "bag", name: "꽃별 리본 가방", score: 90 },
  { key: "wand", name: "별보석 마법봉", score: 180 },
  { key: "hat", name: "달빛 마법사 모자", score: 240 },
];

CharacterWardrobe.prototype.drawItems = function drawPrettyItems(context, x, y, width) {
  if (!this.accessoryImage.complete || !this.accessoryImage.naturalWidth) return;
  const cellWidth = this.accessoryImage.naturalWidth / 2;
  const cellHeight = this.accessoryImage.naturalHeight / 2;
  const scale = width / 76;
  const drawCell = (index, dx, dy, dw, dh) => {
    context.drawImage(
      this.accessoryImage,
      (index % 2) * cellWidth,
      Math.floor(index / 2) * cellHeight,
      cellWidth,
      cellHeight,
      x + dx * scale,
      y + dy * scale,
      dw * scale,
      dh * scale
    );
  };
  context.save();
  if (this.equippedItems.has("shoes")) drawCell(0, 12, 65, 52, 42);
  if (this.equippedItems.has("bag")) drawCell(1, -5, 30, 45, 48);
  if (this.equippedItems.has("wand")) drawCell(2, 48, 20, 40, 62);
  if (this.equippedItems.has("hat")) drawCell(3, 1, -12, 74, 58);
  context.restore();
};

window.CharacterWardrobe = CharacterWardrobe;
