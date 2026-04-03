const title = "collision clock";
const madeBy = "신수빈";
const desc = `시계의 세 가지 바늘 중 초침은 제일 부지런히 움직인다
많은 시간이 흐르더라도 나아갈 힘을 잃지 않는 한 끝까지 멈추지 않고 달려간다
이러한 특징을 화면 속에서 공을 튕기며 회전하는 시계로 표현해 보았다
마우스로 공을 조심스럽게 밀어보자
공이 초침에 가까워지는 순간 밀어내지 못하고 그대로 뒤로 튕겨난다
이렇게 초침은 자신에게 다가오는 공을 받아들이지 않고 계속 밀어낸다
공이 수없이 자신의 앞길을 방해하러 와도 초침은 여전히 밀어내며 나아갈 것이다`;

// 공의 형태를 한 움직이는 개체
let entity;
// 시침 분침 초침
let handS;
let handM;
let handH;

// 마우스 위치 벡터
let M;
let radiusM;

// 화면의 중심
let centerX, centerY;

// 배경 색상 관련 변수
let randomHue, randomColor;

// 1920x1280 기준 스케일 팩터
let scaleFactor = 1;

// 튕김 쿨다운
let lastBounceMs = -9999;
let bounceCooldownMs = 70; // 50~120 추천

// 속도 제한/최소 속도
let maxSpeed = 12;
let minSpeedAfterBounce = 1.2;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 1920x1280 기준으로 스케일 계산
  scaleFactor = Math.min(width / 1920, height / 1280);

  colorMode(HSB, 360, 100, 100);
  stroke("white");
  randomHue = random(360);

  let randomX = random(width);
  let randomY = random(height);

  entity = new Entity(randomX, randomY, 40 * scaleFactor);

  // restitution은 1 이하 권장 (1 넘기면 충돌할수록 가속됨)
  entity.restitution = 0.9;

  centerX = width / 2;
  centerY = height / 2;

  handS = new Hand(centerX, centerY, width * 3, 60 * scaleFactor);
  handM = new Hand(centerX, centerY, width / 4, 60 * scaleFactor);
  handH = new Hand(centerX, centerY, width / 6, 60 * scaleFactor);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // 스케일 팩터 재계산
  scaleFactor = Math.min(width / 1920, height / 1280);

  centerX = width / 2;
  centerY = height / 2;

  // 엔티티 크기 업데이트
  entity.radius = 40 * scaleFactor;

  handS = new Hand(centerX, centerY, width * 3, 60 * scaleFactor);
  handM = new Hand(centerX, centerY, width / 4, 60 * scaleFactor);
  handH = new Hand(centerX, centerY, width / 6, 60 * scaleFactor);
}

function drawMouseRing() {
  M = createVector(mouseX, mouseY);
  radiusM = 50 * scaleFactor;
  noFill();
  circle(mouseX, mouseY, radiusM * 2);
}

function timeIndex() {
  push();
  translate(width / 2, height / 2);

  let hourMarkRadius = 170 * scaleFactor;
  let hourMarkLength = 30 * scaleFactor;
  let minMarkRadius = 170 * scaleFactor;
  let minMarkLength = 10 * scaleFactor;

  for (let n = 0; n < 12; n++) {
    push();
    rotate(radians(n * 30));
    line(hourMarkRadius, 0, hourMarkRadius + hourMarkLength, 0);
    pop();
  }
  for (let n = 0; n < 60; n++) {
    push();
    rotate(radians(n * 6));
    line(minMarkRadius, 0, minMarkRadius + minMarkLength, 0);
    pop();
  }
  pop();
}

// 점 P에서 선분 AB까지의 가장 가까운 점 + 거리
function closestPointOnSegment(P, A, B) {
  // P에서 선분 AB까지 가장 가까운 점 계산
  let Ax = A.x || 0,
    Ay = A.y || 0;
  let Bx = B.x || 0,
    By = B.y || 0;
  let Px = P.x || 0,
    Py = P.y || 0;

  let ABx = Bx - Ax;
  let ABy = By - Ay;
  let APx = Px - Ax;
  let APy = Py - Ay;

  let ab2 = ABx * ABx + ABy * ABy;

  if (ab2 === 0) {
    // A와 B가 같은 점
    let d = sqrt((Px - Ax) * (Px - Ax) + (Py - Ay) * (Py - Ay));
    return { point: createVector(Ax, Ay), t: 0, dist: d };
  }

  let t = (APx * ABx + APy * ABy) / ab2;

  // t를 0~1로 제한
  if (isNaN(t)) t = 0;
  if (t < 0) t = 0;
  if (t > 1) t = 1;

  let closestX = Ax + ABx * t;
  let closestY = Ay + ABy * t;

  let dx = Px - closestX;
  let dy = Py - closestY;
  let dist = sqrt(dx * dx + dy * dy);

  return { point: createVector(closestX, closestY), t, dist };
}

// 거울 반사: v' = v - 2*(v·n)*n
function reflectVelocity(v, nUnit) {
  let vel = v.copy();
  let n = nUnit.copy();
  if (n.magSq() === 0) n = createVector(1, 0);
  n.normalize();

  // 법선이 속도와 같은 방향이면 뒤집어서 "안쪽으로" 튕기지 않게
  if (vel.dot(n) > 0) n.mult(-1);

  let dot = vel.dot(n);
  vel.sub(p5.Vector.mult(n, 2 * dot));
  return vel;
}

function draw() {
  randomColor = color(randomHue, 70, 70);
  background(randomColor);

  // 시간 숫자로 표시
  textFont("Escoredream");
  textSize(15 * scaleFactor);
  textAlign(CENTER, CENTER);
  text(
    hour() - 12 + "   :   " + minute() + "   :   " + second(),
    centerX,
    centerY,
  );
  textSize(10 * scaleFactor);
  if (hour() >= 12) {
    text("PM", centerX, centerY - 25 * scaleFactor);
  } else {
    text("AM", centerX, centerY - 25 * scaleFactor);
  }

  drawMouseRing();
  timeIndex();

  // ————— 엔티티 업데이트 —————
  entity.inside();
  entity.move();

  // 마우스 인터랙션은 항상 적용
  entity.runAway(M, radiusM);

  // 너무 빨라지지 않게 항상 제한
  entity.vel.limit(maxSpeed);

  // ---------- 바늘 업데이트 ----------
  let s = second();
  let m = minute();
  let h = hour();

  handS.rotation(s);
  handM.rotation(m);
  handH.rotation(h, 12);

  // ---------- 그리기 ----------
  handS.show();
  handM.show();
  handH.show();

  entity.color = "white";
  entity.show();

  // ===========================
  // ✅ 초침 충돌 (안정 버전)
  // ===========================
  let A = handS.colStart.copy();
  let B = handS.end.copy();
  let P = entity.pos.copy();

  let hit = closestPointOnSegment(P, A, B);
  let isCollide = hit.dist <= entity.radius;

  let now = millis();
  if (isCollide && now - lastBounceMs > bounceCooldownMs) {
    lastBounceMs = now;

    entity.color = "red";
    randomHue = random(360);

    // 1) 충돌 법선(closest -> entity)
    let n = p5.Vector.sub(entity.pos, hit.point);
    if (n.magSq() === 0) n = handS.normalUnit.copy();
    n.normalize();

    // 2) 겹침 해소: 선 밖으로 확실히 밀기(+1px 여유)
    let push = entity.radius - hit.dist + 1.0;
    entity.pos.add(p5.Vector.mult(n, push));

    // 3) 반사: "현재 속도"로 반사 (preEnVel 쓰면 0일 때 멈출 수 있음)
    let reflected = reflectVelocity(entity.vel, n);

    // 4) restitution (절대 1 초과 금지)
    let r = min(entity.restitution, 1.0);
    reflected.mult(r);

    // 5) 멈춤 방지: 너무 느리면 최소 속도 부여
    if (reflected.mag() < minSpeedAfterBounce) {
      reflected.setMag(minSpeedAfterBounce);
    }

    // 6) 최종 적용 + 상한
    reflected.limit(maxSpeed);
    entity.vel = reflected;
  }
}

class CollisionSystem {
  constructor() {}

  // 점 P에서 선분 AB까지의 가장 가까운 점 + 거리 구하기
  closestPointOnSegment(P, A, B) {
    let AB = p5.Vector.sub(B, A);
    let AP = p5.Vector.sub(P, A);

    let ab2 = AB.magSq();
    if (ab2 === 0) {
      // A와 B가 같은 점이면
      return { point: A.copy(), t: 0, dist: p5.Vector.dist(P, A) };
    }

    let t = AP.dot(AB) / ab2;
    t = constrain(t, 0, 1);

    let closest = p5.Vector.add(A, p5.Vector.mult(AB, t));
    let dist = p5.Vector.dist(P, closest);

    return { point: closest, t, dist };
  }

  // (넓게) 충돌 가능성 여부: 선분-원 거리로 판단 (빠르고 안정적)
  preColJudge(line) {
    // 선분 시작/끝
    let A = line.colStart ? line.colStart : line.start;
    let B = line.end;

    let hit = this.closestPointOnSegment(entity.pos, A, B);

    // 여유값(닿기 직전에도 판정이 켜지게)
    let margin = entity.radius * 0.5;
    return hit.dist <= entity.radius + margin;
  }

  // 실제 충돌 여부: 선분-원 최단거리 <= 반지름
  colJudge(line) {
    let A = line.colStart ? line.colStart : line.start;
    let B = line.end;

    let hit = this.closestPointOnSegment(entity.pos, A, B);
    return hit.dist <= entity.radius;
  }

  // 개체가 선에 닿았을 때 위치 재조정 (겹침 해소)
  rePosition(line) {
    let A = line.colStart ? line.colStart : line.start;
    let B = line.end;

    let hit = this.closestPointOnSegment(entity.pos, A, B);

    // 밀어낼 방향 = closest -> entity
    let pushDir = p5.Vector.sub(entity.pos, hit.point);

    // 완전히 겹쳐서 방향이 0이면 법선 사용
    if (pushDir.magSq() === 0) {
      pushDir = line.normalUnit.copy();
    } else {
      pushDir.normalize();
    }

    // 겹친 만큼 + 살짝(0.8px) 더 밀어서 다음 프레임에도 붙어있는 현상 방지
    let pushAmount = entity.radius - hit.dist + 0.8;
    pushDir.mult(pushAmount);

    return p5.Vector.add(entity.pos, pushDir);
  }

  // 반사 속도 계산(항상 반사) — 방향은 충돌 법선 기반
  reVelocity(line, inputVel) {
    let vel = inputVel ? inputVel.copy() : entity.vel.copy();

    let A = line.colStart ? line.colStart : line.start;
    let B = line.end;

    let hit = this.closestPointOnSegment(entity.pos, A, B);

    // 충돌 법선(closest -> entity)
    let n = p5.Vector.sub(entity.pos, hit.point);

    if (n.magSq() === 0) {
      n = line.normalUnit.copy();
    } else {
      n.normalize();
    }

    // vel' = vel - 2*(vel·n)*n
    let dot = vel.dot(n);
    let reflect = p5.Vector.mult(n, 2 * dot);
    vel.sub(reflect);

    return vel;
  }
}

class Entity {
  pos;
  vel;
  radius;

  // 튕김 계수
  restitution = 0.4;

  color = "white";

  constructor(x, y, radius) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.radius = radius;
  }

  // 형태 그리기
  show() {
    fill(this.color);
    circle(this.pos.x, this.pos.y, this.radius * 2);
  }

  // 벽 충돌
  inside() {
    if (this.pos.x + this.radius > width || this.pos.x - this.radius < 0) {
      this.pos.x = constrain(this.pos.x, this.radius, width - this.radius);
      this.vel.x *= -this.restitution;
    }

    if (this.pos.y + this.radius > height || this.pos.y - this.radius < 0) {
      this.pos.y = constrain(this.pos.y, this.radius, height - this.radius);
      this.vel.y *= -this.restitution;
    }
  }

  // ❌ 가속 완전 제거 → 속도로만 이동
  move() {
    this.pos.add(this.vel);
  }

  // 마우스에서 밀려나는 힘 (속도 직접 조정)
  runAway(posVector, range) {
    if (!posVector) return;

    let d = p5.Vector.dist(this.pos, posVector);
    if (d > this.radius + range) return;

    let dir = p5.Vector.sub(this.pos, posVector);
    if (dir.magSq() === 0) dir = createVector(random(-1, 1), random(-1, 1));
    dir.normalize();

    // 가까울수록 강하게 (부드럽게)
    let strength = map(d, this.radius + range, this.radius, 0.2, 1.2, true);
    dir.mult(strength);

    this.vel.add(dir);

    // ✅ 마우스 힘 때문에 폭주 방지
    this.vel.limit(12);
  }
}
class Hand {
  // 선의 길이
  length;

  // 시작점(원래 중심)
  start;

  // 충돌 판정용 시작점(중심에서 살짝 떨어진 점)
  colStart;

  // 끝점
  end;

  // (충돌 판정용) 선 벡터
  Ln;

  // 법선 단위 벡터
  normalUnit;

  // 중심에서 이만큼은 충돌 무시(피벗 구멍)
  innerOffset;

  constructor(startX, startY, length, innerOffset = 60) {
    this.length = length;
    this.innerOffset = innerOffset;

    this.start = createVector(startX, startY);
    this.colStart = createVector(startX, startY);
    this.end = createVector(startX + this.length, startY);

    // 초기 Ln/normal
    this.Ln = p5.Vector.sub(this.end, this.colStart);
    this.normalUnit = this.makeNormalUnit(this.Ln);
  }

  // 선 벡터 회전
  rotation(time, range = 60) {
    let angle = map(time, 0, range, 0, TWO_PI);

    // 방향(단위벡터)
    let dirUnit = p5.Vector.fromAngle(angle - HALF_PI, 1);

    // ✅ 충돌 판정 시작점: 중심에서 innerOffset만큼 떨어진 곳
    this.colStart = p5.Vector.add(
      this.start,
      p5.Vector.mult(dirUnit, this.innerOffset),
    );

    // 끝점은 길이만큼
    this.end = p5.Vector.add(this.start, p5.Vector.mult(dirUnit, this.length));

    // 충돌 판정용 선벡터는 colStart -> end
    this.Ln = p5.Vector.sub(this.end, this.colStart);
    this.normalUnit = this.makeNormalUnit(this.Ln);
  }

  show() {
    // 화면에 보이는 초침도 colStart부터 그리면 자연스러움
    line(this.colStart.x, this.colStart.y, this.end.x, this.end.y);
  }

  // 법선(직각 방향) 구하기
  makeNormalUnit(lineVector) {
    let copyLine = lineVector.copy();
    copyLine.normalize();
    copyLine.rotate(-PI / 2);
    return copyLine;
  }
}
