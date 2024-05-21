import { Point } from "../../interface/point-interface";

export default class Sprite {
  position: Point;
  image: any;
  height: number;
  width: number;
  scale: number;
  framesMax: number;
  framesCurrent: number;
  framesElapsed: number;
  framesHold: number;

  constructor({
    position,
    imageSrc,
    scale = 1,
    framesMax = 1,
  }: {
    position: Point;
    imageSrc: any;
    scale?: number;
    framesMax?: number;
  }) {
    this.position = position;
    this.height = 150;
    this.width = 50;
    this.image = Array.from(imageSrc).map((src: any) => {
      const image = new Image();
      image.src = src;
      return image;
    });
    this.scale = scale;
    this.framesMax = framesMax;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 10;
  }

  get isLoaded(): boolean {
    return this.image.every((img: HTMLImageElement) => img.complete);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isLoaded) {
      if (this.image.length > 1) {
        const curr = this.image[this.framesCurrent];

        if (curr) {
          ctx.drawImage(
            curr,
            this.position.x,
            this.position.y,
            curr.width * this.scale,
            curr.height * this.scale
          );
        }
      } else {
        const curr = this.image[0];
        if (curr) {
          ctx.drawImage(
            curr,
            this.position.x,
            this.position.y,
            curr.width * this.scale,
            curr.height * this.scale
          );
        }
      }
    }
  }

  animateFrame() {
    this.framesElapsed++;

    if (this.framesElapsed % this.framesHold === 0) {
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++;
      } else {
        this.framesCurrent = 0;
      }
    }
  }

  update(ctx: CanvasRenderingContext2D, canvasHeight: number) {
    this.draw(ctx);
    this.animateFrame();
  }
}
