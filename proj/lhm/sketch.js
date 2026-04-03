const title = "숨 쉬는 시간";
const madeBy = "이현민";
const desc = `화면 중앙의 반투명한 원형 오브젝트가 실제 초 단위 변화에 맞춰 팽창과 수축을 반복하며 시간의 흐름을 맥박처럼 보여준다. 배경의 안개 같은 파티클은 분이 바뀔 때마다 색과 흐름이 서서히 달라지면서 시간의 누적을 공간 전체의 분위기로 표현한다.
마우스 인터랙션을 통해 사용자가 시간의 흐름에 직접 개입할 수 있다. 마우스가 중앙 오브젝트에 가까워질수록 호흡 속도가 빨라지고 파티클의 움직임도 강해지며, 멀어질수록 다시 안정된 상태로 돌아간다.`;

// =========================
// Utils
// =========================
function clampVal(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
function smoothstepVal(a, b, x) {
  const t = clampVal((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}
function angleLerp(a, b, t) {
  let d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return a + d * t;
}

// =========================
// Background FX (full-screen nebula + stars + rays)  ✅ NO SQUARES
// =========================
let nebulaG;
let vignetteG;
let stars = [];
let sparks = [];

function makeNebulaFull(w, h) {
  const g = createGraphics(w, h);
  g.pixelDensity(1);
  g.noStroke();

  // base deep tint
  g.background(14, 7, 58);

  // soft color clouds (radial blobs)
  for (let i = 0; i < 10; i++) {
    const cx = random(w * 0.1, w * 0.9);
    const cy = random(h * 0.1, h * 0.9);
    const r = random(Math.min(w, h) * 0.22, Math.min(w, h) * 0.55);

    const palette = [
      [80, 255, 240],
      [90, 180, 255],
      [190, 120, 255],
      [120, 120, 255],
      [70, 90, 255],
    ];
    const col = palette[Math.floor(random(palette.length))];

    for (let k = 0; k < 22; k++) {
      const rr = r * (1 - k / 22);
      const a = 0.05 * (1 - k / 22);
      g.fill(col[0], col[1], col[2], 255 * a);
      g.ellipse(
        cx + random(-Math.min(w, h) * 0.021, Math.min(w, h) * 0.021),
        cy + random(-Math.min(w, h) * 0.021, Math.min(w, h) * 0.021),
        rr * 2,
        rr * 2,
      );
    }
  }

  // noise layer to make it organic (static texture, not per-frame)
  g.loadPixels();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const n1 = noise(x * 0.004, y * 0.004);
      const n2 = noise(x * 0.01 + 100, y * 0.01 + 100);
      const m = n1 * 0.65 + n2 * 0.35;

      // very soft
      const fog = Math.pow(m, 3.2) * 26;

      const idx = 4 * (y * w + x);
      g.pixels[idx + 0] = clampVal(g.pixels[idx + 0] + fog * 0.6, 0, 255);
      g.pixels[idx + 1] = clampVal(g.pixels[idx + 1] + fog * 0.9, 0, 255);
      g.pixels[idx + 2] = clampVal(g.pixels[idx + 2] + fog * 1.2, 0, 255);
      g.pixels[idx + 3] = 255;
    }
  }
  g.updatePixels();
  return g;
}

function makeVignette(w, h) {
  const g = createGraphics(w, h);
  g.pixelDensity(1);
  g.noStroke();
  const cx = w / 2,
    cy = h / 2;
  const R = Math.hypot(cx, cy);

  // radial dark vignette
  for (let i = 0; i < 40; i++) {
    const t = i / 39;
    const rr = R * (0.25 + t * 0.95);
    const a = 90 * Math.pow(t, 2.2);
    g.fill(0, 0, 0, a);
    g.ellipse(cx, cy, rr * 2, rr * 2);
  }
  return g;
}

function resetStars(count) {
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: random(0, width),
      y: random(0, height),
      r: random(0.6, 2.2),
      ph: random(TWO_PI),
      sp: random(0.15, 0.7),
      a: random(40, 170),
    });
  }
}

function addSpark(x, y, col) {
  if (sparks.length > 160) sparks.shift();
  sparks.push({
    x,
    y,
    vx: random(-min(width, height) * 0.0135, min(width, height) * 0.0135),
    vy: random(-min(width, height) * 0.0135, min(width, height) * 0.0135),
    life: random(0.35, 0.85),
    t: 0,
    col,
  });
}

function drawRays() {
  push();
  translate(width / 2, height / 2);
  drawingContext.globalCompositeOperation = "screen";
  noStroke();

  const rayCount = 16;
  for (let i = 0; i < rayCount; i++) {
    const ang = (i / rayCount) * TWO_PI + frameCount * 0.0012;
    const len = Math.min(width, height) * random(0.4, 0.7);
    const w = random(min(width, height) * 0.0083, min(width, height) * 0.0188);
    const a = random(7, 16);
    fill(120, 210, 255, a);
    beginShape();
    vertex(0, 0);
    vertex(Math.cos(ang - 0.02) * w, Math.sin(ang - 0.02) * w);
    vertex(Math.cos(ang) * len, Math.sin(ang) * len);
    vertex(Math.cos(ang + 0.02) * w, Math.sin(ang + 0.02) * w);
    endShape(CLOSE);
  }

  drawingContext.globalCompositeOperation = "source-over";
  pop();
}

function drawStars() {
  drawingContext.globalCompositeOperation = "screen";
  noStroke();
  for (const s of stars) {
    const tw = Math.sin(frameCount * 0.02 * s.sp + s.ph) * 0.5 + 0.5;
    const alpha = s.a * (0.55 + tw * 0.65);
    fill(255, 255, 255, alpha);
    ellipse(s.x, s.y, s.r * (0.7 + tw * 1.2));
  }
  drawingContext.globalCompositeOperation = "source-over";
}

function drawSparks(dt) {
  drawingContext.globalCompositeOperation = "screen";
  noStroke();
  for (let i = sparks.length - 1; i >= 0; i--) {
    const p = sparks[i];
    p.t += dt;
    const u = p.t / p.life;
    if (u >= 1) {
      sparks.splice(i, 1);
      continue;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.pow(0.04, dt);
    p.vy *= Math.pow(0.04, dt);

    const a = (1 - u) * 140;
    fill(p.col[0], p.col[1], p.col[2], a);
    ellipse(
      p.x,
      p.y,
      min(width, height) * 0.00115 + (1 - u) * min(width, height) * 0.00125,
    );
  }
  drawingContext.globalCompositeOperation = "source-over";
}

// =========================
// Blob (time = bulge direction only)
// =========================
class BlobLayer {
  constructor(o) {
    this.baseR = o.baseR;
    this.maxStretch = o.maxStretch;

    this.col = o.col; // [r,g,b]
    this.alpha = o.alpha;

    this.peakPower = o.peakPower;
    this.points = o.points;
    this.hoverRadius = o.hoverRadius;

    this.rot = 0;
    this.rotTarget = 0;

    this.pos = createVector(0, 0);
    this.posV = createVector(0, 0);

    this.wobble = 0;
    this.wobbleV = 0;

    this.stretchExtra = 0;
    this.stretchExtraV = 0;

    this.kPos = o.kPos;
    this.cPos = o.cPos;
    this.repel = o.repel;

    this.ringA = o.ringA;
    this.sparkCol = o.sparkCol;
  }

  setTimeAngle(t) {
    this.rotTarget = t;
  }

  update(dt, mx, my) {
    this.rot = angleLerp(this.rot, this.rotTarget, 1 - Math.pow(0.0006, dt));

    // repel
    const v = createVector(this.pos.x - mx, this.pos.y - my);
    const distToMouse = v.mag();
    if (distToMouse > 0.0001) v.div(distToMouse);

    const near =
      1 - smoothstepVal(this.hoverRadius * 0.45, this.hoverRadius, distToMouse);
    const impulse = near * near;

    this.wobbleV += impulse * 2.2 * dt;
    this.stretchExtraV += impulse * 70 * dt;

    const push = impulse * this.repel;
    const target = p5.Vector.mult(v, push);

    const ax = this.kPos * (target.x - this.pos.x) - this.cPos * this.posV.x;
    const ay = this.kPos * (target.y - this.pos.y) - this.cPos * this.posV.y;
    this.posV.x += ax * dt;
    this.posV.y += ay * dt;
    this.pos.x += this.posV.x * dt;
    this.pos.y += this.posV.y * dt;

    // wobble spring
    const k = 34,
      c = 8.0;
    const a = -k * this.wobble - c * this.wobbleV;
    this.wobbleV += a * dt;
    this.wobble += this.wobbleV * dt;

    // stretch spring
    const kb = 40,
      cb = 8.8;
    const ab = -kb * this.stretchExtra - cb * this.stretchExtraV;
    this.stretchExtraV += ab * dt;
    this.stretchExtra += this.stretchExtraV * dt;

    this.stretchExtra = clampVal(this.stretchExtra, 0, 160);

    if (impulse > 0.25 && random() < 0.1) {
      addSpark(
        width / 2 +
          this.pos.x +
          random(
            -Math.min(width, height) * 0.0052,
            Math.min(width, height) * 0.0052,
          ),
        height / 2 +
          this.pos.y +
          random(
            -Math.min(width, height) * 0.0052,
            Math.min(width, height) * 0.0052,
          ),
        this.sparkCol,
      );
    }
  }

  draw() {
    push();
    translate(width / 2, height / 2);
    translate(this.pos.x, this.pos.y);

    const theta0 = this.rot + this.wobble;

    // neon glow
    drawingContext.shadowColor = `rgba(${this.col[0]},${this.col[1]},${this.col[2]},0.42)`;
    drawingContext.shadowBlur = Math.min(width, height) * 0.05;
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;

    const hx = Math.cos(theta0) * (this.baseR * 0.26);
    const hy = Math.sin(theta0) * (this.baseR * 0.26);

    const r0 = this.col[0],
      g0 = this.col[1],
      b0 = this.col[2];
    const A = this.alpha / 255;

    const grad = drawingContext.createRadialGradient(
      hx - Math.min(width, height) * 0.0052,
      hy - Math.min(width, height) * 0.0125,
      this.baseR * 0.04,
      0,
      0,
      this.baseR * 1.85,
    );
    grad.addColorStop(0.0, `rgba(255,255,255,${0.98 * A})`);
    grad.addColorStop(0.12, `rgba(190,255,250,${0.92 * A})`);
    grad.addColorStop(0.3, `rgba(${r0},${g0},${b0},${1.0 * A})`);
    grad.addColorStop(0.62, `rgba(${r0},${g0},${b0},${0.42 * A})`);
    grad.addColorStop(1.0, `rgba(${r0},${g0},${b0},${0.12 * A})`);

    const maxAdd = this.maxStretch + this.stretchExtra;

    drawingContext.beginPath();
    for (let i = 0; i <= this.points; i++) {
      const t = (i / this.points) * Math.PI * 2;
      const c = (Math.cos(t - theta0) + 1) * 0.5;
      const peak = Math.pow(c, this.peakPower);
      const add = maxAdd * peak;

      const wave =
        1 +
        0.016 * Math.sin(t * 3 + theta0) +
        0.012 * Math.sin(t * 5 - theta0 * 0.6);

      const r = (this.baseR + add) * wave;

      const x = Math.cos(t) * r;
      const y = Math.sin(t) * r;

      if (i === 0) drawingContext.moveTo(x, y);
      else drawingContext.lineTo(x, y);
    }
    drawingContext.closePath();
    drawingContext.fillStyle = grad;
    drawingContext.fill();

    // glow ring (fancy accent)
    drawingContext.shadowBlur = 0;
    drawingContext.globalCompositeOperation = "screen";
    drawingContext.lineWidth = min(width, height) * 0.00104;

    const lg = drawingContext.createLinearGradient(
      -this.baseR,
      -this.baseR,
      this.baseR,
      this.baseR,
    );
    lg.addColorStop(0.0, `rgba(255,255,255,${this.ringA})`);
    lg.addColorStop(0.5, `rgba(${r0},${g0},${b0},${this.ringA * 0.85})`);
    lg.addColorStop(1.0, `rgba(180,255,250,${this.ringA})`);
    drawingContext.strokeStyle = lg;
    drawingContext.stroke();

    drawingContext.globalCompositeOperation = "source-over";
    pop();
  }
}

// =========================
// p5
// =========================
let layers = [];
let lastT = 0;
let pmx = 0,
  pmy = 0;

function setup() {
  const cnv = createCanvas(window.innerWidth, window.innerHeight);
  const wrapEl = document.querySelector(".wrap");
  if (wrapEl) {
    cnv.parent(wrapEl);
  }

  nebulaG = makeNebulaFull(width, height);
  vignetteG = makeVignette(width, height);
  resetStars(Math.floor((width * height) / 14000));

  const s = Math.min(width, height);

  const cSec = [120, 245, 255];
  const cMin = [70, 195, 255];
  const cHour = [40, 150, 255];

  layers = [
    new BlobLayer({
      baseR: s * 0.25,
      maxStretch: s * 0.22,
      col: cSec,
      alpha: 230,
      peakPower: 3.9,
      points: 260,
      hoverRadius: s * 0.44,
      kPos: 15,
      cPos: 4.2,
      repel: 140,
      ringA: 0.22,
      sparkCol: [190, 255, 250],
    }),
    new BlobLayer({
      baseR: s * 0.17,
      maxStretch: s * 0.17,
      col: cMin,
      alpha: 235,
      peakPower: 4.15,
      points: 260,
      hoverRadius: s * 0.36,
      kPos: 16,
      cPos: 4.5,
      repel: 120,
      ringA: 0.2,
      sparkCol: [160, 220, 255],
    }),
    new BlobLayer({
      baseR: s * 0.115,
      maxStretch: s * 0.11,
      col: cHour,
      alpha: 240,
      peakPower: 4.4,
      points: 260,
      hoverRadius: s * 0.3,
      kPos: 17,
      cPos: 4.8,
      repel: 105,
      ringA: 0.18,
      sparkCol: [220, 170, 255],
    }),
  ];

  lastT = millis() / 1000;
  pmx = mouseX;
  pmy = mouseY;
}

function draw() {
  const nowT = millis() / 1000;
  const dt = clampVal(nowT - lastT, 0, 0.033);
  lastT = nowT;

  // background layers
  image(nebulaG, 0, 0);
  drawRays();
  drawStars();
  image(vignetteG, 0, 0);

  // centered mouse
  const mx = mouseX - width / 2;
  const my = mouseY - height / 2;

  // movement sparks
  const spd = dist(mouseX, mouseY, pmx, pmy);
  pmx = mouseX;
  pmy = mouseY;
  if (spd > 10 && random() < 0.35) {
    addSpark(
      mouseX +
        random(
          -Math.min(width, height) * 0.0052,
          Math.min(width, height) * 0.0052,
        ),
      mouseY +
        random(
          -Math.min(width, height) * 0.0052,
          Math.min(width, height) * 0.0052,
        ),
      [200, 255, 255],
    );
  }

  // real time
  const d = new Date();
  const ms = d.getMilliseconds();
  const sec = d.getSeconds() + ms / 1000;
  const min = d.getMinutes() + sec / 60;
  const hr = (d.getHours() % 12) + min / 60;

  const aSec = -Math.PI / 2 + TWO_PI * (sec / 60);
  const aMin = -Math.PI / 2 + TWO_PI * (min / 60);
  const aHr = -Math.PI / 2 + TWO_PI * (hr / 12);

  layers[0].setTimeAngle(aSec);
  layers[1].setTimeAngle(aMin);
  layers[2].setTimeAngle(aHr);

  for (const L of layers) {
    L.update(dt, mx, my);
    L.draw();
  }

  drawSparks(dt);
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);

  nebulaG = makeNebulaFull(width, height);
  vignetteG = makeVignette(width, height);
  resetStars(Math.floor((width * height) / 14000));

  const s = Math.min(width, height);

  layers[0].baseR = s * 0.25;
  layers[0].maxStretch = s * 0.22;
  layers[0].hoverRadius = s * 0.44;

  layers[1].baseR = s * 0.17;
  layers[1].maxStretch = s * 0.17;
  layers[1].hoverRadius = s * 0.36;

  layers[2].baseR = s * 0.115;
  layers[2].maxStretch = s * 0.11;
  layers[2].hoverRadius = s * 0.3;
}
