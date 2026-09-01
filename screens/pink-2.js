/*
  screens/pink-2.js
  "엄마를 질감으로 동결건조하기" 상세 화면

  구조:
    .p2-wrap
      .p2-top
        .p2-title      → 타이틀
        .p2-top-right  → 우측: 텍스트 없는 그라디언트 칸
      .p2-stage
        .p2-cards       → 클릭 가능한 4칸 (숫자 1~4, 구멍 패턴)
        .p2-thread-svg  → 방문한 칸들의 "연결 구멍"을 순서대로 잇는 실선
      .p2-view          → 칸을 클릭하면 뜨는 상세 뷰.
                          .p2-stage가 아니라 .p2-wrap의 직속 자식이라,
                          타이틀 영역(.p2-top)까지 포함한 전체 화면을 덮는다.
                          닫기는 별도 버튼 없이, 화면 공용 X 버튼(.detail-close)을
                          그대로 재사용한다 — 카드 뷰가 열려있을 때는 뷰만 닫고,
                          그리드 상태일 때는 main.js의 원래 동작(칸 전체 닫기)이
                          그대로 실행되도록 캡처 단계에서 분기한다.
        .p2-view-bottom
          .p2-view-bg-photo / .p2-view-bg-text  → 좌(사진)/우(텍스트) 배경 두 칸,
                                                   스크롤과 무관하게 항상 고정
          .p2-view-rows                          → 그 위에 겹쳐진 하나의 스크롤 레이어.
                                                   사진과 텍스트가 각 행(.p2-view-row) 안에서
                                                   항상 같은 높이에서 시작하도록
                                                   grid + align-items:start로 짝지어짐
                                                   (yellow.js의 질문/답변 레이아웃과 동일한 패턴)

  동작 방식:
    - 카드를 클릭하면 .p2-view가 열리고 해당 카드의 items(사진+텍스트 쌍)를
      순서대로 나열해서 보여준다.
    - 공용 X 버튼을 누르면(카드 뷰가 열려있는 동안): 뷰가 닫힌다. 직전에
      닫혔던 카드가 있으면, 그 카드와 지금 닫는 카드 사이에 실선을 하나
      새로 긋는다.
    - 실선의 "도착점"은 항상 그 카드의 아직 안 쓴 새 구멍을 하나 꺼내 쓴다
      (처음 실이 닿는 자리이므로).
    - 실선의 "출발점"은 그 카드에 마지막으로 실이 닿았던 구멍을 그대로
      재사용한다(실이 이미 그 구멍에 꽂혀 있는 것으로 취급). 그 카드가
      한 번도 실이 닿은 적 없다면(맨 처음 출발점인 경우) 새 구멍을 꺼내 쓴다.
    - 즉 한 카드를 여러 번 거쳐가도, "떠날 때"는 항상 마지막으로 닿았던
      바로 그 구멍에서 이어지고, "도착할 때"만 새 구멍이 소진된다.
    - 확정된 연결(어떤 카드의 몇 번째 구멍 ↔ 어떤 카드의 몇 번째 구멍)은
      connections 배열에 영구 저장되어, 다시 그릴 때도 항상 같은 자리에 그려진다.

  ※ CARDS 배열만 편집하면 숫자/구멍 배치/사진·텍스트 쌍이 전부 바뀝니다.
    각 카드의 items 배열에 { src, text } 쌍을 원하는 개수만큼 넣으면 됩니다.
*/

export const title = "";

const TITLE_LINES = [
  "엄마를",
  '<span class="title-highlight">질감</span>으로',
  "동결건조하기",
];

/*
  각 카드의 좌표계는 "카드 자기 자신 기준 0~100%"입니다.
  holes: 화면에 보일 흰 구멍들의 위치 배열. 0번(모서리)부터 순서대로 소진됩니다.

  모서리(corner) 기준으로 세로줄 + 가로줄이 만나는 L자 점 패턴을 만든다.
  cornerX / cornerY: 0 또는 100. 두 선이 만나는 모서리의 위치.
    - cornerX=100, cornerY=100 → 우하단 모서리에서 만남 (카드1 패턴)
    - cornerX=0,   cornerY=100 → 좌하단 모서리에서 만남 (카드2 패턴)
    - cornerX=100, cornerY=0   → 우상단 모서리에서 만남 (카드3 패턴)
    - cornerX=0,   cornerY=0   → 좌상단 모서리에서 만남 (카드4 패턴)
  vertCount / horizCount: 세로줄 점 개수 / 가로줄 점 개수

  카드가 정사각형이 아니라 세로로 긴 직사각형이기 때문에, 가로(X)와 세로(Y)의
  margin/gap을 따로 받는다. 같은 숫자를 쓰면 세로줄 점 간격이 가로줄보다
  훨씬 넓어 보이므로, insetY/gapY를 insetX/gapX보다 작게 잡아야
  실제 화면에서 두 줄의 점 간격이 비슷해 보인다.
*/
function makeLHoles({
  cornerX,
  cornerY,
  vertCount = 5,
  horizCount = 5,
  insetX = 14,
  insetY = 9,
  gapX = 17,
  gapY = 15,
}) {
  const vx = cornerX === 100 ? 100 - insetX : insetX;
  const vy = cornerY === 100 ? 100 - insetY : insetY;

  const holes = [{ x: vx, y: vy }]; // 0번: 모서리(가장 먼저 소진되는 구멍)

  for (let i = 1; i <= vertCount; i++) {
    const y = cornerY === 100 ? vy - i * gapY : vy + i * gapY;
    holes.push({ x: vx, y });
  }
  for (let i = 1; i < horizCount; i++) {
    const x = cornerX === 100 ? vx - i * gapX : vx + i * gapX;
    holes.push({ x, y: vy });
  }

  return { holes };
}

const CARDS = [
  {
    number: "1",
    items: [
      { src: "assets/자수/IMG_0289 복사.png", text: "첫 번째 텍스처 설명." },
      { src: "assets/pink2/photo1-2.jpg", text: "두 번째 텍스처 설명." },
      { src: "assets/pink2/photo1-3.jpg", text: "세 번째 텍스처 설명." },
    ],
    ...makeLHoles({ cornerX: 100, cornerY: 100 }), // 우하단(중앙 쪽) 모서리
  },
  {
    number: "2",
    items: [
      { src: "assets/pink2/photo2-1.jpg", text: "첫 번째 텍스처 설명." },
      { src: "assets/pink2/photo2-2.jpg", text: "두 번째 텍스처 설명." },
    ],
    ...makeLHoles({ cornerX: 0, cornerY: 100 }), // 좌하단(중앙 쪽) 모서리
  },
  {
    number: "3",
    items: [
      { src: "assets/pink2/photo3-1.jpg", text: "첫 번째 텍스처 설명." },
      { src: "assets/pink2/photo3-2.jpg", text: "두 번째 텍스처 설명." },
    ],
    ...makeLHoles({ cornerX: 100, cornerY: 0 }), // 우상단(중앙 쪽) 모서리
  },
  {
    number: "4",
    items: [
      { src: "assets/pink2/photo4-1.jpg", text: "첫 번째 텍스처 설명." },
      { src: "assets/pink2/photo4-2.jpg", text: "두 번째 텍스처 설명." },
    ],
    ...makeLHoles({ cornerX: 0, cornerY: 0 }), // 좌상단(중앙 쪽) 모서리
  },
];

// .p2-cards의 grid-template-columns/rows 비율과 반드시 일치해야 합니다.
// CSS를 "1.5fr 1fr"로 바꾸면 여기 COL_SPLIT도 60으로 같이 바꿔주세요.
const COL_SPLIT = 60; // 좌측 칸이 차지하는 가로 %  (1.5fr : 1fr → 60% : 40%)
const ROW_SPLIT = 40; // 상단 칸이 차지하는 세로 %  (1fr : 1.5fr → 40% : 60%)

// 2x2 배치: 인덱스 0=좌상, 1=우상, 2=좌하, 3=우하 (고정, 리사이즈 없음)
const GRID_POS = [
  { col: 0, row: 0 },
  { col: 1, row: 0 },
  { col: 0, row: 1 },
  { col: 1, row: 1 },
];

export function mount(bodyEl) {
  bodyEl.innerHTML = `
  <div class="p2-wrap">
    <div class="p2-top">
      <div class="p2-title">
        ${TITLE_LINES.map((line) => `<div>${line}</div>`).join("")}
      </div>
      <div class="p2-top-right"></div>
    </div>

    <div class="p2-stage">
      <div class="p2-cards">
        ${CARDS.map(
          (card, i) => `
          <button class="p2-card" type="button" data-card="${i}">
            <span class="p2-card-num">${card.number}</span>
            <span class="p2-dots">
              ${card.holes
                .map(
                  (h, hi) =>
                    `<span class="p2-dot" data-hole="${hi}" style="left:${h.x}%; top:${h.y}%;"></span>`,
                )
                .join("")}
            </span>
          </button>
        `,
        ).join("")}
      </div>

      <svg class="p2-thread-svg" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>
    </div>

    <div class="p2-view" hidden>
      <div class="p2-view-bottom">
        <div class="p2-view-bg p2-view-bg-photo"></div>
        <div class="p2-view-bg p2-view-bg-text"></div>
        <div class="p2-view-rows"></div>
      </div>
    </div>
  </div>
`;

  const svg = bodyEl.querySelector(".p2-thread-svg");
  const view = bodyEl.querySelector(".p2-view");
  const viewRows = bodyEl.querySelector(".p2-view-rows");
  const closeBtn = bodyEl
    .closest(".cell-detail")
    .querySelector(".detail-close");
  const cardEls = Array.from(bodyEl.querySelectorAll(".p2-card"));

  let activeIndex = null;
  let lastClosedCard = null; // 직전에 닫힌(방문 완료된) 카드 인덱스
  const holeUsage = CARDS.map(() => 0); // 카드별 "다음에 꺼낼 새 구멍 인덱스" (도착 시에만 사용)
  const currentHole = CARDS.map(() => null); // 카드별 "마지막으로 실이 닿은 구멍" (출발 시 재사용)
  const connections = []; // 확정된 연결선: { from, fromHole, to, toHole }

  // 카드 자기 자신 기준 %(hole)를 .p2-cards 전체 기준 %로 변환.
  // .p2-cards가 COL_SPLIT/ROW_SPLIT 비율로 나뉘어 있으므로 그 값을 그대로 참조한다.
  function pointPercent(cardIndex, holeIndex) {
    const pos = GRID_POS[cardIndex];
    const hole = CARDS[cardIndex].holes[holeIndex];

    const colStart = pos.col === 0 ? 0 : COL_SPLIT;
    const colWidth = pos.col === 0 ? COL_SPLIT : 100 - COL_SPLIT;

    const rowStart = pos.row === 0 ? 0 : ROW_SPLIT;
    const rowHeight = pos.row === 0 ? ROW_SPLIT : 100 - ROW_SPLIT;

    return {
      x: colStart + (hole.x / 100) * colWidth,
      y: rowStart + (hole.y / 100) * rowHeight,
    };
  }

  // 해당 카드에서 아직 안 쓴 다음 구멍의 인덱스를 반환하고 소진 처리한다.
  // 구멍을 전부 다 썼으면(안전장치) 마지막 구멍을 계속 재사용한다.
  function takeNextHole(cardIndex) {
    const card = CARDS[cardIndex];
    const idx = Math.min(holeUsage[cardIndex], card.holes.length - 1);
    holeUsage[cardIndex] = idx + 1;
    return idx;
  }

  function markHoleUsed(cardIndex, holeIndex) {
    const dot = cardEls[cardIndex].querySelector(
      `.p2-dot[data-hole="${holeIndex}"]`,
    );
    if (dot) dot.classList.add("is-linked");
  }

  function renderThreads() {
    svg.innerHTML = "";
    connections.forEach(({ from, fromHole, to, toHole }) => {
      const p1 = pointPercent(from, fromHole);
      const p2 = pointPercent(to, toHole);
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", p1.x);
      line.setAttribute("y1", p1.y);
      line.setAttribute("x2", p2.x);
      line.setAttribute("y2", p2.y);
      line.setAttribute("class", "p2-thread-line");
      svg.appendChild(line);
    });
  }

  function openCard(i) {
    activeIndex = i;
    const card = CARDS[i];
    viewRows.innerHTML = card.items
      .map(
        (item) => `
        <div class="p2-view-row">
          <div class="p2-view-photo">
            <img src="${item.src}" alt="" />
          </div>
          <p class="p2-view-text">${item.text}</p>
        </div>
      `,
      )
      .join("");
    view.hidden = false;
  }

  function closeCard() {
    if (activeIndex === null) return;
    const cardIdx = activeIndex;

    if (lastClosedCard !== null && lastClosedCard !== cardIdx) {
      // 출발점: 그 카드에 마지막으로 실이 닿았던 구멍을 재사용.
      // 아직 한 번도 실이 닿은 적 없는 카드라면(맨 처음 출발점) 새 구멍을 꺼내 씀.
      const fromHole =
        currentHole[lastClosedCard] !== null
          ? currentHole[lastClosedCard]
          : takeNextHole(lastClosedCard);

      // 도착점: 항상 새 구멍(새로운 바느질 자국)
      const toHole = takeNextHole(cardIdx);

      connections.push({
        from: lastClosedCard,
        fromHole,
        to: cardIdx,
        toHole,
      });

      // 이번에 실이 닿은 구멍을 각 카드의 "현재 위치"로 갱신
      currentHole[lastClosedCard] = fromHole;
      currentHole[cardIdx] = toHole;

      markHoleUsed(lastClosedCard, fromHole);
      markHoleUsed(cardIdx, toHole);
    }

    lastClosedCard = cardIdx;
    activeIndex = null;
    view.hidden = true;
    renderThreads();
  }

  // 공용 X 버튼(.detail-close) 클릭을 캡처 단계에서 가로챈다.
  // - 카드 뷰가 열려있으면: 이 클릭은 "뷰 닫기"로만 처리하고, main.js의
  //   원래 핸들러(칸 전체 닫기)가 실행되지 않도록 전파를 막는다.
  // - 카드 뷰가 열려있지 않으면(그리드 상태): 아무 것도 하지 않고 그대로
  //   흘려보내서, main.js의 기존 동작(칸 전체 닫기)이 정상 실행되게 한다.
  function onCloseClick(e) {
    if (!view.hidden) {
      e.stopImmediatePropagation();
      e.preventDefault();
      closeCard();
    }
  }

  cardEls.forEach((el, i) => {
    el.addEventListener("click", () => openCard(i));
  });
  closeBtn.addEventListener("click", onCloseClick, true);

  return function unmount() {
    cardEls.forEach((el, i) => {
      el.removeEventListener("click", () => openCard(i));
    });
    closeBtn.removeEventListener("click", onCloseClick, true);
  };
}
