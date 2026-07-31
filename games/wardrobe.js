"use strict";

class CharacterWardrobe {
  static outfits = [
    { name: "꽃무늬 원피스", score: 0 },
    { name: "하늘빛 모험가", score: 60 },
    { name: "별빛 드레스", score: 150 },
    { name: "보라빛 마법사", score: 300 },
  ];

  constructor(container) {
    this.container = container;
    this.image = new Image();
    this.image.src = "../../assets/character-outfits.png";
    this.unlocked = Number(localStorage.getItem("edu-game-outfit-level") || 0);
    this.selected = Math.min(
      Number(localStorage.getItem("edu-game-selected-outfit") || 0),
      this.unlocked
    );
    this.buttons = [...container.querySelectorAll("[data-outfit]")];
    this.buttons.forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.outfit);
      if (index > this.unlocked) return;
      this.selected = index;
      localStorage.setItem("edu-game-selected-outfit", String(index));
      this.renderButtons();
    }));
    this.renderButtons();
  }

  sync(score) {
    const earned = CharacterWardrobe.outfits.reduce(
      (level, outfit, index) => score >= outfit.score ? index : level,
      0
    );
    if (earned > this.unlocked) {
      this.unlocked = earned;
      localStorage.setItem("edu-game-outfit-level", String(earned));
      this.container.dataset.newOutfit = "true";
      window.setTimeout(() => delete this.container.dataset.newOutfit, 1800);
      this.renderButtons();
    }
  }

  renderButtons() {
    this.buttons.forEach((button, index) => {
      const outfit = CharacterWardrobe.outfits[index];
      const locked = index > this.unlocked;
      button.disabled = locked;
      button.classList.toggle("selected", index === this.selected);
      button.querySelector("small").textContent = locked
        ? `${outfit.score}점에 해금`
        : index === this.selected ? "착용 중" : "갈아입기";
    });
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
    context.drawImage(
      this.image,
      sourceX, sourceY, cellWidth, cellHeight,
      x, y, width, height
    );
    context.restore();
    return true;
  }
}

window.CharacterWardrobe = CharacterWardrobe;
