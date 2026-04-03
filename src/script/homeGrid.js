async function loadProjects() {
  try {
    const response = await fetch("./proj/projects.json");
    const projects = await response.json();
    renderGrid(projects);
  } catch (error) {
    console.error("프로젝트 로딩 실패:", error);
  }
}

function renderGrid(projects) {
  const gridContainer = document.querySelector(".grid-container");
  gridContainer.innerHTML = "";

  projects.forEach((project) => {
    const box = document.createElement("a");
    box.href = `./proj/${project.id}/proj.html`;
    box.className = "box";
    box.setAttribute("data-project-id", project.id);

    const iframe = document.createElement("iframe");
    iframe.src = `./proj/${project.id}/proj.html`;
    iframe.scrolling = "no";

    // 제목과 작가 정보 추가
    const info = document.createElement("div");
    info.className = "project-info";
    info.innerHTML = `
      <h3>${project.title}</h3>
      <p>${project.madeBy}</p>
    `;

    box.appendChild(iframe);
    box.appendChild(info);
    gridContainer.appendChild(box);
  });
}

// 페이지 로드시 실행
document.addEventListener("DOMContentLoaded", loadProjects);
