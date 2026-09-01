/*
  screens/blue-1.js
  "엄마를 사진으로 동결건조하기" 상세 화면

  구조:
    .b1-wrap
      .b1-left
        .b1-title      → 타이틀 (TITLE_LINES 배열만 고치면 됨)
        .b1-stage      → 사진 + 좌우 화살표 + 돋보기(lens)
        .b1-desc-wrap  → 좌측 최하단: 호버한 영역에 따라 바뀌는 설명 텍스트 (그라디언트 배경)
      .b1-right
        .b1-right-top     → 우측 최상단 (그라디언트 배경)
        .b1-right-bottom  → 우측 하단: 날짜/위치/상황묘사 (그라디언트 배경)

  ※ 아래 PHOTOS / TITLE_LINES 두 군데만 고치면
    이미지, 영역별 설명, 우측 정보, 타이틀이 전부 바뀝니다.
    각 PHOTOS 항목의 info.desc 등에 <br>을 넣으면 실제 줄바꿈으로 표시됩니다(innerHTML 사용).
*/

export const title = ""; // 이 화면은 타이틀을 직접 그리므로 기본 title은 비워둔다

// ---------------------------------------------------------------
// 1) 데이터: 여기만 편집하면 됨
// ---------------------------------------------------------------

const PHOTOS = [
  {
    src: "assets/photo/우무문어.jpeg",
    defaultText: "사진 위에 마우스를 올려보세요.",
    regions: [
      {
        x: 18,
        y: 25,
        w: 26,
        h: 20,
        text: "내가 선물한 우무문어 인형. 엄마의 최애 동물이다. 모여봐요 동물의 숲에서 바다 채집을 하면서 처음 본 이후, 귀여워서 사랑에 빠졌다. 우리집 딸들의 취미는 게임에서 우무문어를 잡아 엄마 집 앞에 쌓아두는 것이다.",
      },
      {
        x: 70,
        y: 35,
        w: 30,
        h: 35,
        text: "엄마가 쓰는 노트북. 아빠 회사에서 쓰던 노트북이 낡아서 엄마가 쓰게 됐다. 충전기를 뽑으면 바로 전원이 꺼지고, 렉이 자주 걸리는 극악의 노트북이다.",
      },
      {
        x: 70,
        y: 70,
        w: 25,
        h: 30,
        text: "언니가 만든 마우스패드. 언니가 프리랜서를 시작한 이후 만든 첫 굿즈라 엄마가 굉장히 아끼며 사용한다.",
      },
      {
        x: 30,
        y: 20,
        w: 20,
        h: 20,
        text: "전기파리채. 요즘 우리집 핫템이다. 다만 아빠 외에는 잘 작동이 되지 않아서 가족끼리 용사의 검이라고 부른다. 엄마는 파리를 잡고싶을 때 아빠에게 파리채를 건넨다.",
      },
    ],
    info: {
      date: "2026.03.14",
      place: "거실",
      desc: "엄마와<br>우무문어",
    },
  },
  {
    src: "assets/photo/생일2.jpeg",
    defaultText: "사진 위에 마우스를 올려보세요.",
    regions: [
      {
        x: 0,
        y: 80,
        w: 26,
        h: 26,
        text: "아빠가 사준 프리지아 꽃다발. 엄마의 최애 꽃이다. 매년 엄마 생일에는 프리지아 꽃다발이 빠지지 않는다.",
      },
      {
        x: 30,
        y: 50,
        w: 26,
        h: 26,
        text: "아이스크림 케이크. 엄마의 생일임에도 불구하고, 내가 아이스크림 케이크를 먹고싶어해서 샀다. 참고로 엄마의 최애 케이크는 치즈케이크이다.엄마 미안..",
      },
      {
        x: 70,
        y: 70,
        w: 26,
        h: 26,
        text: "케이크용 라이터. 놀랍게도 우리집은 아직도 이 라이터를 쓴다.",
      },
      {
        x: 30,
        y: 30,
        w: 26,
        h: 26,
        text: "엄마의 줄무늬 티셔츠. 이 또한 아직도 집에 있다..",
      },
      {
        x: 70,
        y: 30,
        w: 26,
        h: 26,
        text: "스피커. 이 스피커 덕분에 우리집은 영화관 같은 사운드로 TV를 볼 수 있다. 아직 우리집에 잘 있다.",
      },
      {
        x: 30,
        y: 0,
        w: 26,
        h: 26,
        text: "엄마 귀여워",
      },
    ],
    info: {
      date: "2013.03.09",
      place: "거실",
      desc: "엄마의<br>생일파티",
    },
  },
  {
    src: "assets/photo/스페인.JPG",
    defaultText: "사진 위에 마우스를 올려보세요.",
    regions: [
      {
        x: 65,
        y: 70,
        w: 26,
        h: 26,
        text: "엄마가 제일 좋아하는 스카프. 엄마한테 잘 어울리는 갈색이다.",
      },
      {
        x: 30,
        y: 30,
        w: 36,
        h: 36,
        text: "외부만 보고 가야했던 성당. 내부를 보려면 예약을 해야했는데 모르고 그냥 가버렸다. 엄마가 조금 아쉬워하셨다.",
      },
    ],
    info: {
      date: "2016.04.14",
      place: "스페인",
      desc: "사그라다<br>파밀리아",
    },
  },
];

const TITLE_LINES = [
  "엄마를",
  '<span class="title-highlight">사진</span>으로',
  "동결건조하기",
];

const LENS_SIZE = 260; // px, 디자인 해상도(1080x1920) 기준
const ZOOM = 2.2; // 확대 배율

// ---------------------------------------------------------------
// 2) DOM 빌드 + 인터랙션
// ---------------------------------------------------------------
export function mount(bodyEl) {
  bodyEl.innerHTML = `
    <div class="b1-wrap">
      <div class="b1-left">
        <div class="b1-title">
          ${TITLE_LINES.map((line) => `<div>${line}</div>`).join("")}
        </div>

        <div class="b1-stage">
          <div class="b1-photo-frame">
            <img class="b1-photo" src="${PHOTOS[0].src}" alt="" />
            <div class="b1-lens"></div>
          </div>
          <button class="b1-arrow b1-arrow-prev" type="button" aria-label="이전 사진">◀</button>
          <button class="b1-arrow b1-arrow-next" type="button" aria-label="다음 사진">▶</button>
        </div>

        <div class="b1-desc-wrap">
          <p class="b1-desc"></p>
        </div>
      </div>

      <div class="b1-right">
        <div class="b1-right-top"></div>
        <div class="b1-right-bottom">
          <div class="b1-info">
            <p class="b1-info-date">${PHOTOS[0].info.date}</p>
            <p class="b1-info-place">${PHOTOS[0].info.place}</p>
            <p class="b1-info-desc">${PHOTOS[0].info.desc}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const frame = bodyEl.querySelector(".b1-photo-frame");
  const photoImg = bodyEl.querySelector(".b1-photo");
  const lens = bodyEl.querySelector(".b1-lens");
  const descEl = bodyEl.querySelector(".b1-desc");
  const prevBtn = bodyEl.querySelector(".b1-arrow-prev");
  const nextBtn = bodyEl.querySelector(".b1-arrow-next");

  const infoDateEl = bodyEl.querySelector(".b1-info-date");
  const infoPlaceEl = bodyEl.querySelector(".b1-info-place");
  const infoDescEl = bodyEl.querySelector(".b1-info-desc");

  let index = 0;

  function currentPhoto() {
    return PHOTOS[index];
  }

  function setPhoto(newIndex) {
    index = (newIndex + PHOTOS.length) % PHOTOS.length;
    const photo = currentPhoto();

    photoImg.src = photo.src;
    descEl.textContent = photo.defaultText;
    lens.style.opacity = "0";

    infoDateEl.textContent = photo.info.date;
    infoPlaceEl.textContent = photo.info.place;
    infoDescEl.innerHTML = photo.info.desc; // <br> 등 태그가 실제 줄바꿈으로 표시되도록 innerHTML 사용
  }

  function onMove(e) {
    const rect = frame.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    const xPct = relX * 100;
    const yPct = relY * 100;

    const w = frame.offsetWidth;
    const h = frame.offsetHeight;
    const localX = relX * w;
    const localY = relY * h;

    const half = LENS_SIZE / 2;
    const lensLeft = Math.min(Math.max(localX - half, 0), w - LENS_SIZE);
    const lensTop = Math.min(Math.max(localY - half, 0), h - LENS_SIZE);

    lens.style.opacity = "1";
    lens.style.left = lensLeft + "px";
    lens.style.top = lensTop + "px";
    lens.style.backgroundImage = `url(${currentPhoto().src})`;
    lens.style.backgroundSize = `${w * ZOOM}px ${h * ZOOM}px`;
    lens.style.backgroundPosition = `${-(localX * ZOOM - half)}px ${-(localY * ZOOM - half)}px`;

    const hit = currentPhoto().regions.find(
      (r) =>
        xPct >= r.x && xPct <= r.x + r.w && yPct >= r.y && yPct <= r.y + r.h,
    );
    descEl.textContent = hit ? hit.text : currentPhoto().defaultText;
  }

  function onLeave() {
    lens.style.opacity = "0";
    descEl.textContent = currentPhoto().defaultText;
  }

  function onPrev() {
    setPhoto(index - 1);
  }
  function onNext() {
    setPhoto(index + 1);
  }

  frame.addEventListener("mousemove", onMove);
  frame.addEventListener("mouseleave", onLeave);
  prevBtn.addEventListener("click", onPrev);
  nextBtn.addEventListener("click", onNext);

  setPhoto(0);

  return function unmount() {
    frame.removeEventListener("mousemove", onMove);
    frame.removeEventListener("mouseleave", onLeave);
    prevBtn.removeEventListener("click", onPrev);
    nextBtn.removeEventListener("click", onNext);
  };
}
