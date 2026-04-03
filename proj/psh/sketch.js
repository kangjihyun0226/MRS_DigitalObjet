const title = "파동(波動)";
const madeBy = "박시현";
const desc = `파동의 ‘확산’처럼 초·분·시로 이어지는 시간의 흐름을 시각화한 시계.
구성은 안쪽부터 시·분·초 단위로 이루어지며, 가장 바깥의 파동은 초 단위를 나타낸다. 초 단위 파동은 링 하나가 1초를 의미하며, 최대 9개의 링이 축적되는 구조를 반복한다. 이 과정에서 0–9초, 10–19초, 20–29초, 30–39초, 40–49초, 50–59초의 주기적 사이클이 형성된다. 60초에 도달하면 링은 초기화되며, 동시에 분 단위 파동에 새로운 링이 추가된다. 
분 단위 파동 또한 동일한 원리로 작동하며, 링 하나가 1분을 의미한다. 
시 단위 파동은 12시간을 기준으로 구성되며, 총 12개의 링이 축적되는 방식으로 표현된다. 이는 오전과 오후 각각 하나의 순환 주기를 형성한다.
링의 개수만으로 시간을 직관적으로 인지하기 어려운 상황을 보완하기 위해, 각 파동의 외곽에는 숫자 정보를 함께 배치하였다.`;

// ─── 상수 ───────────────────────────────────────────────
const H_INNER = [254, 254, 255, 230];
const H_OUTER = [254, 254, 255, 230];
const M_INNER = [222, 222, 222, 220];
const M_OUTER = [222, 222, 222, 180];
const S_INNER = [192, 192, 192, 150];
const S_OUTER = [192, 192, 192, 110];

const ROTATE_SPEED = 0.001;
const HOUR_BLINK = 100;
const MINUTE_BLINK = 100;
const SECOND_BLINK = 50;

const SCALE_MIN = 0.98;
const SCALE_SPEED = 0.12;

// ─── 전역 상태 ──────────────────────────────────────────
let baseRad, img;

let prevH = -1,
  hourStart = 0;
let prevM = -1,
  minuteStart = 0;
let prevS = -1,
  secondStart = 0;

let scaleVal = 1;
let scaleTarget = 1;

const hTxt = [];
const mTxt = [];
const sTxt = [];

// ─── 셋업 ────────────────────────────────────────────────
async function setup() {
  createCanvas(windowWidth, windowHeight);
  img = await loadImage("./assets/psh_bg_image.png");
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  updateRadiusValues();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateRadiusValues();
}

function updateRadiusValues() {
  baseRad = min(width, height) * 0.04;
}

function mousePressed() {
  scaleTarget = SCALE_MIN;
}

// ─── 메인 루프 ───────────────────────────────────────────
function draw() {
  push();
  resetMatrix();
  const ratio = max(width / img.width, height / img.height);
  const iw = img.width * ratio;
  const ih = img.height * ratio;
  image(img, (width - iw) * 0.5, (height - ih) * 0.5, iw, ih);
  pop();

  const now = millis();
  const curH = hour();
  const curM = minute();
  const curS = second();

  if (curH !== prevH) {
    hourStart = now;
    prevH = curH;
  }
  if (curM !== prevM) {
    minuteStart = now;
    prevM = curM;
  }
  if (curS !== prevS) {
    secondStart = now;
    prevS = curS;
  }

  fillLabel(hTxt, String(curH > 12 ? curH - 12 : curH), "HOUR");
  fillLabel(mTxt, String(curM), "MINUTE");
  fillLabel(sTxt, String(curS), "SECOND");

  translate(width * 0.5, height * 0.5);

  // 스케일 보간
  scaleVal += (scaleTarget - scaleVal) * SCALE_SPEED;
  scale(scaleVal);
  if (scaleTarget < 1 && abs(scaleVal - scaleTarget) < 0.001) {
    scaleTarget = 1;
  }

  const hourMod = curH % 12;
  const minuteMod = curM % 10;
  const secondMod = curS % 10;

  let fontSize = min(width, height) * 0.0056;
  let rad = baseRad;

  // ── 시 링 ───────────────────────────────────────────
  [rad, fontSize] = drawRings(
    rad,
    fontSize,
    hourMod,
    H_INNER,
    now - hourStart,
    HOUR_BLINK,
    min(width, height) * 0.00093,
    0.5,
    min(width, height) * 0.000926,
    1,
    1,
    now,
  );

  rad += fontSize * 0.3;
  fill(...H_OUTER);
  textSize(fontSize + min(width, height) * 0.00182);
  textStyle(BOLD);
  push();
  rotate(now * ROTATE_SPEED);
  makeWaves(rad, hTxt, 1);
  pop();

  // ── 분 링 ───────────────────────────────────────────
  rad += baseRad / 2 + fontSize + min(width, height) * 0.000926;
  [rad, fontSize] = drawRings(
    rad,
    fontSize,
    minuteMod,
    M_INNER,
    now - minuteStart,
    MINUTE_BLINK,
    min(width, height) * 0.00093,
    0.8,
    min(width, height) * 0.0037,
    -1,
    now,
  );

  rad += fontSize * 0.8 + min(width, height) * 0.00185;
  fill(...M_OUTER);
  textSize(fontSize + min(width, height) * 0.00417);
  textStyle(BOLD);
  push();
  rotate(now * -ROTATE_SPEED);
  makeWaves(rad, mTxt, 1);
  pop();

  // ── 초 링 ───────────────────────────────────────────
  rad += baseRad + fontSize;
  fontSize += min(width, height) * 0.0037;
  [rad, fontSize] = drawRings(
    rad,
    fontSize,
    secondMod,
    S_INNER,
    now - secondStart,
    SECOND_BLINK,
    min(width, height) * 0.00126,
    0.78,
    min(width, height) * 0.00463,
    1,
    now,
  );

  rad += fontSize * 0.5;
  fill(...S_OUTER);
  textSize(fontSize + min(width, height) * 0.00625);
  textStyle(BOLD);
  push();
  rotate(now * ROTATE_SPEED);
  makeWaves(rad, sTxt, 0.9);
  pop();
}

// ─── 레이블 배열 채우기 ──────────────────────────────────
function fillLabel(arr, numStr, label) {
  let i = 0;
  for (const c of numStr) arr[i++] = c;
  arr[i++] = "";
  for (const c of label) arr[i++] = c;
  arr.length = i;
}

// ─── 링 그리기 ───────────────────────────────────────────
// fsStep      : fontSize 증가량 (시·분=1, 초=2.15)
// strokeRatio : strokeWeight 계수 (시=0.5, 분=0.8, 초=0.8)
// gap         : 링 사이 추가 간격 (시=1, 분=4, 초=5)
// rotDir      : 회전 방향 (1 또는 -1)
function drawRings(
  rad,
  fontSize,
  count,
  color,
  elapsed,
  blinkDur,
  fsStep,
  strokeRatio,
  gap,
  rotDir,
  now,
) {
  noFill();
  for (let i = 0; i < count; i++) {
    fontSize += fsStep;
    const strokeW = fontSize * strokeRatio;
    const alpha =
      elapsed >= i * blinkDur && elapsed < (i + 1) * blinkDur ? 204 : color[3];

    push();
    rotate(now * ROTATE_SPEED * rotDir);
    stroke(color[0], color[1], color[2], alpha);
    strokeWeight(strokeW);
    circle(0, 0, rad * 2);
    pop();

    rad += fontSize + gap;
  }
  return [rad, fontSize];
}

// ─── 텍스트를 원형으로 배치 ──────────────────────────────
function makeWaves(rad, arr, gapRatio = 0.8) {
  const txtGap = textWidth("...") * gapRatio;
  const circLen = TWO_PI * rad;
  const arrLen = arr.length;
  const dumpCount = floor(circLen / (txtGap * arrLen));
  const dumpAng = 360 / dumpCount;
  const charAng = 360 / floor(circLen / txtGap);

  for (let i = 0; i < dumpCount; i++) {
    push();
    rotate(i * dumpAng);
    for (let j = 0; j < arrLen; j++) {
      push();
      rotate(j * charAng);
      text(arr[j], 0, -rad);
      pop();
    }
    pop();
  }
}
