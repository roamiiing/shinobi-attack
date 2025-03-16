import "./style.css";

import { Client } from "tmi.js";
import { p5 } from "./p5";
import { random } from "./utils";

import { Sprite, loadSprites, sprites } from "./assets";

let currentVersion;

setInterval(async () => {
  try {
    const response = await fetch(
      "https://shinobi-attack.vercel.app/version.txt",
    );

    if (response.status === 200) {
      const version = await response.text();

      if (!currentVersion) currentVersion = version;

      if (currentVersion !== version) {
        window.location.reload();
      }
    }
  } catch (e) {
    console.error(e);
  }
}, 10_000);

const searchParams = new URLSearchParams(window.location.search);
const nickname = searchParams.get("user");

const Commands = {
  Spawn: "!spawn",
  Attack: "!attack",
};

const client = new Client({
  channels: [nickname ?? "sgorsan"],
});

client.connect();

client.on("message", (channel, tags, message, self) => {
  console.log(tags);
  const words = message.split(/\s+/);

  const currentUserNickname = tags["display-name"];

  if (self || !currentUserNickname) return;

  const [command] = words;

  switch (command) {
    case Commands.Spawn: {
      game.addPlayer(currentUserNickname, tags);
      break;
    }
    case Commands.Attack: {
      console.log("attack");
      break;
    }
  }
});

const ANIMATION_SPEED = 0.1;

const SAFE_X_OFFSET = 100;

class Player {
  nickname;
  sprite;

  walkingTo;
  walkingDirection = 0;
  isRunning = false;

  x;

  constructor(nickname, sprite) {
    this.nickname = nickname;
    this.sprite = sprite;

    this.x = random(SAFE_X_OFFSET, p5.width - SAFE_X_OFFSET);
  }

  attack() {
    console.log("attack");
  }

  show() {
    p5.push();

    p5.translate(this.x, p5.height - 130);

    const textWidth = p5.textSize(18).textWidth(this.nickname);
    p5.fill(255)
      .stroke(0)
      .rect(60 - 10 - textWidth / 2, 10, textWidth + 20, 30, 10);
    p5.textAlign(p5.CENTER)
      .fill(0)
      .noStroke()
      .textSize(18)
      .text(this.nickname, 60, 30);

    if (this.walkingTo !== undefined) {
      this.walk();
    } else {
      this.sprite.idle.show(0, 0);

      this.decideOnWalking();
    }

    p5.pop();
  }

  decideOnWalking() {
    if (this.walkingTo) return;

    const chance = random();

    if (chance <= 0.001) {
      this.startWalking();
      return;
    } else if (chance <= 0.002) {
      this.startRunning();
      return;
    }
  }

  startWalking() {
    this.isRunning = false;

    this.walkingTo = Math.floor(
      random(SAFE_X_OFFSET, p5.width - SAFE_X_OFFSET),
    );

    this.walkingDirection = this.walkingTo > this.x ? 1 : 0;
  }

  startRunning() {
    this.startWalking();
    this.isRunning = true;
  }

  walk() {
    if (this.walkingTo === undefined) return;

    if (
      this.walkingDirection === 0
        ? this.x <= this.walkingTo
        : this.x >= this.walkingTo
    ) {
      this.walkingTo = undefined;
      return;
    }

    const sprite = this.isRunning ? this.sprite.run : this.sprite.walk;

    sprite.show(0, 0, this.walkingDirection === 0);

    const speed = this.isRunning ? 5 : 1;

    this.x += speed * (this.walkingDirection === 0 ? -1 : 1);
  }
}

function getSprite(tags) {
  if (tags.subscriber || tags.mod) {
    return sprites.samurai;
  }

  if (tags.vip) {
    return sprites.shinobi;
  }

  return sprites.fighter;
}

class Game {
  sprites;
  players = [];

  constructor() {}

  run() {
    this.players.forEach((player) => player.show());
  }

  addPlayer(nickname, tags) {
    if (this.players.find((player) => player.nickname === nickname)) return;

    const sprite = getSprite(tags);

    this.players.push(new Player(nickname, sprite));

    setTimeout(
      () => {
        const index = this.players.findIndex(
          (player) => player.nickname === nickname,
        );

        this.players.splice(index, 1);
      },
      10 * 60 * 1000,
    );
  }
}

function spawnRandomPlayers() {
  for (const nickname of [
    "подспичник",
    "подписечник",
    "подписячка",
    "подписоска",
  ]) {
    game.addPlayer(nickname, { subscriber: true });
  }
}

const game = new Game();

window.game = game;

p5.preload = () => {
  loadSprites();
};

p5.setup = () => {
  p5.createCanvas(p5.windowWidth, p5.windowHeight);

  setInterval(spawnRandomPlayers, 10 * 60 * 1000);

  spawnRandomPlayers();
};

p5.draw = () => {
  p5.clear();

  Sprite.animate(ANIMATION_SPEED);

  game.run();
};
