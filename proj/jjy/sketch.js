const title = "무한 계단";
const madeBy = "정지윤";
const desc = `이 작품은 펜로즈의 계단의 구조를 빌려 시간을 시각화하였다. 
총 60칸으로 이루어진 계단 위를 공이 초 단위로 한 칸씩 올라간다. 계단의 각 칸은 ‘분’을 상징한다. 1분이 지날 때 칸들의 색이 한 칸씩 전진하고, 60분이 되면 공의 색이 변화한다.
끝없이 이어지는 계단 위를 계속 올라가며, 상승과 반복으로 이루어지는 시간을 시각화하였다.`;

let default_point = [];
let offsetX;
let offsetY;
let stairsH;
let levelH;

let first_point = [];
let second_point = [];
let third_point = [];
let fourth_point = [];

let count;
let divide = []; //array 할거면 꼭 []\

let sec, min, h;
let colorM;
let colorS;

//한번 실행
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB, 60, 60, 60, 59);
  // default_point = [windowWidth * 0.5, windowHeight * 0.5];
  angleMode(DEGREES);

  setPoint();

  // setInterval(() => {
  //   console.log(sec + "초");
  // }, 1000);
}

//화면 크기 달라질때 실행
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  default_point = [];
  setPoint();
}

//몇 프레임.. 가능한 만큼 실행
function draw() {
  ms = new Date().getMilliseconds() * 0.001;
  sec = second();
  min = minute();
  h = hour();

  background(0); //220>>rgb 값 3개 다 같아서 (0) 하나 쓴
  colorMode(RGB, 60, 60, 60, 59);
  // ellipse(mouseX, mouseY, 50, 50); //원 그리는 거 (위치X,위치Y,너비,높이)

  //
  push();
  translate(
    width * 0.5 - second_point[0] * 0.5 - fourth_point[0] * 0.5,
    height * 0.5 - second_point[1] - first_point[1],
  );
  minChanged();

  // 스타트 깃발
  // noFill();
  stroke(60);
  fill(60);
  beginShape();
  vertex(...first_point);
  vertex(first_point[0], first_point[1] - height * 0.0185);
  vertex(
    first_point[0] + height * 0.0093,
    first_point[1] - height * 0.0139,
  );
  vertex(first_point[0], first_point[1] - height * 0.0093);
  endShape(CLOSE);

  secChanged();
  pop();
}

function minChanged() {
  colorMode(RGB, 60, 60, 60, 59);
  for (let i = 0; i < default_point.length; i += 2) {
    colorM = (60 - (min - i / 2)) % 60;
    stroke(255, 0, 0);
    strokeWeight(1);
    // fill(255, 0, 0, abs(i - sec));
    fill(colorM - 5);
    quad(
      default_point[i],
      default_point[i + 1],
      default_point[i] + offsetX,
      default_point[i + 1] + offsetY,
      default_point[i],
      default_point[i + 1] + offsetY * 2,
      default_point[i] - offsetX,
      default_point[i + 1] + offsetY,
    );
    fill(0, colorM, colorM + 15); //하늘
    quad(
      default_point[i],
      default_point[i + 1] + offsetY * 2,
      default_point[i],
      default_point[i + 1] + offsetY * 2 + stairsH,
      default_point[i] - offsetX,
      default_point[i + 1] + offsetY + stairsH,
      default_point[i] - offsetX,
      default_point[i + 1] + offsetY,
    );
    fill(colorM + 15, 0, colorM); //부농
    quad(
      default_point[i],
      default_point[i + 1] + offsetY * 2,
      default_point[i],
      default_point[i + 1] + offsetY * 2 + stairsH,
      default_point[i] + offsetX,
      default_point[i + 1] + offsetY + stairsH,
      default_point[i] + offsetX,
      default_point[i + 1] + offsetY,
    );
  }
}

function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  // return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  //return x* (2-x);
}

function secChanged() {
  colorMode(HSB, 24, 1, 1, 24);
  // h =
  //   hour() +
  //   (minute() + (second() + new Date().getMilliseconds() * 0.001) / 60) / 60;
  fill(h, 1, 1);
  stroke(0, 0, 0, 12);
  let jump = height * 0.0926;
  // noStroke();
  let startPoint = [default_point[sec * 2], default_point[sec * 2 + 1]];
  let middlePoint = [
    default_point[sec * 2] +
      (default_point[(sec * 2 + 2) % 120] - default_point[sec * 2]) * 0.5,
    default_point[sec * 2 + 1] +
      (default_point[(sec * 2 + 1 + 2) % 120] - default_point[sec * 2 + 1]) *
        0.5 -
      jump,
  ];
  let endPoint = [
    default_point[(sec * 2 + 2) % 120],
    default_point[(sec * 2 + 1 + 2) % 120],
  ];
  let ballX =
    Math.pow(1 - easeInOutQuad(ms), 2) * startPoint[0] +
    2 * (1 - easeInOutQuad(ms)) * easeInOutQuad(ms) * middlePoint[0] +
    Math.pow(easeInOutQuad(ms), 2) * endPoint[0];

  let ballY =
    Math.pow(1 - easeInOutQuad(ms), 2) * startPoint[1] +
    2 * (1 - easeInOutQuad(ms)) * easeInOutQuad(ms) * middlePoint[1] +
    Math.pow(easeInOutQuad(ms), 2) * endPoint[1];

  circle(ballX, ballY, height * 0.0231);
  // circle(default_point[sec * 2], default_point[sec * 2 + 1], 5);
  // circle(...middlePoint, 5);

  for (let i = 0; i < default_point.length; i += 2) {
    colorS = (60 - (sec - i / 2)) % 60;
  }
}

function setPoint() {
  offsetX = width * 0.0156;
  offsetY = height * 0.0139;
  levelH = height * 0.0093;
  stairsH = levelH;

  let upperRightAdd = 5;
  let upperLefttAdd = 25;
  let belowRightAdd = 5;
  let belowLefttAdd = 25;

  //포인트
  first_point = [0, 0];
  second_point = [
    first_point[0] + offsetX * upperRightAdd,
    first_point[1] + (offsetY + levelH) * upperRightAdd,
  ];
  third_point = [
    second_point[0] - offsetX * belowRightAdd,
    second_point[1] + (offsetY + levelH) * belowRightAdd,
  ];
  fourth_point = [
    first_point[0] - offsetX * upperLefttAdd,
    first_point[1] + (offsetY - levelH) * upperLefttAdd,
  ];

  //1 -> 4
  default_point.push(first_point[0], first_point[1]); //1

  count = upperLefttAdd;
  divide = [
    abs(first_point[0] - fourth_point[0]) / count,
    abs(first_point[1] - fourth_point[1]) / count,
  ];

  for (let i = 1; i < count + 1; i++) {
    default_point.push(
      first_point[0] - divide[0] * i,
      first_point[1] + divide[1] * i,
    );
  }

  //4->3
  count = belowLefttAdd;
  if (fourth_point[0] < third_point[0]) {
    divide[0] = [abs(third_point[0] - fourth_point[0]) / count];
  } else {
    divide[0] = [-abs(third_point[0] - fourth_point[0]) / count];
  }

  if (fourth_point[1] < third_point[1]) {
    divide[1] = [abs(fourth_point[1] - third_point[1]) / count];
  } else {
    divide[1] = [-abs(fourth_point[1] - third_point[1]) / count];
  }

  for (let i = 1; i < count; i++) {
    default_point.push(
      fourth_point[0] + divide[0] * i,
      fourth_point[1] + divide[1] * i,
    );
  }

  // 3->2
  count = belowRightAdd;

  divide = [
    abs(second_point[0] - third_point[0]) / count,
    abs(second_point[1] - third_point[1]) / count,
  ];

  for (let i = count; i > 0; i--) {
    default_point.push(
      second_point[0] - divide[0] * i,
      second_point[1] + divide[1] * i,
    );
  }

  //2->1
  count = upperRightAdd;

  divide = [
    abs(first_point[0] - second_point[0]) / count,
    abs(first_point[1] - second_point[1]) / count,
  ];

  for (let i = count; i > 0; i--) {
    default_point.push(
      first_point[0] + divide[0] * i,
      first_point[1] + divide[1] * i,
    );
  }
}
