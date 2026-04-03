// iframe에서는 실행하지 않음
if (window.self !== window.top) {
  // iframe 내부이므로 실행 안 함
} else {
  // 동적 UI 요소 생성
  createHeader();
  createNavArrows();
}

// 헤더 동적 생성
function createHeader() {
  const header = document.createElement("header");
  header.className = "overlay-header";
  header.id = "header";
  header.style.position = "absolute";
  header.style.zIndex = "10000";

  header.innerHTML = `
    <div class="header-top">
      <div class="header-left">
        <a href="../../index.html">마법연구회</a>
      </div>
      <div class="header-center" onclick="toggleInfo()">
        <span id="arrow-icon">▼</span>
      </div>
      <div class="header-right">
        <div class="work-info">
          <strong>${title}</strong>
          <span>${madeBy}</span>
        </div>
      </div>
    </div>
    <div class="header-details" id="details">
      <p>${desc}</p>
    </div>
  `;

  document.body.insertBefore(header, document.querySelector(".bg"));
}

// 내비게이션 화살표 생성 (projects.json 기반)
async function createNavArrows() {
  try {
    const response = await fetch("../../proj/projects.json");
    const projects = await response.json();

    // 현재 프로젝트 ID 추출 (URL에서)
    const currentPath = window.location.pathname;
    const pathMatch = currentPath.match(/\/proj\/([a-z]+)\/proj\.html/);
    const currentId = pathMatch ? pathMatch[1] : null;

    if (!currentId) {
      console.warn("현재 프로젝트 ID를 찾을 수 없습니다");
      return;
    }

    // 현재 프로젝트의 인덱스 찾기
    const currentIndex = projects.findIndex((p) => p.id === currentId);
    if (currentIndex === -1) {
      console.warn("프로젝트를 찾을 수 없습니다:", currentId);
      return;
    }

    // 이전/다음 프로젝트 찾기 (순환)
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    const nextIndex = (currentIndex + 1) % projects.length;

    const prevProject = projects[prevIndex];
    const nextProject = projects[nextIndex];

    // 좌측 화살표 (이전)
    const leftArrow = document.createElement("a");
    leftArrow.href = `../${prevProject.id}/proj.html`;
    leftArrow.className = "nav-arrow left-arrow";
    leftArrow.innerHTML = "<span>◀</span>";

    // 우측 화살표 (다음)
    const rightArrow = document.createElement("a");
    rightArrow.href = `../${nextProject.id}/proj.html`;
    rightArrow.className = "nav-arrow right-arrow";
    rightArrow.innerHTML = "<span>▶</span>";

    document.body.appendChild(leftArrow);
    document.body.appendChild(rightArrow);
  } catch (error) {
    console.error("네비게이션 화살표 생성 실패:", error);
  }
}

// 헤더 토글 함수
function toggleInfo() {
  const header = document.getElementById("header");
  const arrow = document.getElementById("arrow-icon");

  header.classList.toggle("is-open");

  if (header.classList.contains("is-open")) {
    arrow.innerText = "▲";
    // 열릴 때: 실제 높이로 설정하고 유지
    header.style.height = header.scrollHeight + "px";
  } else {
    arrow.innerText = "▼";
    // 닫힐 때: 원래 높이로 돌아감
    header.style.height = "60px";
  }
}
