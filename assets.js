import { p5 } from "./p5";

export class Sprite {
  image;
  frames;
  static index = 0;

  constructor(image, frames) {
    this.image = image;
    this.frames = frames;
  }

  show(x, y, reverseX = false) {
    let index = Math.floor(Sprite.index) % this.frames;

    const image = reverseX ? this.image : this.image;

    p5.push();

    if (reverseX) p5.scale(-1, 1);

    p5.image(
      image,
      x + reverseX ? -SPRITE_SIZE : 0,
      y,
      SPRITE_SIZE,
      SPRITE_SIZE,
      index * SPRITE_SIZE,
      0,
      SPRITE_SIZE,
      SPRITE_SIZE,
    );

    p5.pop();
  }

  static animate(speed = 1) {
    Sprite.index += speed;
  }

  isFirstRoundCompleted() {
    return Sprite.index >= this.frames;
  }
}

const SPRITE_SIZE = 128;

function createSprite(url, frames) {
  const image = p5.loadImage(url);
  image.resize(SPRITE_SIZE * frames, SPRITE_SIZE);

  return new Sprite(image, frames);
}

import shinobiAttack from "./assets/Shinobi/Attack_1.png";
import shinobiIdle from "./assets/Shinobi/Idle.png";
import shinobiWalk from "./assets/Shinobi/Walk.png";
import shinobiRun from "./assets/Shinobi/Run.png";

export let sprites;

// needs to be loaded in p5.setup
export function loadSprites() {
  sprites = {
    shinobi: {
      attack: createSprite(shinobiAttack, 5),
      idle: createSprite(shinobiIdle, 6),
      walk: createSprite(shinobiWalk, 8),
      run: createSprite(shinobiRun, 8),
    },
  };
}
