const title = "Time Hexahedron";
const madeBy = "강제헌";
const desc = `시간의 흐름을 부피를 가진 육면체로 재해석한 작품.
시, 분, 초를 가리키는 세 선분이 서로의 끝 점을 맞댄 채 연결되어 육면체를 구성한다. 
24시간, 60분, 60초를 주기로 회전하는 이 선들은 시간의 흐름에 따라 실시간으로 길이를 늘이고 각도를 비틀며 매 순간 다른 형태의 육면체를 형성한다.`;

let h, m, s, ms;
let hr, mr, sr;
let hl, ml, sl;
let fs;
let angH, angM, angS;
let angHM, angMS, angSH, angSum;
let minRad;
let front, rear, center;
let frontH, frontM, frontS;
let rearH, rearM, rearS;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  strokeJoin(BEVEL);
  colorMode(HSB, 360, 1, 1, 1);
  textFont("Consolas, Courier New, monospace");
  textStyle(BOLD);
  setSize();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setSize();
}

function draw() {
  background(0, 0, 0.05);
  grid();
  time();
  cube();
}

function setSize() {
  minRad = min(width, height) * 0.5;
  // sr = minRad * 0.9;
  // mr = minRad * 0.75;
  // hr = minRad * 0.6;
  sr = minRad * 1;
  mr = minRad * 1;
  hr = minRad * 1;
  fs = constrain(min(width, height) * 0.0125, 14, 24);
}

function time() {
  ms = new Date().getMilliseconds();
  s = (second() + ms * 0.001) * 6;
  m = minute() * 6 + s / 60;
  h = hour() * 15 + m / 24;

  let slt = sr * (s / 360);
  let mlt = mr * (m / 360);
  let hlt = hr * (h / 360);

  sl = sl > slt ? lerp(sl, 0, 0.095) : slt;
  ml = ml > mlt ? lerp(ml, 0, 0.095) : mlt;
  hl = hl > hlt ? lerp(hl, 0, 0.095) : hlt;
}

function setCoord() {
  front = [0, 0];

  const getVec = (len, ang) => [len * cos(-90 + ang), len * sin(-90 + ang)];

  let vH = getVec(hl, h);
  let vM = getVec(ml, m);
  let vS = getVec(sl, s);

  frontH = [front[0] + vH[0], front[1] + vH[1]];
  frontM = [front[0] + vM[0], front[1] + vM[1]];
  frontS = [front[0] + vS[0], front[1] + vS[1]];

  rear = [front[0] + vH[0] + vM[0] + vS[0], front[1] + vH[1] + vM[1] + vS[1]];

  rearH = [rear[0] - vH[0], rear[1] - vH[1]];
  rearM = [rear[0] - vM[0], rear[1] - vM[1]];
  rearS = [rear[0] - vS[0], rear[1] - vS[1]];

  center = [(front[0] + rear[0]) * 0.5, (front[1] + rear[1]) * 0.5];
}

function cube() {
  setCoord();
  angleSum();

  strokeCap(SQUARE);
  rectMode(CENTER);

  push();
  translate(
    (front[0] - rear[0]) * 0.5 + width * 0.5,
    (front[1] - rear[1]) * 0.5 + height * 0.5,
  );

  // front faces
  fill(0, 0, 1, 0.25);
  noStroke();
  shape([front, frontS, rearH, frontM]);
  shape([front, frontH, rearM, frontS]);
  shape([front, frontM, rearS, frontH]);

  // middle faces
  fill(0, 0, 1, 0.25);
  stroke(0, 0, 1);
  strokeWeight(1);
  shape([rearS, frontM, rearH, frontS, rearM, frontH]);

  // rear faces
  noStroke();
  const drawFaceH = () => {
    fill(240, 1, 0.85, 0.9);
    shape([rear, rearM, frontH, rearS]);
  };
  const drawFaceM = () => {
    fill(120, 1, 0.85, 0.9);
    shape([rear, rearS, frontM, rearH]);
  };
  const drawFaceS = () => {
    fill(0, 1, 0.85, 0.9);
    shape([rear, rearH, frontS, rearM]);
  };

  if (angSum >= 359.99) {
    lineRear();
    drawFaceH();
    drawFaceM();
    drawFaceS();
  } else {
    lineRear();
    if (abs(angHM + angMS - angSH) < 0.01) {
      drawFaceS();
      drawFaceH();
      drawFaceM();
    } else if (abs(angMS + angSH - angHM) < 0.01) {
      drawFaceM();
      drawFaceH();
      drawFaceS();
    } else if (abs(angSH + angHM - angMS) < 0.01) {
      drawFaceM();
      drawFaceS();
      drawFaceH();
    }
  }

  // front lines
  strokeWeight(2);
  stroke(240, 1, 1);
  line(...front, ...frontH);
  stroke(120, 1, 1);
  line(...front, ...frontM);
  stroke(0, 1, 1);
  line(...front, ...frontS);

  // labels
  label();

  // center point
  stroke(45, 1, 1);
  fill(45, 0.8, 0.5);
  rect(...front, 6);

  pop();
}

function lineRear() {
  strokeWeight(1);
  stroke(0, 0, 1, 0.66);
  line(...rear, ...rearH);
  line(...rear, ...rearM);
  line(...rear, ...rearS);
}

function shape(verticies) {
  beginShape();
  verticies.forEach((v) => vertex(...v));
  endShape(CLOSE);
}

let txtH = { x: 0, y: 0 };
let txtM = { x: 0, y: 0 };
let txtS = { x: 0, y: 0 };
let targetH, targetM, targetS;
let offsetS, offsetC; // offset side, center
let gap; // text x gap
let speed; // lerp speed
let angCF, angCH, angCM, angCS; // angles from center

function label() {
  offsetS = fs * 2;
  offsetC = fs * 2;
  gap = fs * 2.25;
  speed = 0.15;
  angCF = atan2(front[1] - center[1], front[0] - center[0]);
  angCH = atan2(frontH[1] - center[1], frontH[0] - center[0]);
  angCM = atan2(frontM[1] - center[1], frontM[0] - center[0]);
  angCS = atan2(frontS[1] - center[1], frontS[0] - center[0]);

  noStroke();
  textSize(fs);
  textAlign(CENTER, CENTER);

  push();
  if (angSum >= 359.99) {
    targetH = {
      x: frontH[0] + cos(angCH) * offsetS,
      y: frontH[1] + sin(angCH) * offsetS,
    };
    targetM = {
      x: frontM[0] + cos(angCM) * offsetS,
      y: frontM[1] + sin(angCM) * offsetS,
    };
    targetS = {
      x: frontS[0] + cos(angCS) * offsetS,
      y: frontS[1] + sin(angCS) * offsetS,
    };
  } else {
    targetTxt = { x: cos(angCF) * offsetC, y: sin(angCF) * offsetC };

    if (center[0] > 0) {
      // left
      targetH = { x: targetTxt.x - gap * 2, y: targetTxt.y };
      targetM = { x: targetTxt.x - gap, y: targetTxt.y };
      targetS = { x: targetTxt.x, y: targetTxt.y };
    } else {
      // right
      targetH = { x: targetTxt.x, y: targetTxt.y };
      targetM = { x: targetTxt.x + gap, y: targetTxt.y };
      targetS = { x: targetTxt.x + gap * 2, y: targetTxt.y };
    }
  }

  txtH.x = lerp(txtH.x, targetH.x, speed);
  txtH.y = lerp(txtH.y, targetH.y, speed);
  txtM.x = lerp(txtM.x, targetM.x, speed);
  txtM.y = lerp(txtM.y, targetM.y, speed);
  txtS.x = lerp(txtS.x, targetS.x, speed);
  txtS.y = lerp(txtS.y, targetS.y, speed);

  fill(240, 1, 1);
  text(hour() + "h", txtH.x, txtH.y);
  fill(120, 1, 1);
  text(minute() + "m", txtM.x, txtM.y);
  fill(0, 1, 1);
  text(second() + "s", txtS.x, txtS.y);

  pop();
}

function angleSum() {
  angH = atan2(frontH[1], frontH[0]);
  angM = atan2(frontM[1], frontM[0]);
  angS = atan2(frontS[1], frontS[0]);

  let diff = (a, b) => {
    let d = abs(a - b);
    return d > 180 ? 360 - d : d;
  };

  angHM = diff(angH, angM);
  angMS = diff(angM, angS);
  angSH = diff(angS, angH);

  angSum = angHM + angMS + angSH;
}

function grid() {
  stroke(0, 0, 0.3);
  strokeWeight(1);
  let gridSize = min(width, height) * 0.05;

  for (let i = -0; i < width; i += gridSize) {
    line(i, -height, i, height);
  }

  for (let i = -0; i < height; i += gridSize) {
    line(-width, i, width, i);
  }
}
