/*
  main.js
  - 그리드 레이아웃/펼치기(전체화면)/접기 애니메이션만 담당한다.
  - 각 칸의 실제 콘텐츠(상호작용 포함)는 다루지 않는다.
    -> screens/<data-screen>.js 모듈이 담당하고, 이 파일은 그 모듈을
       "필요한 시점(칸을 처음 열 때)"에만 동적으로 import 해서 붙였다 뗀다.
  - 그리드 상태에서 항상 보이는 이미지 콜라주(호버 인터랙션 포함)는
    collage.js 가 담당한다. 이건 가벼운 장식 요소라 지연 로딩 없이 바로 붙인다.
*/

import "./collage.js";

const CANVAS_W = 1080;
const CANVAS_H = 1920;

const canvas = document.getElementById("canvas");
const wrapper = document.getElementById("canvas-wrapper");

/* ---------- 뷰포트에 맞춰 캔버스 스케일 ---------- */
function fitStage() {
  const scale = Math.min(
    window.innerWidth / CANVAS_W,
    window.innerHeight / CANVAS_H,
  );
  wrapper.style.transform = `scale(${scale})`;
}

// 펼쳐진(전체화면) 화면의 "디자인 해상도" — 창 크기와 무관하게 이 비율을 유지한다
const DETAIL_W = 1080;
const DETAIL_H = 1920;

// 1920x1080 박스를 현재 창 크기 안에 비율 유지하며 맞췄을 때의 위치/크기/배율 계산
function getDetailFitRect() {
  const scale = Math.min(
    window.innerWidth / DETAIL_W,
    window.innerHeight / DETAIL_H,
  );
  const width = DETAIL_W * scale;
  const height = DETAIL_H * scale;
  return {
    scale,
    width,
    height,
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
  };
}

function applyDetailFitRect(cell) {
  const fit = getDetailFitRect();
  cell.style.left = fit.left + "px";
  cell.style.top = fit.top + "px";
  cell.style.width = fit.width + "px";
  cell.style.height = fit.height + "px";
  const detail = cell.querySelector(".cell-detail");
  if (detail) detail.style.transform = `scale(${fit.scale})`;
}

window.addEventListener("resize", () => {
  fitStage();
  if (activeCell) applyDetailFitRect(activeCell); // 펼쳐진 칸도 같이 재조정
});
fitStage();

/* ---------- 스크린 모듈 지연 로딩 & 캐시 ---------- */
const screenModuleCache = new Map(); // screenId -> Promise<module>

function loadScreen(screenId) {
  if (!screenModuleCache.has(screenId)) {
    screenModuleCache.set(screenId, import(`./screens/${screenId}.js`));
  }
  return screenModuleCache.get(screenId);
}

async function openDetail(cell) {
  const screenId = cell.dataset.screen;
  const titleEl = cell.querySelector(".detail-title");
  const bodyEl = cell.querySelector(".detail-body");

  bodyEl.innerHTML = '<p class="detail-loading">불러오는 중…</p>';

  try {
    const mod = await loadScreen(screenId);
    // 펼치는 도중 사용자가 이미 닫아버렸다면 그리지 않는다.
    if (!cell.classList.contains("is-active")) return;

    titleEl.textContent = mod.title || "";
    bodyEl.innerHTML = "";
    cell._unmount = typeof mod.mount === "function" ? mod.mount(bodyEl) : null;
  } catch (err) {
    console.error(`[screens/${screenId}.js] 로드 실패`, err);
    bodyEl.innerHTML =
      '<p class="detail-loading">콘텐츠를 불러오지 못했습니다.</p>';
  }
}

function closeDetail(cell) {
  if (typeof cell._unmount === "function") {
    try {
      cell._unmount();
    } catch (err) {
      console.error(err);
    }
  }
  cell._unmount = null;
  cell.querySelector(".detail-body").innerHTML = "";
  cell.querySelector(".detail-title").textContent = "";
  const titleImages = cell.querySelector(".detail-title-images");
  if (titleImages) titleImages.innerHTML = "";
}

/* ---------- 시간 경과에 따른 "멜팅" 텍스처 효과 ----------
   펼쳐진 화면(is-active)에 시간이 지날수록 왜곡(feDisplacementMap)과
   그레인 텍스처가 강해지도록 한다. 냉장고 문을 오래 열어두면 안의 음식이
   녹듯, 화면을 오래 켜둘수록 상해가는 느낌을 준다.
   메인 화면으로 나가면(collapseCell) 즉시 0으로 리셋된다. */
const MELT_RAMP_MS = 45000;
const MELT_MAX_DISPLACE = 8;
const MELT_BASE_FREQ = 0.006;
const MELT_MAX_FREQ = 0.025;
const MELT_MAX_GRAIN_OPACITY = 0.2;
const MELT_WOBBLE_SPEED = 0.00025; // 최대 강도 도달 후에도 패턴이 계속 흔들리는 속도
const MELT_WOBBLE_AMOUNT = 0.15; // 흔들리는 정도(0~1, freq에 대한 비율)

const meltFeTurbulence = document.querySelector("#melt-filter feTurbulence");
const meltFeDisplacement = document.querySelector(
  "#melt-filter feDisplacementMap",
);

function applyMeltProgress(cell, progress, timeMs) {
  const eased = progress * progress;
  const displaceScale = eased * MELT_MAX_DISPLACE;

  // 기본 주파수 + 시간에 따라 계속 진동하는 성분을 더해서,
  // 최대 강도에 도달한 뒤에도 텍스처가 살아있게 만든다.
  const baseFreq = MELT_BASE_FREQ + eased * (MELT_MAX_FREQ - MELT_BASE_FREQ);
  const wobble =
    1 + Math.sin(timeMs * MELT_WOBBLE_SPEED) * MELT_WOBBLE_AMOUNT * eased;
  const freq = baseFreq * wobble;

  if (meltFeDisplacement) {
    meltFeDisplacement.setAttribute("scale", displaceScale.toFixed(2));
  }
  if (meltFeTurbulence) {
    meltFeTurbulence.setAttribute(
      "baseFrequency",
      `${freq.toFixed(4)} ${(freq * 1.6).toFixed(4)}`,
    );
  }

  const grain = cell.querySelector(".cell-melt-grain");
  if (grain) {
    grain.style.opacity = (eased * MELT_MAX_GRAIN_OPACITY).toFixed(3);
  }
}

function meltTick(cell) {
  if (!cell.classList.contains("is-active")) return;
  const now = performance.now();
  const elapsed = now - cell._meltStart;
  const progress = Math.min(elapsed / MELT_RAMP_MS, 1);
  applyMeltProgress(cell, progress, now); // 진행률 + 현재 시각을 같이 넘김
  cell._meltRAF = requestAnimationFrame(() => meltTick(cell));
}

function startMelt(cell) {
  let grain = cell.querySelector(".cell-melt-grain");
  if (!grain) {
    grain = document.createElement("div");
    grain.className = "cell-melt-grain";
    cell.querySelector(".cell-detail").appendChild(grain);
  }
  cell._meltStart = performance.now();
  meltTick(cell);
}

function stopMelt(cell) {
  if (cell._meltRAF) {
    cancelAnimationFrame(cell._meltRAF);
    cell._meltRAF = null;
  }
  applyMeltProgress(cell, 0, performance.now());
}

/* ---------- 칸 펼치기 / 접기 (FLIP 애니메이션) ----------
   확장된 화면은 캔버스(1080x1920) 안에 갇히지 않고 실제 브라우저 창
   전체를 100vw x 100vh 로 채운다. #canvas-wrapper 의 transform: scale()
   영향을 벗어나기 위해, 펼칠 때 셀을 <body> 바로 아래로 옮긴다. */
let activeCell = null;

// 펼칠 때, 그리드(분할화면) 상태에서 쓰던 콜라주 이미지들을 타이틀 영역에
// data-images에 적힌 순서 그대로(=원하는 순서) 나열해서 보여준다.
function renderTitleImages(cell) {
  const container = cell.querySelector(".detail-title-images");
  if (!container) return;
  container.innerHTML = "";

  const collage = cell.querySelector(".collage");
  if (!collage) return;

  let srcs = [];
  if (collage.dataset.images) {
    srcs = collage.dataset.images
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((entry) => entry.split("|")[0].trim()); // "경로|top|left|rotate"에서 경로만
  } else {
    srcs = Array.from(collage.querySelectorAll(".collage-img")).map((img) =>
      img.getAttribute("src"),
    );
  }

  srcs.forEach((src) => {
    const img = document.createElement("img");
    img.className = "detail-title-img";
    img.src = src;
    img.alt = "";
    container.appendChild(img);
  });
}

function expandCell(cell) {
  if (activeCell) return;
  activeCell = cell;

  const startRect = cell.getBoundingClientRect();

  const placeholder = document.createElement("div");
  placeholder.className = "cell-placeholder";
  const cellStyle = getComputedStyle(cell);
  placeholder.style.flexGrow = cellStyle.flexGrow;
  placeholder.style.flexShrink = cellStyle.flexShrink;
  placeholder.style.flexBasis = cellStyle.flexBasis;
  cell.parentNode.insertBefore(placeholder, cell);
  cell._placeholder = placeholder;
  cell._originalParent = placeholder.parentNode;

  document.body.appendChild(cell);
  Object.assign(cell.style, {
    position: "fixed",
    margin: "0",
    left: startRect.left + "px",
    top: startRect.top + "px",
    width: startRect.width + "px",
    height: startRect.height + "px",
    zIndex: "9999",
    transition:
      "left .45s cubic-bezier(.22,.61,.36,1), top .45s cubic-bezier(.22,.61,.36,1), " +
      "width .45s cubic-bezier(.22,.61,.36,1), height .45s cubic-bezier(.22,.61,.36,1)",
  });

  canvas.classList.add("is-expanded");
  cell.classList.add("is-active");

  // 수정
  const fit = getDetailFitRect();
  const detail = cell.querySelector(".cell-detail");
  if (detail) detail.style.transform = `scale(${fit.scale})`;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      applyDetailFitRect(cell);
    });
  });

  renderTitleImages(cell);
  openDetail(cell);
  startMelt(cell); // 펼쳐지는 순간부터 멜팅 타이머 시작
}

function collapseCell(cell) {
  if (!cell || !cell._placeholder) return;
  stopMelt(cell); // 닫는 즉시 멜팅 효과 리셋

  const targetRect = cell._placeholder.getBoundingClientRect();
  cell.style.left = targetRect.left + "px";
  cell.style.top = targetRect.top + "px";
  cell.style.width = targetRect.width + "px";
  cell.style.height = targetRect.height + "px";

  function onEnd(e) {
    if (e.target !== cell) return;
    cell.removeEventListener("transitionend", onEnd);

    cell._originalParent.insertBefore(cell, cell._placeholder);
    cell._placeholder.remove();
    cell._placeholder = null;
    cell._originalParent = null;

    cell.classList.remove("is-active");
    canvas.classList.remove("is-expanded");
    Object.assign(cell.style, {
      position: "",
      margin: "",
      left: "",
      top: "",
      width: "",
      height: "",
      zIndex: "",
      transition: "",
    });

    activeCell = null;
    closeDetail(cell); // 상호작용 정리(영상 정지, 리스너 해제 등)는 여기서 일괄 수행
  }
  cell.addEventListener("transitionend", onEnd);
}

document.querySelectorAll(".cell").forEach((cell) => {
  cell.addEventListener("click", () => {
    if (activeCell === cell) return;
    if (activeCell && activeCell !== cell) return;
    expandCell(cell);
  });

  cell.querySelector(".detail-close").addEventListener("click", (e) => {
    e.stopPropagation();
    collapseCell(cell);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && activeCell) collapseCell(activeCell);
});
