const title = "Loop Jack";
const madeBy = "백채이";
const desc = `파칭코의 게임 방식과 호러 장르의 시각적 문법을 차용하여 제작된 '게임기 형태의 시계' 프로젝트이다. 옛날 TV를 연상시키는 픽셀 그래픽과 물리적인 버튼 인터랙션을 통해 사용자가 직접 시간을 '회전'시키고 '조작'하는 경험을 설계했다. 무한히 반복되는 루프 구조를 통해 시간의 비가역성을 역설적으로 표현했으며, '잭팟'이라는 장치를 배치해 공포와 유희라는 이질적인 감정을 동시에 유도하고자 했다.`;
// 파일 합쳤어요

// main.js
const canvasContainer = document.getElementById("canvas-container");
let renderer;

// pushBtn은 아래 있음
const gameEndSound = new Audio("./assets/sound/gameEnd.mp3");

const INITIAL_W = 2000;
const INITIAL_H = 650;
const INITIAL_RATIO = INITIAL_W / INITIAL_H;

let hX1 = -185;
let hX2 = 135;

let mX1 = 495;
let mX2 = 800;

let sX1 = 1165;
let sX2 = 1470;

// y에 떨어지는 속도를 줄거라 일ㅂ러 따로 뻄
let hY1 = 0;
let hY2 = 0;

let mY1 = 0;
let mY2 = 0;

let sY1 = 0;
let sY2 = 0;

// 애니메이션 상태
let hDropping = false;
let mDropping = false;
let sDropping = false;

let startDropping = false;

// 맥 키보드 백콤 쓰는법-> 한영키 + ₩키 동시에 누름됨

let bgColor1 = "#6C1B00";
let bgColor2 = "#003C70";
let bgColor3 = "#777300";

let reH = null;
let reM = null;
let reS = null;
const IMGS = {
  0: [0],
  1: [1],
  2: [2],
  3: [3],
  4: [4],
  5: [5],
  6: [6],
  7: [7],
  8: [8],
  9: [9],
  // '-': [10, 9, 10],
  // ' ': [10, 10, 10],
};

let tileImgs = [];

// 해치웠나?
async function setup() {
  for (let n = 0; n <= 9; n++) {
    tileImgs[n] = await loadImage(`./assets/img/${n}.png`);
  }

  renderer = createCanvas(INITIAL_W, INITIAL_H);
  renderer.parent(canvasContainer);
  renderer.elt.style.aspectRatio = `${INITIAL_W} / ${INITIAL_H}`;

  new ResizeObserver(() => {
    const { width: containerWidth, height: containerHeight } =
      canvasContainer.getBoundingClientRect();
    const scaledHeight = containerWidth / INITIAL_RATIO;
    renderer.elt.style.width = `${containerWidth}px`;
    renderer.elt.style.height = `${scaledHeight}px`;
  }).observe(canvasContainer);
}

function draw() {
  background(bgColor3);
  noStroke();

  fill(bgColor1);
  rect(0, 0, INITIAL_W / 3, INITIAL_H);

  fill(bgColor2);
  rect(INITIAL_W / 3, 0, INITIAL_W / 3, INITIAL_H);

  const hh = String(hour()).padStart(2, "0");

  const mm = String(minute()).padStart(2, "0");
  const ss = String(second()).padStart(2, "0");

  let h1 = Number(hh[0]); // '0' → 0
  let h2 = Number(hh[1]); // '9' → 9

  tint(50, 0, 0, 150);

  if (hDropping) {
    hY1 += 70;
    hY2 += 70;
    if (hY1 > INITIAL_H) hY1 = -325;
    if (hY2 > INITIAL_H) hY2 = -325;
  }

  image(tileImgs[h1], hX1, hY1);
  image(tileImgs[h2], hX2, hY2);

  let m1 = Number(mm[0]); // 십의 자리
  let m2 = Number(mm[1]); // 일의 자리

  if (mDropping) {
    mY1 += 70;
    mY2 += 70;
    if (mY1 > INITIAL_H) mY1 = -325;
    if (mY2 > INITIAL_H) mY2 = -325;
  }

  image(tileImgs[m1], mX1, mY1);
  image(tileImgs[m2], mX2, mY2);

  let s1 = Number(ss[0]); // 십의 자리
  let s2 = Number(ss[1]); // 일의 자리

  if (sDropping) {
    sY1 += 70;
    sY2 += 70;
    if (sY1 > INITIAL_H) sY1 = -325;
    if (sY2 > INITIAL_H) sY2 = -325;
  }

  image(tileImgs[s1], sX1, sY1);
  image(tileImgs[s2], sX2, sY2);

  if (startDropping) {
    hY1 += 93;
    hY2 += 93;
    mY1 += 102;
    mY2 += 102;
    sY1 += 85;
    sY2 += 85;

    // 화면 밖으로 나가면 초기화
    if (hY1 > INITIAL_H) hY1 = -325;
    if (hY2 > INITIAL_H) hY2 = -325;
    if (mY1 > INITIAL_H) mY1 = -325;
    if (mY2 > INITIAL_H) mY2 = -325;
    if (sY1 > INITIAL_H) sY1 = -325;
    if (sY2 > INITIAL_H) sY2 = -325;
  }
}

// 버튼 클릭 이벤트
const pushBtn = document.getElementById("pushBtn");
pushBtn.addEventListener("click", () => {
  startDropping = true; // 버튼 누르면 애니메이션 시작

  // 3초 후 멈추고 초기 위치 복귀
  setTimeout(() => {
    startDropping = false;
    hY1 = hY2 = mY1 = mY2 = sY1 = sY2 = 0;

    gameEndSound.currentTime = 0;
    gameEndSound.play();
  }, 3200);
});

function mousePressed() {
  // 헤더나 화살표를 클릭했으면 실행하지 않음
  const header = document.getElementById("header");
  const element = document.elementFromPoint(mouseX, mouseY);

  let isOnOverlay = false;
  if (header && header.contains(element)) {
    isOnOverlay = true;
  }
  if (element && element.classList.contains("nav-arrow")) {
    isOnOverlay = true;
  }

  if (isOnOverlay) {
    return;
  }

  // 색 바꾸기
  // --------------------헷깔리니깐
  // hh
  if (
    mouseX >= 0 &&
    mouseX <= INITIAL_W / 3 &&
    mouseY >= 0 &&
    mouseY <= INITIAL_H
  ) {
    bgColor1 = "#FF0000";
    hDropping = true;

    // 2초 후 원래 색으로 복귀
    setTimeout(() => {
      bgColor1 = "#6C1B00";
    }, 1000);

    // 1초 후 멈추고 초기 위치로 복귀
    setTimeout(() => {
      hDropping = false;
      hY1 = 0;
      hY2 = 0;
    }, 3000);
  }

  // mm
  if (
    mouseX >= INITIAL_W / 3 &&
    mouseX <= (INITIAL_W / 3) * 2 &&
    mouseY >= 0 &&
    mouseY <= INITIAL_H
  ) {
    bgColor2 = "#000bd3";
    mDropping = true;
    // 바꾸고 싶은 색

    // 2초 후 원래 색으로 복귀
    setTimeout(() => {
      bgColor2 = "#003C70";
    }, 1000);

    setTimeout(() => {
      mDropping = false;
      mY1 = 0;
      mY2 = 0;
    }, 3000);
  }

  // ss
  if (
    mouseX >= (INITIAL_W / 3) * 2 &&
    mouseX <= INITIAL_W &&
    mouseY >= 0 &&
    mouseY <= INITIAL_H
  ) {
    bgColor3 = "#d4cd01";
    sDropping = true;
    // 바꾸고 싶은 색

    // 2초 후 원래 색으로 복귀
    setTimeout(() => {
      bgColor3 = "#777300";
    }, 1000);

    setTimeout(() => {
      sDropping = false;
      sY1 = 0;
      sY2 = 0;
    }, 3000);
  }

  // --------------------헷깔리니깐
}

// cursor.js
const cursor = document.querySelector(".cur");

const clickDownSound = document.getElementById("clickDownSound");

document.addEventListener("mousemove", (e) => {
  cursor.style.left = e.clientX + 10 + "px";
  cursor.style.top = e.clientY + 40 + "px";
});

document.addEventListener("mousedown", (e) => {
  // 헤더나 화살표를 클릭했으면 실행하지 않음
  const header = document.getElementById("header");
  const navArrows = document.querySelectorAll(".nav-arrow");

  let isOnOverlay = false;
  if (header && header.contains(e.target)) {
    isOnOverlay = true;
  }
  navArrows.forEach((arrow) => {
    if (arrow.contains(e.target)) {
      isOnOverlay = true;
    }
  });

  if (isOnOverlay) {
    return;
  }

  cursor.src = "./assets/img2/hand3.svg";

  clickDownSound.currentTime = 0;
  clickDownSound.play();
});

// 떼면 (놓기)
document.addEventListener("mouseup", () => {
  cursor.src = "./assets/img2/hand2.svg";
});

// button.js
const buttonPush = document.getElementById("imgesBtn");
const box1 = document.querySelector(".box1");

buttonPush.addEventListener("mouseenter", colorChange);

function colorChange() {
  // alert('hi');
  document.body.style.mixBlendMode = "difference";
  box1.style.background = "var(--gradientBtn)";

  setTimeout(() => {
    box1.style.background = "var(--gradientBox)";
    document.body.style.mixBlendMode = "normal";
  }, 2000);
}

// sound.js
function play() {
  const gameSound = document.getElementById("btnSound");
  const devilSound = document.getElementById("devilSound");

  // 다른 소리 끄기
  devilSound.pause();
  devilSound.currentTime = 0;

  clickDownSound.pause();

  // 게임 소리
  gameSound.currentTime = 0;
  gameSound.play();
}

document.getElementById("imgesBtn").addEventListener("mouseenter", () => {
  const gameSound = document.getElementById("btnSound");
  const devilSound = document.getElementById("devilSound");

  // 다른 소리 끄기
  gameSound.pause();
  gameSound.currentTime = 0;

  clickDownSound.pause();

  // 악마 소리
  devilSound.currentTime = 0;
  devilSound.play();
});
