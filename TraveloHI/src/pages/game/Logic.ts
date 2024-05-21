import Fighter from "./Fighter";

export function checkWin({
  player,
  enemy,
  setStatus,
  intervalRef,
  status,
}: {
  player: Fighter;
  enemy: Fighter;
  setStatus: any;
  status: any;
  intervalRef: any;
}) {
  setStatus({ ...status, gameOver: true });
  if (player.health === enemy.health) {
    setStatus({ ...status, draw: true });
  } else if (player.health > enemy.health) {
    setStatus({ ...status, win: true });
  } else {
    setStatus({ ...status, lose: true });
  }
  clearInterval(intervalRef.current);
}

export function swordCollision({
  player1,
  player2,
}: {
  player1: Fighter;
  player2: Fighter;
}) {
  return (
    player1.sword.position.x + player1.sword.width >= player2.position.x &&
    player1.sword.position.x < player2.position.x + player2.width &&
    player1.sword.position.y + player1.sword.height >= player2.position.y &&
    player1.sword.position.y <= player2.position.y + player2.height
  );
}
