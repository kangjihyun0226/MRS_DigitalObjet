const title = "시간 폴더";
const madeBy = "이영민";
const desc = `각 시간을 나타내는 탭이 있고, 시간에 맞게 전환됨. 학기중 주요 강의 시간 탭만 존재, 그 이전과 이후는 close됨. 클릭을 통해 탭을 바꿀 수 있지만 5초 후 현재 시간 탭으로 돌아감.
분은 아래의 박스 개수를 통해 나타남. 초는 마지막 박스의 게이지를 통해 표현.`;

const tabsEl = document.getElementById("tabs");
const headlineEl = document.getElementById("headline");
const sublineEl = document.getElementById("subline");
const minuteBarEl = document.getElementById("minuteBar");
const clockTextEl = document.getElementById("clockText");
const modeHintEl = document.getElementById("modeHint");

const chipsEl = document.getElementById("chips");
const progressValueEl = document.getElementById("progressValue");
const progressFillEl = document.getElementById("progressFill");
const missionBodyEl = document.getElementById("missionBody");
const heroImageEl = document.getElementById("heroImage");

const START_H = 9;
const END_H = 18;
const HOUR_LIST = Array.from(
  { length: END_H - START_H + 1 },
  (_, i) => START_H + i,
);

/**
 * ✅ 여기만 네가 이미지 링크로 바꾸면 됨 (임시 링크)
 * 로컬이면 "./assets/xxx.avif" 이런 식도 가능
 */
const imageMap = {
  9: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1600&q=80",
  10: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  11: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1600&q=80",
  12: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1600&q=80",
  13: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1600&q=80",
  14: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1600&q=80",
  15: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1600&q=80",
  16: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1600&q=80",
  17: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
  18: "https://images.unsplash.com/photo-1520975682031-aee2e8b7f7b8?auto=format&fit=crop&w=1600&q=80",
  close:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
};

const hourCopy = {
  9: {
    title: "09:00 · 부팅 중인 하루",
    sub: "커피는 로딩바. 오늘의 첫 클릭을 준비.",
    mission: "메일/메신저 정리 5분만. 오늘의 우선순위 1개를 고르기.",
  },
  10: {
    title: "10:00 · 리듬이 붙는 시간",
    sub: "손이 기억하기 시작한다. 가볍게 워밍업.",
    mission: "‘가장 쉬운 것’부터 착수. 작은 완료 1개 만들기.",
  },
  11: {
    title: "11:00 · 집중 모드 ON",
    sub: "알림은 무음. 지금은 한 줄씩 정리.",
    mission: "30분 타이머. 핵심 작업 1개만 파고들기.",
  },
  12: {
    title: "12:00 · 점심은 저장 버튼",
    sub: "에너지 리필. 오후를 위한 세이브 포인트.",
    mission: "물 한 컵 + 스트레칭 1분. 오후용 체크리스트 3개.",
  },
  13: {
    title: "13:00 · 오후 첫 페이지",
    sub: "새 문서 열기. 어제의 고민은 접어두기.",
    mission: "오후 목표를 ‘문장 하나’로 정의하기.",
  },
  14: {
    title: "14:00 · 중간 점검 타임",
    sub: "잘 가고 있나? 한 번 줌아웃.",
    mission: "지금 하는 일이 목표와 맞나? 불필요한 1개 삭제.",
  },
  15: {
    title: "15:00 · 손맛이 사는 시간",
    sub: "작업이 ‘붙는’ 순간. 흐름을 타자.",
    mission: "중요도 높은 것에 20분 더. 퀄리티 올리기.",
  },
  16: {
    title: "16:00 · 마감 레이더",
    sub: "끝이 보인다. 불필요한 걸 덜어내기.",
    mission: "결과물 1차 정리. 공유/내보내기 준비.",
  },
  17: {
    title: "17:00 · 마지막 정리",
    sub: "파일명에 v_final_final2 금지.",
    mission: "정리 루틴: 파일명/폴더/백업 3종 세트.",
  },
  18: {
    title: "18:00 · 퇴근 = 로그아웃",
    sub: "오늘의 탭을 닫고, 내일 다시 열기.",
    mission: "오늘 한 줄 회고. 내일 첫 작업 1개만 적기.",
  },
  close: {
    title: "CLOSE · 업무 시간 밖",
    sub: "지금은 닫힘. 휴식이 곧 생산성.",
    mission: "휴식도 일정. 산책/샤워/음악 중 하나만 고르기.",
  },
};

function pad2(n) {
  return String(n).padStart(2, "0");
}
function getLiveKeyByHour(h) {
  return h >= START_H && h <= END_H ? h : "close";
}

/* ---- preview mode ---- */
let viewMode = "live";
let previewKey = null;
let previewTimer = null;

function setMode(mode) {
  viewMode = mode;
  modeHintEl.textContent = mode === "live" ? "LIVE" : "PREVIEW";
}

function enterPreview(key) {
  previewKey = key;
  setMode("preview");
  applyViewForKey(key);

  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(() => exitPreviewToLive(), 5000);
}

function exitPreviewToLive() {
  previewKey = null;
  setMode("live");
  const now = new Date();
  const liveKey = getLiveKeyByHour(now.getHours());
  applyViewForKey(liveKey, now);
}

/* ---- tabs ---- */
function buildTabs() {
  tabsEl.innerHTML = "";

  HOUR_LIST.forEach((h) => {
    const b = document.createElement("div");
    b.className = "folderTab";
    b.dataset.hour = String(h);
    b.innerHTML = `<span>${pad2(h)}:00</span>`;
    b.addEventListener("click", () => enterPreview(h));
    tabsEl.appendChild(b);
  });

  const close = document.createElement("div");
  close.className = "folderTab";
  close.dataset.hour = "close";
  close.innerHTML = `<span>CLOSE</span>`;
  close.addEventListener("click", () => enterPreview("close"));
  tabsEl.appendChild(close);
}

function setActiveTab(activeKey) {
  const tabs = [...tabsEl.querySelectorAll(".folderTab")];
  tabs.forEach((t) =>
    t.classList.toggle("active", t.dataset.hour === String(activeKey)),
  );
}

/* ---- minute blocks (minutes + seconds fill) ---- */
function updateMinuteBlocks(minute, second) {
  const count = minute + 1;

  minuteBarEl.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const block = document.createElement("div");
    block.className = "minuteBlock";

    const fill = document.createElement("div");
    fill.className = "minuteFill";

    if (i < count - 1) {
      // 이미 지난 분 = 100%
      fill.style.height = "100%";
    } else {
      // 🔥 현재 진행 중인 칸
      const pct = (second / 60) * 100;
      fill.style.height = `${pct}%`;

      block.classList.add("active"); // ← 강조!
    }

    block.appendChild(fill);
    minuteBarEl.appendChild(block);
  }
}

/* ---- chips / progress / mission ---- */
function getFocusPercentByMinute(min) {
  return Math.max(0, Math.min(99, Math.round(40 + (min / 59) * 59)));
}

function getEnergyLevelByHourKey(key) {
  if (key === "close") return 0;
  const h = Number(key);
  if (h <= 10) return 2;
  if (h <= 12) return 3;
  if (h <= 15) return 4;
  if (h <= 17) return 3;
  return 2;
}

function renderChips({ key, minute }) {
  const mode = key === "close" ? "BREAK" : "WORK";
  const focus = `${getFocusPercentByMinute(minute)}%`;
  const energy = getEnergyLevelByHourKey(key);
  const energyDots = Array.from({ length: 4 }, (_, i) =>
    i < energy ? "●" : "○",
  ).join("");

  chipsEl.innerHTML = `
    <div class="chip"><span class="dot"></span><span class="k">MODE</span><span class="v">${mode}</span></div>
    <div class="chip"><span class="dot"></span><span class="k">FOCUS</span><span class="v">${focus}</span></div>
    <div class="chip"><span class="dot"></span><span class="k">ENERGY</span><span class="v">${energyDots}</span></div>
  `;
}

function renderProgress(now) {
  const min = now.getMinutes();
  const sec = now.getSeconds();

  const remainSec = 59 - sec + (59 - min) * 60 + 1;
  const remainMin = Math.ceil(remainSec / 60);

  const passed = min * 60 + sec;
  const total = 60 * 60;
  const pct = Math.round((passed / total) * 100);

  progressValueEl.textContent = `${remainMin}분`;
  progressFillEl.style.width = `${pct}%`;
}

function renderMission(key) {
  const data = hourCopy[key] ?? hourCopy.close;
  missionBodyEl.textContent = data.mission ?? "—";
}

/* ---- apply ---- */
function updateCopy(key) {
  const data = hourCopy[key] ?? hourCopy.close;
  headlineEl.textContent = data.title;
  sublineEl.textContent = data.sub;
}

function updateImage(key) {
  // 이미지 표시 비활성화 - p5.js 효과 최대화
  // heroImageEl.src = imageMap[key] || imageMap.close || '';
}

function applyViewForKey(key, now = new Date()) {
  setActiveTab(key);
  updateCopy(key);

  const m = now.getMinutes();
  const s = now.getSeconds();

  updateMinuteBlocks(m, s);

  renderChips({ key, minute: m });
  renderProgress(now);
  renderMission(key);

  updateImage(key);
}

/* ---- tick ---- */
function tick() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  clockTextEl.textContent = `${pad2(h)}:${pad2(m)}:${pad2(s)}`;

  if (viewMode === "live") {
    const liveKey = getLiveKeyByHour(h);
    applyViewForKey(liveKey, now);
  } else {
    // preview 모드: 선택 탭 유지 + 분/초는 현재로 계속 흐르게
    if (previewKey != null) {
      updateMinuteBlocks(m, s);
      renderChips({ key: previewKey, minute: m });
      renderProgress(now);
      renderMission(previewKey);
      updateImage(previewKey);
    }
  }
}

/* ===== p5.js Stress Visualization ===== */
let sketchInstance;
let particles = [];
let particleZone = null;
let resizeObserver = null;

// 시간대별 스트레스 프로필 (0-1 범위)
const stressProfile = {
  9: 0.2, // 부팅 중
  10: 0.3, // 리듬 붙는 중
  11: 0.6, // 집중 모드 ON
  12: 0.4, // 점심 시간
  13: 0.5, // 오후 첫 페이지
  14: 0.7, // 중간 점검
  15: 0.8, // 손맛이 사는 시간
  16: 0.75, // 마감 레이더
  17: 0.6, // 마지막 정리
  18: 0.3, // 퇴근
};

// 시간대별 색상 프로필 - 각 시간을 상징하는 고유 색상
const hourColorMap = {
  9: { r: 255, g: 193, b: 7 }, // 밝은 노란색 - 부팅 (활기)
  10: { r: 66, g: 165, b: 245 }, // 선명한 파란색 - 시작
  11: { r: 25, g: 118, b: 210 }, // 짙은 파란색 - 집중
  12: { r: 76, g: 175, b: 80 }, // 녹색 - 점심
  13: { r: 0, g: 188, b: 212 }, // 청록색 - 오후 첫 페이지
  14: { r: 255, g: 152, b: 0 }, // 주황색 - 중간 점검
  15: { r: 244, g: 67, b: 54 }, // 빨간색 - 피크
  16: { r: 211, g: 47, b: 47 }, // 진한 빨간색 - 마감
  17: { r: 156, g: 39, b: 176 }, // 보라색 - 마지막 정리
  18: { r: 233, g: 30, b: 99 }, // 분홍색 - 퇴근
  close: { r: 117, g: 117, b: 117 }, // 회색 - 업무 시간 밖
};

function getHourColorFromStress(stress) {
  // preview 모드일 때는 선택된 탭의 색상
  if (previewKey != null) {
    return hourColorMap[previewKey] ?? hourColorMap.close;
  }
  // live 모드일 때는 현재 시간의 색상
  const now = new Date();
  const hour = now.getHours();
  return hourColorMap[hour] ?? hourColorMap.close;
}

function getStressLevel() {
  // preview 모드일 때는 선택된 탭의 스트레스 적용
  if (previewKey != null && previewKey !== "close") {
    return stressProfile[previewKey] ?? 0.3;
  }
  // live 모드일 때는 현재 시간의 스트레스 적용
  const now = new Date();
  const hour = now.getHours();
  return stressProfile[hour] ?? 0.3;
}

function getStressColor(stress) {
  // 시간대별 기본 색상을 가져와서 밝기만 변동
  const baseColor = getHourColorFromStress(stress);
  const brightness = 0.8 + Math.random() * 0.3; // 80% ~ 110% 밝기 변동

  return {
    r: Math.min(255, Math.floor(baseColor.r * brightness)),
    g: Math.min(255, Math.floor(baseColor.g * brightness)),
    b: Math.min(255, Math.floor(baseColor.b * brightness)),
  };
}

class StressParticle {
  constructor(x, y, stress, hour) {
    this.x = x;
    this.y = y;
    // 스트레스가 높을수록 더 빠름
    const speedMult = 0.3 + stress * 2;
    this.vx = (Math.random() - 0.5) * 3 * speedMult;
    this.vy = (Math.random() - 0.5) * 3 * speedMult;
    this.life = 1;
    this.stress = stress;
    this.hour = hour;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.3; // 회전 속도
    // 스트레스가 높을수록 더 큼
    this.size = 2 + stress * 8;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    const friction = 0.91 - this.stress * 0.02;
    this.vx *= friction;
    this.vy *= friction;
    this.rotation += this.rotationSpeed;
    // 빠르게 사라지기 (스트레스 무관)
    this.life -= 0.04;
  }

  drawStar(p, x, y, size, rotation) {
    p.push();
    p.translate(x, y);
    p.rotate(rotation);

    const points = 5;
    const outerRadius = size / 2;
    const innerRadius = size / 5;

    p.beginShape();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const vx = Math.cos(angle) * radius;
      const vy = Math.sin(angle) * radius;
      p.vertex(vx, vy);
    }
    p.endShape(p.CLOSE);
    p.pop();
  }

  display(p) {
    const col = getStressColor(this.stress);

    // 시간대별 모양 결정
    if (this.hour === "close") {
      // close: 회전하는 별 모양
      p.fill(col.r, col.g, col.b, this.life * 150);
      p.noStroke();
      this.drawStar(p, this.x, this.y, this.size * 2, this.rotation);
    } else if (this.hour === 18) {
      // 18: 일반 네모
      p.fill(col.r, col.g, col.b, this.life * 150);
      p.noStroke();
      p.rect(
        this.x - this.size / 2,
        this.y - this.size / 2,
        this.size,
        this.size,
      );
    } else if (Number(this.hour) >= 15 && Number(this.hour) <= 17) {
      // 15, 16, 17: 빈 동그라미 (테두리만)
      p.noFill();
      p.stroke(col.r, col.g, col.b, this.life * 150);
      p.strokeWeight(2);
      p.ellipse(this.x, this.y, this.size);
    } else {
      // 9, 10, 11, 12, 13, 14: 꽉 찬 동그라미
      p.fill(col.r, col.g, col.b, this.life * 150);
      p.noStroke();
      p.ellipse(this.x, this.y, this.size);
    }
  }
}

let particleModeBadge;

const sketch = (p) => {
  p.setup = function () {
    const hero = document.querySelector(".hero-visual");
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    const canvas = p.createCanvas(rect.width - 18, rect.height);
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "18px";
    canvas.style.pointerEvents = "none";
    hero.style.position = "relative";
    hero.appendChild(canvas.canvas);

    particleModeBadge = document.createElement("div");
    particleModeBadge.id = "particle-mode-badge";
    particleModeBadge.style.cssText =
      "position:absolute; top: 0.74vh; right: 0.42vw; z-index: 5; background: rgba(0,0,0,0.7); color: #fff; font-size: 0.63vw; padding: 0.56vh 0.52vw; border-radius: 0.52vw; pointer-events: none; font-weight: 700;";
    hero.appendChild(particleModeBadge);

    const emotionText = document.createElement("div");
    emotionText.id = "emotion-text";
    emotionText.textContent = "지금의 감정을 그려보세요";
    emotionText.style.cssText =
      "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; color: #fff; font-size: 1.25vw; font-weight: 700; text-shadow: 0.1vw 0.1vw 0.21vw rgba(0,0,0,0.8); pointer-events: none;";
    hero.appendChild(emotionText);

    p.background(0, 0);
  };

  p.draw = function () {
    p.background(0, 0);

    // particleZone 계산 (캔버스 크기에 맞춰)
    if (particleZone === null) {
      const hero = document.querySelector(".hero-visual");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        particleZone = {
          x: 0,
          y: 0,
          width: rect.width,
          height: rect.height,
        };
      } else {
        particleZone = {
          x: 0,
          y: 0,
          width: p.width,
          height: p.height,
        };
      }
    }

    const stress = getStressLevel();

    // 현재 hour 정보 가져오기
    let currentHour = "close";
    if (previewKey != null) {
      currentHour = previewKey;
    } else {
      const now = new Date();
      currentHour = now.getHours();
    }

    // 마우스 주변에 입자 생성 (스트레스에 따라 달라짐) - particleZone 내에서만
    const particleCount = Math.floor(1 + stress * 15);
    if (
      particleZone &&
      p.mouseX >= particleZone.x &&
      p.mouseX <= particleZone.x + particleZone.width &&
      p.mouseY >= particleZone.y &&
      p.mouseY <= particleZone.y + particleZone.height
    ) {
      for (let i = 0; i < particleCount; i++) {
        let offsetX = 0;
        let offsetY = 0;

        // 9, 10, 11: 적당히 퍼지게 (그림판이 아닌 느낌)
        if (Number(currentHour) >= 9 && Number(currentHour) <= 11) {
          const spreadRange = 20 + stress * 25; // 최대 45px
          offsetX = (Math.random() - 0.5) * spreadRange;
          offsetY = (Math.random() - 0.5) * spreadRange;
        }

        // close: 별 모드 퍼짐 (좀 넓지만 제한)
        if (currentHour === "close") {
          const spreadRange = 30 + stress * 40; // 최대 70px
          offsetX = (Math.random() - 0.5) * spreadRange;
          offsetY = (Math.random() - 0.5) * spreadRange;
        }

        // particleZone 내에 있도록 위치 제한
        let finalX = p.mouseX + offsetX;
        let finalY = p.mouseY + offsetY;
        finalX = Math.max(
          particleZone.x,
          Math.min(particleZone.x + particleZone.width, finalX),
        );
        finalY = Math.max(
          particleZone.y,
          Math.min(particleZone.y + particleZone.height, finalY),
        );

        particles.push(new StressParticle(finalX, finalY, stress, currentHour));
      }
    }

    // 입자 업데이트 및 표시
    particles = particles.filter((p) => p.life > 0);
    particles.forEach((particle) => {
      particle.update();
      particle.display(p);
    });

    // 파티클 상태 텍스트 & 뱃지
    const modeText =
      currentHour === "close"
        ? "19: 끝"
        : Number(currentHour) >= 9 && Number(currentHour) <= 11
          ? "9-11: 귀찮음"
          : Number(currentHour) >= 12 && Number(currentHour) <= 14
            ? "12-14: 스트레스"
            : Number(currentHour) >= 15 && Number(currentHour) <= 17
              ? "15-17: 피크 스트레스"
              : "18: 피곤함";

    if (particleModeBadge) {
      particleModeBadge.textContent = modeText;
      let bgColor;
      switch (modeText) {
        case "9-11: 귀찮음":
          bgColor = "rgba(255, 183, 77, 0.9)";
          break;
        case "12-14: 스트레스":
          bgColor = "rgba(255, 99, 71, 0.95)"; // 더 붉게
          break;
        case "15-17: 피크 스트레스":
          bgColor = "rgba(183, 28, 28, 0.95)"; // 더 검붉게
          break;
        case "18: 피곤함":
          bgColor = "rgba(126, 87, 194, 0.9)";
          break;
        case "19: 끝":
          bgColor = "rgba(76, 175, 80, 0.9)";
          break;
        default:
          bgColor = "rgba(0, 0, 0, 0.7)";
      }
      particleModeBadge.style.background = bgColor;
    }

    // (텍스트 겹침 방지) 더 이상 p5 캔버스에 모드 텍스트를 그리지 않습니다.

    // 스트레스 정보 표시를 껐습니다: 오른쪽 배지로 대체됨
  };

  p.windowResized = function () {
    // ResizeObserver가 particleZone을 처리하므로 canvas만 리사이즈
    const hero = document.querySelector(".hero-visual");
    if (hero) {
      const rect = hero.getBoundingClientRect();
      p.resizeCanvas(rect.width, rect.height);
    }
  };
};

// ResizeObserver로 hero-visual 크기 변화 감지
const heroElement = document.querySelector(".hero-visual");
if (heroElement && window.ResizeObserver) {
  resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const rect = entry.contentRect;
      particleZone = {
        x: 0,
        y: 0,
        width: rect.width,
        height: rect.height,
      };
      // canvas도 리사이즈
      if (sketchInstance) {
        sketchInstance.resizeCanvas(rect.width, rect.height);
      }
    }
  });
  resizeObserver.observe(heroElement);
}

// p5.js 스케치 초기화
new p5(sketch);

/* init */
buildTabs();
setMode("live");
tick();
setInterval(tick, 200);
