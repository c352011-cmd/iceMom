/*
  screens/blue-2.js
  "엄마를 영상으로 동결건조하기" 상세 화면

  구조:
    .b2-wrap
      .b2-top (항상 고정으로 보이는 영역, 스크롤되지 않음)
        .b2-title       → 최상단: 타이틀
        .b2-video        → 영상 칸: <video> 재생 (버튼으로 재생/일시정지). 흑백 필터 적용.
        .b2-filmstrip     → 영상 프레임 칸: 전체 영상을 균등 간격으로 캡처한 프레임들을
                           가로로 나열, 중앙 고정된 playhead를 기준으로 드래그하면
                           그 지점으로 영상이 이동(scrub)
      .b2-desc-wrap (내부 스크롤되는 영역)
        .b2-desc          → 영상 설명 텍스트
        .b2-reveal-track   → 재생 시간이 HIGHLIGHT_TIMES의 지점을 지날 때마다
                           그 프레임 이미지가 아래로 하나씩 누적되어 쌓이는 영역.
                           되감아서 그 시점보다 이전으로 돌아가면 해당 이미지는 다시 사라짐.

  ※ VIDEO_SRC / DESC / TITLE_LINES / FRAME_COUNT / HIGHLIGHT_TIMES 만 편집하면 됩니다.
    HIGHLIGHT_TIMES는 시간(time) 순으로 정렬되어 있어야 누적/취소 로직이 정확히 동작합니다.

    프레임 캡처는 drawCover()를 통해 원본 영상 비율을 유지한 채
    (CSS object-fit: cover와 동일한 방식으로) FRAME_W x FRAME_H 캔버스를 채우므로
    캡처된 이미지가 찌그러지지 않습니다.

    캡처 해상도(FRAME_W/H)와 필름스트립의 실제 화면 표시 너비(FILMSTRIP_THUMB_W)는
    서로 다른 값입니다. FILMSTRIP_THUMB_W는 반드시 styles.css의 .b2-frame-img
    width 값과 일치해야 스크러빙(드래그) 위치 계산이 정확합니다.
*/

export const title = "";

const TITLE_LINES = [
  "엄마를",
  '<span class="title-highlight">영상</span>으로',
  "동결건조하기",
];

const VIDEO_SRC = "assets/photo/20141009_200408.mp4"; // 실제 영상 준비되면 경로만 교체

const DESC =
  "영상이 로딩되기까지 시간이 1-2초간 소요됩니다. <br>로딩이 끝난 이후 재생버튼을 누르면 정상적으로 작동합니다.";

const FRAME_COUNT = 40; // 필름스트립에 추출할 프레임 개수 (많을수록 스크러빙이 촘촘해지지만 로딩이 느려짐)
const FRAME_W = 1080; // 프레임 캡처 해상도(px). .b2-video의 실제 크기와 맞춰두면 화질/비율이 일치함
const FRAME_H = 560; // 프레임 캡처 해상도(px)
const FILMSTRIP_THUMB_W = 96; // 필름스트립에서 실제로 화면에 보이는 썸네일 너비(px)
// ↑ 반드시 styles.css의 .b2-frame-img { width: 96px; } 값과 동일해야 합니다.

// 특정 인물/장면이 나오는 시점들. 재생이 이 시간(초)을 지나면 해당 프레임이
// 설명 칸 아래로 누적되어 나타난다. 반드시 시간(time) 오름차순으로 정렬할 것.
const HIGHLIGHT_TIMES = [
  { time: 38, label: "1" },
  { time: 39, label: "2" },
  { time: 40, label: "3" },
  { time: 41, label: "4" },
  { time: 42, label: "5" },
  { time: 43, label: "6" },
  { time: 44, label: "7" },
  { time: 45, label: "8" },
  { time: 100, label: "9" },
  { time: 101, label: "10" },
  { time: 102, label: "11" },
  { time: 103, label: "12" },
  { time: 104, label: "13" },
  { time: 105, label: "14" },
  { time: 106, label: "15" },
  { time: 107, label: "16" },
  { time: 165, label: "17" },
  { time: 166, label: "18" },
  { time: 167, label: "19" },
  { time: 168, label: "20" },
  { time: 169, label: "21" },
];

// video의 특정 시점으로 이동하고, 실제로 그 프레임이 그려질 때까지 기다린다.
function seekTo(video, time) {
  return new Promise((resolve) => {
    function onSeeked() {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    }
    video.addEventListener("seeked", onSeeked);
    video.currentTime = time;
  });
}

// source(video/image)를 canvas 크기(dw x dh)에 맞춰, 원본 비율을 유지한 채
// CSS object-fit: cover와 동일한 방식으로 그린다.
// 원본이 목적지보다 옆으로 넓으면 좌우를 잘라내고, 위아래로 길면 위아래를 잘라내서
// 목적지 영역을 정확히 채우되 찌그러지지 않게 한다.
function drawCover(ctx, source, sw, sh, dw, dh) {
  const sourceRatio = sw / sh;
  const destRatio = dw / dh;

  let cropW = sw;
  let cropH = sh;
  let cropX = 0;
  let cropY = 0;

  if (sourceRatio > destRatio) {
    // 원본이 목적지보다 더 옆으로 넓다 → 좌우를 잘라냄
    cropW = sh * destRatio;
    cropX = (sw - cropW) / 2;
  } else {
    // 원본이 목적지보다 더 위아래로 길다 → 위아래를 잘라냄
    cropH = sw / destRatio;
    cropY = (sh - cropH) / 2;
  }

  ctx.drawImage(source, cropX, cropY, cropW, cropH, 0, 0, dw, dh);
}

// video에서 FRAME_COUNT개의 프레임을 균등한 간격으로 캡처해 dataURL 배열로 반환한다.
async function extractFrames(video, duration) {
  const canvas = document.createElement("canvas");
  canvas.width = FRAME_W;
  canvas.height = FRAME_H;
  const ctx = canvas.getContext("2d");

  const frames = [];
  for (let i = 0; i < FRAME_COUNT; i++) {
    const t = (duration * i) / (FRAME_COUNT - 1);
    await seekTo(video, t);
    drawCover(
      ctx,
      video,
      video.videoWidth,
      video.videoHeight,
      FRAME_W,
      FRAME_H,
    );
    frames.push(canvas.toDataURL("image/jpeg", 0.6));
  }
  return frames;
}

// video에서 HIGHLIGHT_TIMES에 지정된 시점들만 캡처해 { src, time, label } 배열로 반환한다.
async function extractHighlights(video) {
  const canvas = document.createElement("canvas");
  canvas.width = FRAME_W;
  canvas.height = FRAME_H;
  const ctx = canvas.getContext("2d");

  const thumbs = [];
  for (const h of HIGHLIGHT_TIMES) {
    await seekTo(video, h.time);
    drawCover(
      ctx,
      video,
      video.videoWidth,
      video.videoHeight,
      FRAME_W,
      FRAME_H,
    );
    thumbs.push({
      src: canvas.toDataURL("image/jpeg", 0.7),
      time: h.time,
      label: h.label,
    });
  }
  return thumbs;
}

export function mount(bodyEl) {
  bodyEl.innerHTML = `
    <div class="b2-wrap">
      <div class="b2-top">
        <div class="b2-title">
          ${TITLE_LINES.map((line) => `<div>${line}</div>`).join("")}
        </div>

        <div class="b2-video">
          <video class="b2-video-el" src="${VIDEO_SRC}" playsinline preload="auto"></video>
          <button class="b2-play" type="button" aria-label="재생/일시정지">▶</button>
        </div>

        <div class="b2-filmstrip">
          <div class="b2-filmstrip-loading">프레임 불러오는 중…</div>
          <div class="b2-filmstrip-playhead"></div>
          <div class="b2-filmstrip-track"></div>
        </div>
      </div>

      <div class="b2-desc-wrap">
        <p class="b2-desc">${DESC}</p>
        <div class="b2-reveal-track"></div>
      </div>
    </div>
  `;

  const video = bodyEl.querySelector(".b2-video-el");
  const playBtn = bodyEl.querySelector(".b2-play");
  const filmstrip = bodyEl.querySelector(".b2-filmstrip");
  const loadingEl = bodyEl.querySelector(".b2-filmstrip-loading");
  const track = bodyEl.querySelector(".b2-filmstrip-track");
  const revealTrack = bodyEl.querySelector(".b2-reveal-track");

  let duration = 0;
  let trackWidth = 0;
  let isDragging = false;
  let isSeekingFromDrag = false;
  let dragStartX = 0;
  let dragStartOffset = 0;
  let currentOffset = 0; // track에 적용 중인 translateX 값(px)

  let highlightsData = []; // [{ src, time, label }], 시간 오름차순
  let shownCount = 0; // 지금까지 누적되어 보여지고 있는 하이라이트 개수

  function containerCenter() {
    return filmstrip.clientWidth / 2;
  }

  // 현재 offset(px)을 track에 반영
  function applyOffset(offset) {
    currentOffset = offset;
    track.style.transform = `translateX(${offset}px)`;
  }

  // offset(px) → video 시간(초)으로 변환
  function offsetToTime(offset) {
    const t = ((containerCenter() - offset) / trackWidth) * duration;
    return Math.min(Math.max(t, 0), duration);
  }

  // video 시간(초) → offset(px)으로 변환
  function timeToOffset(t) {
    return containerCenter() - (t / duration) * trackWidth;
  }

  // 화면 배율(transform: scale)이 걸려있어도 드래그 거리가 정확하도록 보정
  function dragScale() {
    const rect = filmstrip.getBoundingClientRect();
    return rect.width / filmstrip.clientWidth;
  }

  // 현재 재생 시간 기준으로, 설명 칸에 쌓여있어야 할 하이라이트 개수를 계산해
  // 실제 DOM과 맞춘다. 재생하면서 시점을 지나면 뒤에 추가되고,
  // 되감아서 그 시점 이전으로 돌아가면 뒤에서부터 제거된다.
  function syncHighlights() {
    if (!highlightsData.length) return;
    const t = video.currentTime;

    let count = 0;
    while (count < highlightsData.length && highlightsData[count].time <= t) {
      count++;
    }

    if (count === shownCount) return;

    if (count > shownCount) {
      for (let i = shownCount; i < count; i++) {
        const h = highlightsData[i];
        const item = document.createElement("div");
        item.className = "b2-reveal-item";
        item.innerHTML = `<img src="${h.src}" alt="${h.label}" /><span class="b2-reveal-label">${h.label}</span>`;
        revealTrack.appendChild(item);
      }
    } else {
      for (let i = shownCount - 1; i >= count; i--) {
        const last = revealTrack.lastElementChild;
        if (last) revealTrack.removeChild(last);
      }
    }

    shownCount = count;
  }

  function onPointerDown(e) {
    if (!trackWidth) return; // 아직 프레임 로딩 전이면 무시
    isDragging = true;
    filmstrip.classList.add("is-dragging");
    dragStartX = e.clientX;
    dragStartOffset = currentOffset;
    video.pause();
    playBtn.textContent = "▶";
    filmstrip.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const delta = (e.clientX - dragStartX) / dragScale();
    let offset = dragStartOffset + delta;
    // 첫 프레임/마지막 프레임 이상으로 못 넘어가게 제한
    offset = Math.min(
      Math.max(offset, containerCenter() - trackWidth),
      containerCenter(),
    );
    applyOffset(offset);
    isSeekingFromDrag = true;
    video.currentTime = offsetToTime(offset);
    syncHighlights(); // 드래그로 되감을 때도 즉시 누적 이미지가 맞춰지도록
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    filmstrip.classList.remove("is-dragging");
    filmstrip.releasePointerCapture(e.pointerId);
    isSeekingFromDrag = false;
  }

  // 재생 중일 때: 재생 시간에 맞춰 자동으로 track이 따라 움직이고, 누적 이미지도 갱신됨
  function onTimeUpdate() {
    syncHighlights();
    if (isDragging || isSeekingFromDrag) return;
    if (!trackWidth) return;
    applyOffset(timeToOffset(video.currentTime));
  }

  function togglePlay() {
    if (video.paused) {
      video.play();
      playBtn.textContent = "❚❚";
    } else {
      video.pause();
      playBtn.textContent = "▶";
    }
  }

  playBtn.addEventListener("click", togglePlay);
  filmstrip.addEventListener("pointerdown", onPointerDown);
  filmstrip.addEventListener("pointermove", onPointerMove);
  filmstrip.addEventListener("pointerup", onPointerUp);
  filmstrip.addEventListener("pointercancel", onPointerUp);
  // timeupdate는 여기서 바로 걸지 않는다 — 아래 loadedmetadata 콜백에서
  // 프레임/하이라이트 추출(seek 반복)이 끝난 뒤에 붙인다. 추출 도중에 걸려있으면
  // seekTo가 만드는 timeupdate가 syncHighlights/applyOffset을 오작동시켜서
  // 필름스트립이 영상 길이 전체를 제대로 훑지 못하는 원인이 된다.

  // 영상 메타데이터(길이)가 준비되면 필름스트립과 하이라이트 데이터를 순서대로 채운다.
  video.addEventListener(
    "loadedmetadata",
    async () => {
      duration = video.duration;

      // 1) 필름스트립: 영상 전체를 균등 간격으로 캡처
      //    trackWidth는 실제 화면 표시 너비(FILMSTRIP_THUMB_W) 기준으로 계산해야
      //    드래그/재생 위치 매핑이 실제 화면과 정확히 맞는다.
      const frames = await extractFrames(video, duration);
      trackWidth = frames.length * FILMSTRIP_THUMB_W;
      track.style.width = trackWidth + "px";
      track.innerHTML = frames
        .map((src) => `<img class="b2-frame-img" src="${src}" alt="" />`)
        .join("");
      loadingEl.style.display = "none";

      // 2) 하이라이트: 데이터만 미리 캡처해두고, 화면에는 재생 진행에 맞춰 순차적으로 노출
      highlightsData = await extractHighlights(video);

      video.currentTime = 0;
      applyOffset(timeToOffset(0));
      shownCount = 0;
      revealTrack.innerHTML = "";

      // 추출(seek 반복)이 모두 끝난 뒤에야 실제 재생/스크러빙 감지를 시작한다.
      video.addEventListener("timeupdate", onTimeUpdate);
    },
    { once: true },
  );

  return function unmount() {
    video.pause();
    playBtn.removeEventListener("click", togglePlay);
    video.removeEventListener("timeupdate", onTimeUpdate);
    filmstrip.removeEventListener("pointerdown", onPointerDown);
    filmstrip.removeEventListener("pointermove", onPointerMove);
    filmstrip.removeEventListener("pointerup", onPointerUp);
    filmstrip.removeEventListener("pointercancel", onPointerUp);
  };
}
