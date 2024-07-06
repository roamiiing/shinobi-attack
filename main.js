import "./style.css";

import { Client } from "tmi.js";
import { p5 } from "./p5";

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
      game.addPlayer(currentUserNickname, tags["vip"], tags["subscriber"]);
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

  x;

  constructor(nickname, sprite) {
    this.nickname = nickname;
    this.sprite = sprite;

    this.x = p5.random(SAFE_X_OFFSET, p5.width - SAFE_X_OFFSET);
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

    if (p5.random() >= 0.001) return;

    this.walkingTo = Math.floor(
      p5.random(SAFE_X_OFFSET, p5.width - SAFE_X_OFFSET),
    );

    this.walkingDirection = this.walkingTo > this.x ? 1 : 0;
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

    this.sprite.walk.show(0, 0, this.walkingDirection === 0);

    this.x += 0.5 * this.walkingDirection === 0 ? -1 : 1;
  }
}

class Game {
  sprites;
  players = [];

  constructor() {}

  run() {
    this.players.forEach((player) => player.show());
  }

  addPlayer(nickname, isVip, isSubscriber) {
    if (this.players.find((player) => player.nickname === nickname)) return;

    const sprite = isSubscriber
      ? sprites.samurai
      : isVip
        ? sprites.shinobi
        : sprites.fighter;

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

const game = new Game();

window.game = game;

p5.preload = () => {
  loadSprites();
};

p5.setup = () => {
  p5.createCanvas(p5.windowWidth, p5.windowHeight);
};

p5.draw = () => {
  p5.clear();

  Sprite.animate(ANIMATION_SPEED);

  game.run();
};
