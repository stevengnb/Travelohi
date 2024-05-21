import React, { useRef, useEffect, useState } from "react";
import bg from "../../assets/Game Asset/background/background1.png";
import drawImg from "../../assets/Game Asset/draw.png";
import winImg from "../../assets/Game Asset/win.png";
import loseImg from "../../assets/Game Asset/lose.png";
import Fighter from "./Fighter";
import Sprite from "./Sprite";
import styles from "../../css/game.module.css";
import { checkWin, swordCollision } from "./Logic";
import bgMusic from "../../../src/assets/Game Asset/background music 2.mp3";

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);
  const [time, setTime] = useState(60);
  const [status, setStatus] = useState({
    draw: false,
    win: false,
    lose: false,
    gameOver: false,
  });

  const background = new Sprite({
    position: { x: 0, y: 0 },
    imageSrc: [bg],
  });

  const generateImageSrc = (folder: any, prefix: any, frames: any) => {
    return Array.from(
      { length: frames },
      (_, index) => `./${folder}/${prefix}_${index + 1}.png`
    );
  };
  const generateImage2Src = (folder: any, prefix: any, frames: any) => {
    return Array.from(
      { length: frames },
      (_, index) => `./${folder}/${prefix}_0${index + 1}.png`
    );
  };
  const generateImage3Src = (folder: any, prefix: any, frames: any) => {
    return Array.from(
      { length: frames },
      (_, index) => `./${folder}/${prefix}${index + 1}.png`
    );
  };

  const player = new Fighter({
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    color: "blue",
    offset: { x: 0, y: 0 },
    imageSrc: [],
    framesMax: 6,
    scale: 2.5,
    sprites: {
      idle: {
        imageSrc: generateImage2Src("sword impulse/idle", "sword-impulse", 6),
        framesMax: 6,
      },
      forward: {
        imageSrc: generateImageSrc(
          "sword impulse/walking",
          "sword-impulse",
          10
        ),
        framesMax: 10,
      },
      backward: {
        imageSrc: generateImageSrc(
          "sword impulse/backward",
          "sword-impulse",
          10
        ),
        framesMax: 10,
      },
      jump: {
        imageSrc: ["./sword impulse/jumping/sword-impulse_jump_02.png"],
        framesMax: 1,
      },
      lowkick: {
        imageSrc: generateImage2Src(
          "sword impulse/low kick",
          "sword-impulse",
          3
        ),
        framesMax: 3,
      },
      frontkick: {
        imageSrc: generateImage2Src(
          "sword impulse/front kick",
          "sword-impulse",
          4
        ),
        framesMax: 4,
      },
      frontkickM: {
        imageSrc: generateImage2Src(
          "sword impulse/front kick mirrored",
          "sword-impulse",
          4
        ),
        framesMax: 4,
      },
    },
  });

  const enemy = new Fighter({
    position: { x: 400, y: 100 },
    velocity: { x: 0, y: 0 },
    color: "green",
    offset: { x: -50, y: 0 },
    imageSrc: [],
    framesMax: 5,
    scale: 2.5,
    sprites: {
      idle: {
        imageSrc: [
          "./blast impulse/idle mirrored/idle 1.png",
          "./blast impulse/idle mirrored/idle 2.png",
          "./blast impulse/idle mirrored/idle 3.png",
          "./blast impulse/idle mirrored/idle 4.png",
          "./blast impulse/idle mirrored/idle 5.png",
          "./blast impulse/idle mirrored/idle 6.png",
        ],
        framesMax: 6,
      },
      backward: {
        imageSrc: generateImage3Src("blast impulse/walking mirrored", "", 3),
        framesMax: 3,
      },
      forward: {
        imageSrc: generateImage3Src("blast impulse/backward mirrored", "", 3),
        framesMax: 3,
      },
      jump: {
        imageSrc: ["./blast impulse/jump mirrored/1.png"],
        framesMax: 1,
      },
      lowkick: {
        imageSrc: generateImage3Src("blast impulse/low kick", "", 4),
        framesMax: 4,
      },
      frontkick: {
        imageSrc: generateImage3Src("blast impulse/front kick", "", 3),
        framesMax: 3,
      },
      frontkickM: {
        imageSrc: generateImage3Src("blast impulse/front kick mirrored", "", 3),
        framesMax: 3,
      },
    },
  });

  const [playerHealth, setPlayerHealth] = useState(player.health);
  const [enemyHealth, setEnemyHealth] = useState(enemy.health);

  const keys = {
    a: {
      pressed: false,
    },
    d: {
      pressed: false,
    },
    s: {
      pressed: false,
    },
    ArrowRight: {
      pressed: false,
    },
    ArrowLeft: {
      pressed: false,
    },
    space: {
      pressed: false,
    },
    ArrowDown: {
      pressed: false,
    },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const timerIdHolder = { timerId: 0 };

    if (!ctx || !canvas) {
      console.log("Canvas or context NULL/UNDEFINED");
      return;
    }

    canvasRef.current = canvas;
    ctxRef.current = ctx;

    const animate = () => {
      timerIdHolder.timerId = window.requestAnimationFrame(animate);

      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      background.update(ctx, canvas.height);
      player.update(ctx, canvas.height);
      enemy.update(ctx, canvas.height);

      player.velocity.x = 0;
      enemy.velocity.x = 0;

      // player movement
      if (keys.a.pressed && player.lastKey === "a") {
        player.velocity.x = -5;
        player.switchSprite("backward");
      } else if (keys.d.pressed && player.lastKey === "d") {
        player.velocity.x = 5;
        player.switchSprite("forward");
      } else {
        player.switchSprite("idle");
      }

      if (player.velocity.y < 0) {
        player.switchSprite("jump");
      }

      // enemy movement
      if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
        enemy.velocity.x = -5;
        enemy.switchSprite("backward");
      } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
        enemy.velocity.x = 5;
        enemy.switchSprite("forward");
      } else {
        enemy.switchSprite("idle");
      }

      if (enemy.velocity.y < 0) {
        enemy.switchSprite("jump");
      }

      // collide
      if (
        swordCollision({ player1: player, player2: enemy }) &&
        player.isAttacking
      ) {
        player.isAttacking = false;
        setEnemyHealth((prevHealth) => Math.max(prevHealth - 20, 0));
        enemy.health = Math.max(enemy.health - 20, 0);
      }

      if (
        swordCollision({ player1: enemy, player2: player }) &&
        enemy.isAttacking
      ) {
        enemy.isAttacking = false;
        player.health = Math.max(player.health - 20, 0);
        setPlayerHealth((prevHealth) => Math.max(prevHealth - 20, 0));
      }

      if (enemy.health <= 0 || player.health <= 0) {
        checkWin({ player, enemy, setStatus, intervalRef, status });
      }
    };
    animate();

    window.addEventListener("keydown", (event) => {
      // player attack frontkick
      if (keys.d.pressed && keys.space.pressed) {
        player.attack("frontkick");
      }

      if (keys.a.pressed && keys.space.pressed) {
        player.attack("frontkickM");
      }

      // enemy attack frontkick
      if (keys.ArrowRight.pressed && keys.ArrowDown.pressed) {
        enemy.attack("frontkick");
      }

      if (keys.ArrowLeft.pressed && keys.ArrowDown.pressed) {
        enemy.attack("frontkickM");
      }

      // player attack lowkick
      if (keys.s.pressed && keys.space.pressed) {
        player.attack("lowkick");
      }

      switch (event.key) {
        case "d":
          keys.d.pressed = true;
          player.lastKey = "d";
          break;
        case "a":
          keys.a.pressed = true;
          player.lastKey = "a";
          break;
        case "w":
          player.velocity.y = -20;
          break;
        case " ":
          keys.space.pressed = true;
          break;
        case "s":
          keys.s.pressed = true;
          player.lastKey = "s";
          break;

        case "ArrowRight":
          keys.ArrowRight.pressed = true;
          enemy.lastKey = "ArrowRight";
          break;
        case "ArrowLeft":
          keys.ArrowLeft.pressed = true;
          enemy.lastKey = "ArrowLeft";
          break;
        case "ArrowUp":
          enemy.velocity.y = -20;
          break;
        case "ArrowDown":
          keys.ArrowDown.pressed = true;
          break;
      }
    });

    window.addEventListener("keyup", (event) => {
      // player
      switch (event.key) {
        case "d":
          keys.d.pressed = false;
          break;
        case "a":
          keys.a.pressed = false;
          break;
        case " ":
          keys.space.pressed = false;
          break;
      }

      // enemy
      switch (event.key) {
        case "ArrowRight":
          keys.ArrowRight.pressed = false;
          break;
        case "ArrowLeft":
          keys.ArrowLeft.pressed = false;
          break;
        case "ArrowDown":
          keys.ArrowDown.pressed = false;
          break;
      }
    });

    return () => cancelAnimationFrame(timerIdHolder.timerId);
  }, []);

  useEffect(() => {
    if (!status.gameOver) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime > 0 ? prevTime - 1 : prevTime;

          if (newTime === 0) {
            checkWin({ player, enemy, setStatus, intervalRef, status });
          }

          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className={styles.gameBody}>
      <div className={styles.gameBorder}>
        <audio autoPlay loop>
          <source src={bgMusic} type="audio/mp3" />
        </audio>
        <div className={styles.infoBorder}>
          <div className={styles.players}>
            <div className={styles.playerBarBorder}></div>
            <div
              style={{ width: `${playerHealth}%` }}
              className={styles.playerBar}
            ></div>
          </div>
          <div className={styles.timer}>{time}</div>
          <div className={styles.enemys}>
            <div className={styles.enemyBarBorder}></div>
            <div
              style={{ width: `${enemyHealth}%` }}
              className={styles.enemyBar}
            ></div>
          </div>
        </div>
        {status.draw ? (
          <div className={styles.drawImage}>
            <img src={drawImg} alt="" />
          </div>
        ) : status.win ? (
          <div className={styles.drawImage}>
            <img src={winImg} alt="" />
          </div>
        ) : (
          status.lose && (
            <div className={styles.drawImage}>
              <img src={loseImg} alt="" />
            </div>
          )
        )}
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          style={{ border: "1px solid black" }}
        ></canvas>
      </div>
    </div>
  );
};

export default Game;
