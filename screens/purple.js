/*
  screens/purple.js
  "엄마를 무늬로 동결건조하기" 상세 화면

  구조:
    .pu-wrap
      .pu-top
        .pu-title      → 좌측 최상단: 타이틀
        .pu-top-right  → 우측 최상단: 그라디언트(텍스트 없음)
      .pu-main
        .pu-output     → 좌측 상단(큰 영역): 생성된 이미지 표시. 비어있으면 체크무늬(투명 표시)
        .pu-right
          .pu-gallery    → 우측 2번째: 소스 이미지 목록, 클릭으로 다중 선택
          .pu-make       → 우측 3번째: make 버튼 — 선택된 이미지들을 합성해 .pu-output에 표시
      .pu-bottom       → 최하단: 그라디언트 이미지

  동작 방식:
    - 갤러리에서 이미지를 클릭하면 선택/해제 토글 (여러 장 선택 가능)
    - make 버튼을 누르면, 선택된 이미지들을 canvas 위에 무작위 위치/크기/회전/투명도로
      겹쳐 그려서 하나의 콜라주를 만들고, 그 결과를 .pu-output에 표시한다.
    - 같은 이미지 조합으로 다시 눌러도 매번 랜덤이라 결과가 달라진다.

  ※ SOURCE_IMAGES / TITLE_LINES 만 편집하면 소스 이미지와 타이틀이 바뀝니다.
*/

export const title = "";

const TITLE_LINES = [
  "엄마를",
  '<span class="title-highlight">무늬</span>로',
  "동결건조하기",
];

// 갤러리에 나열할 소스 이미지들. 실제 파일 준비되면 경로만 교체하세요.
const SOURCE_IMAGES = [
  "assets/무늬/3ce75779153f28b25602bb449bc9ac70.jpg",
  "assets/무늬/5cbf1de3cdbe3d0b11054a1589593348.jpg",
  "assets/무늬/93e85ecb95b90ef38969bef61964b625.jpg",
  "assets/무늬/97f1faafab80f563948b0d8cd8189d72.jpg",
  "assets/무늬/197e0b50a88a7f318eebc2ccfea0ada8.jpg",
  "assets/무늬/4841ed9ad72ca23210371fd5b50e534a.jpg",
  "assets/무늬/758522aabdd5c1cb894f1d949cbddf0b.jpg",
  "assets/무늬/df8cde262d6ec4eb7d9727c96ffa6067.jpg",
  "assets/무늬/Gemini_Generated_Image_hp8l0xhp8l0xhp8l.jpg",
];

// 합성 결과물의 캔버스 크기(px). .pu-output의 실제 표시 크기와 비율이 다르면
// object-fit: cover로 채워지므로 정사각형에 가깝게 잡아둠.
const OUTPUT_W = 800;
const OUTPUT_H = 1000;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

// 1단계: 캔버스를 격자로 나눠, 각 칸을 선택된 이미지의 무작위 crop으로 빈틈없이 채운다.
function drawMosaicBase(ctx, images) {
  const cols = randomInt(3, 5);
  const rows = randomInt(4, 7);
  const cellW = OUTPUT_W / cols;
  const cellH = OUTPUT_H / rows;
  const overlap = 1.5; // 이웃 칸과 살짝 겹치게 그려서 이음새(seam) 틈을 방지

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const img = images[Math.floor(Math.random() * images.length)];

      // 원본 이미지에서 셀 비율에 맞는 영역을 무작위로 crop
      const cellRatio = cellW / cellH;
      const imgRatio = img.width / img.height;
      let cropW, cropH;
      if (imgRatio > cellRatio) {
        cropH = img.height;
        cropW = cropH * cellRatio;
      } else {
        cropW = img.width;
        cropH = cropW / cellRatio;
      }
      const cropX = randomBetween(0, img.width - cropW);
      const cropY = randomBetween(0, img.height - cropH);

      const dx = c * cellW - overlap;
      const dy = r * cellH - overlap;
      const dw = cellW + overlap * 2;
      const dh = cellH + overlap * 2;

      ctx.save();
      if (Math.random() < 0.5) {
        // 절반 확률로 좌우 반전해서 같은 이미지를 써도 패턴이 다양해 보이게 함
        ctx.translate(dx + dw, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, dw, dh);
      } else {
        ctx.drawImage(img, cropX, cropY, cropW, cropH, dx, dy, dw, dh);
      }
      ctx.restore();
    }
  }
}

// 2단계: 기존처럼 무작위 크기/회전/투명도로 이미지를 겹쳐 유기적인 텍스처를 더한다.
function drawTextureLayer(ctx, images) {
  images.forEach((img) => {
    const scale = randomBetween(0.4, 0.85);
    const w = OUTPUT_W * scale;
    const h = w * (img.height / img.width);

    const x = randomBetween(0, OUTPUT_W - w * 0.5) - w * 0.25;
    const y = randomBetween(0, OUTPUT_H - h * 0.5) - h * 0.25;
    const angle = randomBetween(-25, 25) * (Math.PI / 180);
    const alpha = randomBetween(0.35, 0.7); // 기반 레이어가 이미 꽉 차 있으니 투명도를 낮게 유지

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(angle);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  });
}

// 선택된 이미지들로 캔버스 전체를 빈틈없이 채운 콜라주를 만들어 dataURL로 반환한다.
async function composeCollage(srcList) {
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_W;
  canvas.height = OUTPUT_H;
  const ctx = canvas.getContext("2d");

  const images = await Promise.all(srcList.map(loadImage));

  drawMosaicBase(ctx, images); // 1단계: 캔버스 전체를 빈틈없이 채움
  drawTextureLayer(ctx, images); // 2단계: 그 위에 유기적인 텍스처 추가

  return canvas.toDataURL("image/png");
}

export function mount(bodyEl) {
  bodyEl.innerHTML = `
    <div class="pu-wrap">
      <div class="pu-top">
        <div class="pu-title">
          ${TITLE_LINES.map((line) => `<div>${line}</div>`).join("")}
        </div>
        <div class="pu-top-right"></div>
      </div>

      <div class="pu-main">
        <div class="pu-output">
          <img class="pu-output-img" alt="생성된 이미지" hidden />
        </div>

        <div class="pu-right">
          <div class="pu-gallery">
            ${SOURCE_IMAGES.map(
              (src, i) => `
              <button class="pu-thumb" type="button" data-src="${src}">
                <img src="${src}" alt="소스 이미지 ${i + 1}" />
              </button>
            `,
            ).join("")}
          </div>

          <button class="pu-make" type="button">make</button>
        </div>
      </div>

      <div class="pu-bottom"></div>
    </div>
  `;

  const thumbs = Array.from(bodyEl.querySelectorAll(".pu-thumb"));
  const makeBtn = bodyEl.querySelector(".pu-make");
  const outputEl = bodyEl.querySelector(".pu-output");
  const outputImg = bodyEl.querySelector(".pu-output-img");

  const selected = new Set();

  function onThumbClick(e) {
    const btn = e.currentTarget;
    const src = btn.dataset.src;
    if (selected.has(src)) {
      selected.delete(src);
      btn.classList.remove("is-selected");
    } else {
      selected.add(src);
      btn.classList.add("is-selected");
    }
  }

  async function onMakeClick() {
    if (selected.size === 0) return; // 선택된 이미지가 없으면 아무 동작 안 함

    makeBtn.disabled = true;
    makeBtn.textContent = "making…";

    try {
      const dataUrl = await composeCollage(Array.from(selected));
      outputImg.src = dataUrl;
      outputImg.hidden = false;
      outputEl.classList.add("has-image");
    } catch (err) {
      console.error("이미지 합성 실패", err);
    } finally {
      makeBtn.disabled = false;
      makeBtn.textContent = "make";
    }
  }

  thumbs.forEach((btn) => btn.addEventListener("click", onThumbClick));
  makeBtn.addEventListener("click", onMakeClick);

  return function unmount() {
    thumbs.forEach((btn) => btn.removeEventListener("click", onThumbClick));
    makeBtn.removeEventListener("click", onMakeClick);
  };
}
