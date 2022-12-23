const width = 320;
const height = 480;

const blockInfoList = [];
const blockWidth = width / 10;
const blockHeight = blockWidth / 2;

const heroWidth = blockWidth * 2;
const heroHeight = heroWidth / 5;
let heroDiv = null;
let heroLeft = width / 2 - heroWidth / 2;
let heroTop = height * 0.8;

const ballSize = 8;
let ballLeft = width / 2 - ballSize / 2;
let ballTop = height / 2;
let ballDiv = null;

let ballSpeed = 5;
let ballDx = 0;
let ballDy = ballSpeed;

let gameover = false;
let messageDiv = null;
let blockCount = 0;

const init = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  container.style.position = "absolute";
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.backgroundColor = "#000";

  let colorIndex = 0;
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      blockCount++;
      const div = document.createElement("div");
      container.appendChild(div);

      const px = (x + 0.5) * blockWidth;
      const py = (y + 1) * blockHeight;
      div.style.position = "absolute";
      div.style.left = `${px}px`;
      div.style.top = `${py}px`;
      div.style.backgroundColor = `hsl(${
        (360 / 8) * (colorIndex % 8)
      }deg, 100%,50%)`;
      div.style.boxSizing = "border-box";
      div.style.border = `3px ridge hsl(${
        (360 / 8) * (colorIndex++ % 8)
      }deg, 100%, 30%)`;
      div.style.width = `${blockWidth}px`;
      div.style.height = `${blockHeight}px`;

      blockInfoList.push({ px, py, available: true, element: div });
    }
  }
  heroDiv = document.createElement("div");
  container.appendChild(heroDiv);

  ballDiv = document.createElement("div");
  container.appendChild(ballDiv);

  let originalX = 0;
  let originalHeroLeft = 0;
  container.onpointerdown = (e) => {
    e.preventDefault();
    // e.pageX = ブラウザから渡されるeventオブジェクトに含まれているプロパティ→マウスカーソル位置がわかる
    originalX = e.pageX;
    originalHeroLeft = heroLeft;
  };
  container.onpointermove = (e) => {
    e.preventDefault();
    if (originalX) {
      heroLeft = originalHeroLeft + (e.pageX - originalX) * 2;
      update();
    }
  };
  container.onpointerup = () => {
    originalX = 0;
  };

  messageDiv = document.createElement("div");
  container.appendChild(messageDiv);
  messageDiv.style.position = "absolute";
  messageDiv.style.left = 0;
  messageDiv.style.top = 0;
  messageDiv.style.right = 0;
  messageDiv.style.bottom = 0;
  messageDiv.style.display = "flex";
  messageDiv.style.alignItems = "center";
  messageDiv.style.justifyContent = "center";
  messageDiv.style.color = "#fff";
  messageDiv.style.fontSize = "50px";
  messageDiv.style.fontFamily = "sans-serif";
};

const update = () => {
  if (gameover) {
    return;
  }
  heroDiv.style.position = "absolute";
  heroDiv.style.left = `${heroLeft}px`;
  heroDiv.style.top = `${heroTop}px`;
  heroDiv.style.width = `${heroWidth}px`;
  heroDiv.style.height = `${heroHeight}px`;
  heroDiv.style.backgroundColor = "#fff";
  heroDiv.style.borderRadius = "50% 50% 0 0";

  ballDiv.style.position = "absolute";
  ballDiv.style.left = `${ballLeft}px`;
  ballDiv.style.top = `${ballTop}px`;
  ballDiv.style.width = `${ballSize}px`;
  ballDiv.style.height = `${ballSize}px`;
  ballDiv.style.backgroundColor = "#fff";
  ballDiv.style.borderRadius = "50% 50% 0 0";

  if (ballTop > height) {
    gameover = true;
    messageDiv.textContent = "gameOver";
  }

  if (blockCount === 0) {
    gameover = true;
    messageDiv.textContent = "clear";
  }
};

const collisionCheck = () => {
  const bx = ballLeft + ballSize / 2;
  const by = ballTop + ballSize / 2;

  // ボールがheroに当たった際に跳ね返る
  if (heroLeft < bx && bx < heroLeft + heroWidth) {
    if (heroTop < by && by < heroTop + heroHeight) {
      if (ballDy > 0) {
        const ratio = ((bx - heroLeft) / heroWidth) * 2 - 1;
        const angle = 60 * ratio;
        ballDy = -Math.cos((angle * Math.PI) / 180) * ballSpeed;
        ballDx = Math.sin((angle * Math.PI) / 180) * ballSpeed;
      }
    }
  }

  // ボールが端に当たった時に跳ね返る
  if ((bx < 0 && ballDx < 0) || (bx > width && ballDx > 0)) {
    ballDx *= -1;
  }
  if (by < 0 && ballDy < 0) {
    ballDy *= -1;
  }
  for (const blockInfo of blockInfoList) {
    const { px, py, available, element } = blockInfo;

    // ブロックとボールの衝突判定
    if (!available) {
      continue;
    }
    if (px < bx && bx < px + heroWidth) {
      if (py < by && by < py + heroHeight) {
        const gl = bx - px;
        const gr = px + blockWidth - bx;
        const gt = by - py;
        const gb = py + blockHeight - by;
        const g = Math.min(gl, gr, gt, gb);
        if (g === gl || g === gr) {
          ballDx *= -1;
        } else {
          ballDy *= -1;
        }
        element.style.display = "none";
        blockInfo.available = false;
        blockCount--;
      }
    }
  }
};

window.onload = () => {
  init();
  update();
  const tick = () => {
    if (!gameover) {
      setTimeout(tick, 16);
    }
    ballLeft += ballDx;
    ballTop += ballDy;
    collisionCheck();
    update();
  };
  tick();
};
