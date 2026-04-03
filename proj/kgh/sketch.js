const title = "중력시계";
const madeBy = "강지현";
const desc = `시간의 흐름을 중력의 움직임으로 시각화한 이 작품은 1초가 지날 때마다 초 공이 떨어지고 1분이 지나면 분 공이, 1시간이 흐르면 시 공이 차례로 낙하하도록 구성되어 있다. 배경의 디지털 시계는 볼록 렌즈나 물방울을 통해 사물을 바라볼 때처럼 형태가 왜곡되어 보여 유기적인 생동감을 더한다. 하루의 끝인 24:00:00이 되는 순간에는 어떤 장면이 펼쳐질까?`;

const {
  Engine,
  Runner,
  Composites,
  MouseConstraint,
  Mouse,
  Composite,
  Bodies,
  Body,
} = Matter;

let engine;
let world;
let walls = [];
let secondBalls = [];
let minuteBalls = [];
let hourBalls = [];

// 반지름 비율 설정 (화면 너비 기준)
let secondR, minuteR, hourR;
let prevWidth;

function setup() {
  createCanvas(windowWidth, windowHeight);
  prevWidth = width;
  calculateRadii();

  engine = Engine.create();
  world = engine.world;

  createWalls();

  // p5.js가 생성한 canvas 요소 가져오기
  const canvasElement = document.querySelector("canvas");
  const mouse = Mouse.create(canvasElement);
  mouse.pixelRatio = pixelDensity();

  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.1 },
  });

  Composite.add(world, mouseConstraint);

  const runner = Runner.create();
  Runner.run(runner, engine);

  // 초기 공 생성
  for (let i = 0; i < second(); i++) dropSBall();
  for (let i = 0; i < minute(); i++) dropMBall();
  for (let i = 0; i < hour(); i++) dropHBall();
}

// 화면 크기에 따른 반지름 계산 함수
function calculateRadii() {
  secondR = width * 0.02;
  minuteR = width * 0.028;
  hourR = width * 0.036;
}

function windowResized() {
  const scaleFactor = windowWidth / prevWidth; // 변화 비율 계산
  resizeCanvas(windowWidth, windowHeight);

  // 1. 벽 재생성
  Composite.remove(world, walls);
  createWalls();

  // 2. 반지름 재계산
  calculateRadii();

  // 3. 기존 공들의 크기와 위치를 비율에 맞춰 조정
  const allBalls = [...secondBalls, ...minuteBalls, ...hourBalls];
  allBalls.forEach((ball) => {
    // 물리적 크기 스케일 조정
    Body.scale(ball, scaleFactor, scaleFactor);
    // 위치도 화면 비율에 맞게 이동
    Body.setPosition(ball, {
      x: ball.position.x * scaleFactor,
      y: ball.position.y * scaleFactor,
    });
  });

  prevWidth = windowWidth;
}

function createWalls() {
  // 외곽 벽 두께
  const outerThickness = max(width * 0.1, 100);
  // 내부 칸막이 두께
  const innerThickness = max(width * 0.06, 20);

  walls = [
    // 바닥 (아래)
    Bodies.rectangle(
      width * 0.5,
      height + outerThickness / 2,
      width + outerThickness,
      outerThickness * 1.4,
      { isStatic: true },
    ),
    // 왼쪽 벽
    Bodies.rectangle(
      -outerThickness / 2,
      height * 0.5,
      outerThickness * 1.4,
      height * 2,
      { isStatic: true },
    ),
    // 오른쪽 벽
    Bodies.rectangle(
      width + outerThickness / 2,
      height * 0.5,
      outerThickness * 1.4,
      height * 2,
      { isStatic: true },
    ),

    // 첫 번째 칸막이
    Bodies.rectangle(width * 0.33, height * 0.5, innerThickness, height * 2, {
      isStatic: true,
      label: "partition",
    }),
    // 두 번째 칸막이
    Bodies.rectangle(width * 0.66, height * 0.5, innerThickness, height * 2, {
      isStatic: true,
      label: "partition",
    }),
  ];

  Composite.add(world, walls);
}

function dropSBall() {
  const sBall = Bodies.circle(width * 0.8, -50, secondR);
  secondBalls.push(sBall);
  Composite.add(world, sBall);
}

function dropMBall() {
  const mBall = Bodies.circle(width * 0.5, -50, minuteR);
  minuteBalls.push(mBall);
  Composite.add(world, mBall);
}

function dropHBall() {
  const hBall = Bodies.circle(width * 0.15, -50, hourR);
  hourBalls.push(hBall);
  Composite.add(world, hBall);
}

function draw() {
  const m = minute();
  const isEven = m % 2 === 0;

  const bgColor = isEven ? "#000000" : "#ffffff";
  const textColor = isEven ? "#ffffff" : "#000000";

  background(bgColor);

  // 텍스트 렌더링
  push();
  textAlign(CENTER, CENTER);
  textFont("Barlow Condensed");
  textStyle(BOLD);
  textSize(width * 0.2); // 텍스트 크기도 화면 비례
  fill(textColor);
  noStroke();

  text(nf(hour(), 2), width / 6, height / 2);
  text(":", width * 0.33, height / 2);
  text(nf(minute(), 2), width / 2, height / 2);
  text(":", width * 0.66, height / 2);
  text(nf(second(), 2), (width * 5) / 6, height / 2);
  pop();

  // 공 렌더링 함수
  secondBalls.forEach((ball) => drawDistortedBall(ball, secondR, textColor));
  minuteBalls.forEach((ball) => drawDistortedBall(ball, minuteR, textColor));
  hourBalls.forEach((ball) => drawDistortedBall(ball, hourR, textColor));

  updateBallCount();
}

function drawDistortedBall(ball, r, color) {
  let x = ball.position.x;
  let y = ball.position.y;

  let imgX = constrain(x - r, 0, width - r * 2);
  let imgY = constrain(y - r, 0, height - r * 2);

  let img = get(imgX, imgY, r * 2, r * 2);

  push();
  beginClip();
  circle(x, y, r * 2);
  endClip();

  if (img) {
    imageMode(CENTER);
    image(img, x, y, r * 3.6, r * 3.6);
  }
  pop();

  push();
  noFill();
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = color;
  stroke(color);
  strokeWeight(2);
  circle(x, y, r * 2);
  pop();
}

function updateBallCount() {
  const curS = second();
  const curM = minute();
  const curH = hour();

  if (secondBalls.length < curS) dropSBall();
  if (secondBalls.length > curS) Composite.remove(world, secondBalls.shift());

  if (minuteBalls.length < curM) dropMBall();
  if (minuteBalls.length > curM) Composite.remove(world, minuteBalls.shift());

  if (hourBalls.length < curH) dropHBall();
  if (hourBalls.length > curH) Composite.remove(world, hourBalls.shift());
}
