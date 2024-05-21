import { Point } from "../../interface/point-interface";
import Sprite from "./Sprite";

const gravity = 0.55;

export default class Fighter extends Sprite {
  //   position: Point;
  velocity: Point;
  isAttacking: boolean;
  height: number;
  width: number;
  health: number;
  lastKey: string | undefined;
  color: string;
  sword: any;
  framesCurrent: number;
  framesElapsed: number;
  framesHold: number;
  sprites: any;

  constructor({
    position,
    velocity,
    color,
    offset,
    imageSrc,
    scale = 1,
    framesMax = 1,
    sprites,
  }: {
    position: Point;
    velocity: Point;
    offset: Point;
    color: string;
    imageSrc: any;
    scale?: number;
    framesMax?: number;
    sprites: any;
  }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
    });
    // this.position = position;
    this.velocity = velocity;
    this.height = 200;
    this.width = 100;
    this.sword = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      offset,
      width: 100,
      height: 50,
    };
    this.color = color;
    this.isAttacking = false;
    this.health = 100;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 10;
    this.sprites = sprites;

    for (const spriteObj in this.sprites) {
      const sprite = this.sprites[spriteObj];
      sprite.image = sprite.imageSrc.map((src: any) => {
        const image = new Image();
        image.src = src;
        return image;
      });
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);
  }

  update(ctx: CanvasRenderingContext2D, canvasHeight: number) {
    this.draw(ctx);
    this.animateFrame();

    this.sword.position.x = this.position.x + this.sword.offset.x;
    this.sword.position.y = this.position.y;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y >= canvasHeight) {
      this.velocity.y = 0;
    } else {
      this.velocity.y += gravity;
    }
  }

  attack(type: string) {
    this.switchSprite(type);
    this.isAttacking = true;
    setTimeout(() => {
      this.isAttacking = false;
    }, 100);
  }

  switchSprite(sprite: string) {
    if (
      (this.image === this.sprites.frontkick.image &&
        this.framesCurrent < this.sprites.frontkick.framesMax - 1) ||
      (this.image === this.sprites.frontkickM.image &&
        this.framesCurrent < this.sprites.frontkickM.framesMax - 1) ||
      (this.image === this.sprites.lowkick.image &&
        this.framesCurrent < this.sprites.lowkick.framesMax - 1)
    )
      return;
    switch (sprite) {
      case "idle":
        if (this.image !== this.sprites.idle.image) {
          this.image = this.sprites.idle.image;
          this.framesHold = 10;
          this.framesMax = this.sprites.idle.framesMax;
          this.framesCurrent = 0;
          this.framesElapsed = 0;
        }
        break;
      case "forward":
        if (this.image !== this.sprites.forward.image) {
          this.image = this.sprites.forward.image;
          this.framesHold = 7;
          this.framesMax = this.sprites.forward.framesMax;
          this.framesCurrent = 0;
          this.framesElapsed = 0;
        }
        break;
      case "backward":
        if (this.image !== this.sprites.backward.image) {
          this.image = this.sprites.backward.image;
          this.framesHold = 7;
          this.framesMax = this.sprites.backward.framesMax;
          this.framesCurrent = 0;
          this.framesElapsed = 0;
        }
        break;
      case "jump":
        if (this.image !== this.sprites.jump.image) {
          this.image = this.sprites.jump.image;
          this.framesHold = 5;
          this.framesMax = this.sprites.jump.framesMax;
          this.framesCurrent = 0;
          this.framesElapsed = 0;
        }
        break;
      case "frontkick":
        if (this.image !== this.sprites.frontkick.image) {
          this.image = this.sprites.frontkick.image;
          this.framesHold = 7;
          this.framesMax = this.sprites.frontkick.framesMax;
          this.framesCurrent = 0;
          this.framesElapsed = 0;
        }
        break;
      case "frontkickM":
        if (this.image !== this.sprites.frontkickM.image) {
          this.image = this.sprites.frontkickM.image;
          this.framesHold = 7;
          this.framesMax = this.sprites.frontkickM.framesMax;
          this.framesCurrent = 0;
          this.framesElapsed = 0;
        }
        break;
      case "lowkick":
        if (this.image !== this.sprites.lowkick.image) {
          this.image = this.sprites.lowkick.image;
          this.framesHold = 15;
          this.framesMax = this.sprites.lowkick.framesMax;
          this.framesCurrent = 0;
          this.framesElapsed = 0;
        }
        break;
    }
  }
}
