/*
  screens/pink-1.js
  "엄마를 향으로 동결건조하기" 상세 화면

  구조:
    .p1-wrap
      .p1-title      → 최상단 타이틀
      .p1-stage        칸이 채워지는 영역 전체
        .p1-grid         2x2 칸. 각 칸은 채워지기 전엔 화면 밖(옆/아래)에 숨어있다가,
                         자기 차례가 되면 "밀려들어오는" 애니메이션과 함께 나타난다.
        .p1-info         "디퓨저를 클릭해 보세요" 안내 문구. 첫 클릭 전까지만 보임.
        .p1-diffusers    → .p1-stage 하단에 겹쳐 뜨는, 클릭 가능한 디퓨저 3개

  동작 방식:
    - 디퓨저 버튼을 클릭할 때마다, 정해진 순서
      (좌상단 → 좌하단 → 우상단 → 우하단)대로 다음 칸에 그 디퓨저의
      색상/정보가 레이어로 덮어씌워지며 들어온다.
    - 4칸이 모두 채워진 뒤에도 클릭은 계속되며, 다시 좌상단부터
      순서대로 무한 반복하며 새 레이어로 덮는다.
    - 각 디퓨저(1/2/3)는 칸 위치(tl/bl/tr/br)마다 고정된 그라디언트를 갖는다
      (diffuser.colors[pos]). 즉 어떤 디퓨저가 좌상단에 배정되든, 좌상단은
      항상 그 디퓨저의 "좌상단용" 색으로 채워진다 — 색은 위치가 결정한다.
    - 정보(infos)는 디퓨저마다 4개씩 갖고 있다. 같은 디퓨저를 여러 번
      눌러도 매번 다음 정보로 순서대로 넘어가며(1번째 클릭→infos[0],
      2번째 클릭→infos[1], ...), 4개를 다 쓰면 다시 처음(infos[0])부터
      순환한다. 즉 정보는 "그 디퓨저를 몇 번째로 눌렀는지"에 따라
      달라지고, 색상은 "어느 칸에 배정되는지"에 따라 달라진다 — 서로 다른
      기준으로 결정된다.

  ※ DIFFUSERS 배열만 편집하면 이미지 경로/색상/정보 텍스트가 전부 바뀝니다.
*/

export const title = "";

const TITLE_LINES = [
  "엄마를",
  '<span class="title-highlight">향</span>으로',
  "동결건조하기",
];

// 디퓨저 3개의 데이터. image는 실제 업로드하신 버튼 그래픽 경로로 교체하세요.
// colors는 칸 위치(tl/bl/tr/br)별로 고정된 배경 그라디언트입니다.
// infos는 디퓨저 하나당 4개(칸 개수만큼) — 클릭 순서대로 하나씩 사용됩니다.
const DIFFUSERS = [
  {
    id: 1,
    image: "assets/shapes/untitled folder/Group 134.svg",
    textColor: "#fff",
    colors: {
      tl: "linear-gradient(350deg, #FF00BF -62.9%, #000 100%)",
      bl: "linear-gradient(180deg, #FF16C5 0%, #000 100%)",
      tr: "linear-gradient(180deg, #FF16C5 -47.38%, #000 100%)",
      br: "linear-gradient(180deg, #FF16C5 -34.85%, #000 100%)",
    },
    infos: [
      {
        heading: "아카시아 향",
        body: "엄마가 가장 좋아하는 향. 5월 즈음이 되면 엄마는 산책할 때 항상 아카시아 꽃을 찾고, 나에게 향을 맡게 하셨다. 혼자 길거리를 돌아다닐 때도, 아카시아 꽃 향이 나면 엄마가 떠오르곤 한다.",
      },
      {
        heading:
          "<a href=https://smartstore.naver.com/ahro/products/7446318349?nl-query=%EC%95%84%EC%B9%B4%EC%8B%9C%EC%95%84%20%ED%96%A5%EC%88%98&nl-ts-pid=jowfLlqpvCwssBulFGl-171738&NaPm=ci%3DjowfLlqpvCwssBulFGl-171738%7Cct%3Dmt71t432%7Ctr%3Dnsls%7Csn%3D709669%7Chk%3Deebd44a557414e7cd43cb1a90a329db51f1dfa5f>lying acacia</a>",
        body: "낮잠 잘 때 은은하게 퍼지던 향.",
      },
      { heading: "라벤더 - 저녁", body: "저녁 식사 후 거실에 퍼지던 향." },
      { heading: "라벤더 - 밤", body: "잠들기 전 침실에 두었던 향." },
    ],
  },
  {
    id: 2,
    image: "assets/shapes/untitled folder/Group 135.svg",
    textColor: "#000",
    colors: {
      tl: "linear-gradient(329deg, #FF5ED7 -8.18%, #FFF 100%)",
      bl: "linear-gradient(180deg, #FFC5F0 0%, #FFF 100%)",
      tr: "linear-gradient(180deg, #FFC7F1 0%, #FFF 100%)",
      br: "linear-gradient(180deg, #FFDDF7 0%, #FFF 100%)",
    },
    infos: [
      { heading: "라벤더 향", body: "" },
      { heading: "우디 - 2", body: "..." },
      { heading: "우디 - 3", body: "..." },
      { heading: "우디 - 4", body: "..." },
    ],
  },
  {
    id: 3,
    image: "assets/shapes/untitled folder/Group 136.svg",
    textColor: "#000",
    colors: {
      tl: "linear-gradient(329deg, rgba(255, 255, 255) -8.18%, #FF00BF 100%)",
      bl: "linear-gradient(180deg, #FFF 0%, #FF16C5 100%)-8.18%",
      tr: "linear-gradient(180deg, #FF16C5 0%, #FFF 100%)",
      br: "linear-gradient(180deg, #FF16C5 0%, #FFF 100%)",
    },
    infos: [
      { heading: "프리지아 향", body: "..." },
      { heading: "머스크 - 2", body: "..." },
      { heading: "머스크 - 3", body: "..." },
      { heading: "머스크 - 4", body: "..." },
    ],
  },
];

// 칸이 채워지는 순서: 좌상단 → 좌하단 → 우상단 → 우하단
const FILL_ORDER = ["tl", "bl", "tr", "br"];

export function mount(bodyEl) {
  bodyEl.innerHTML = `
    <div class="p1-wrap">
      <div class="p1-title">
        ${TITLE_LINES.map((line) => `<div>${line}</div>`).join("")}
      </div>

      <div class="p1-stage">
        <div class="p1-grid">
          ${FILL_ORDER.map(
            (pos) => `<div class="p1-cell" data-pos="${pos}"></div>`,
          ).join("")}
        </div>

        <div class="p1-info">
          <p>디퓨저를<br />클릭해 보세요</p>
        </div>

        <div class="p1-diffusers">
          ${DIFFUSERS.map(
            (d) => `
            <button class="p1-diffuser-btn" type="button" data-id="${d.id}">
              <img src="${d.image}" alt="디퓨저 ${d.id}" />
            </button>
          `,
          ).join("")}
        </div>
      </div>
    </div>
  `;

  const stage = bodyEl.querySelector(".p1-stage");
  const infoEl = bodyEl.querySelector(".p1-info"); // 안내 문구 DOM 요소
  const diffuserBtns = Array.from(bodyEl.querySelectorAll(".p1-diffuser-btn"));

  const cellsByPos = {};
  const currentLayerByPos = {}; // 각 칸에서 "지금 맨 위에 있는" 레이어를 기억
  FILL_ORDER.forEach((pos) => {
    cellsByPos[pos] = stage.querySelector(`.p1-cell[data-pos="${pos}"]`);
    currentLayerByPos[pos] = null;
  });

  let clickCount = 0;
  const infoUsageByDiffuser = {}; // 디퓨저별로 "다음에 쓸 정보 인덱스"
  DIFFUSERS.forEach((d) => {
    infoUsageByDiffuser[d.id] = 0;
  });

  // 칸 위에 새 레이어를 하나 만들어, 화면 밖에서 슬라이드해 들어와
  // 기존 레이어를 덮어씌운다. 다 들어온 뒤 기존 레이어는 제거한다.
  function assignNext(diffuser) {
    const pos = FILL_ORDER[clickCount % FILL_ORDER.length];
    const cell = cellsByPos[pos];
    const oldLayer = currentLayerByPos[pos];

    // 색상: 칸 위치(pos)가 결정 — 어떤 디퓨저든 그 디퓨저의 "이 위치용" 색을 사용
    const diffuserColor = diffuser.colors[pos];

    // 정보: 이 디퓨저를 몇 번째로 클릭했는지가 결정. 4개를 다 쓰면 다시 처음부터 순환.
    const infoIndex = infoUsageByDiffuser[diffuser.id] % diffuser.infos.length;
    const diffuserInfo = diffuser.infos[infoIndex];
    infoUsageByDiffuser[diffuser.id]++;

    const newLayer = document.createElement("div");
    newLayer.className = `p1-layer p1-layer-${pos}`; // pos별 시작 방향은 CSS에서 처리
    newLayer.style.background = diffuserColor;
    newLayer.style.color = diffuser.textColor;
    newLayer.innerHTML = `
      <div class="p1-layer-inner">
        <p class="p1-cell-heading">${diffuserInfo.heading}</p>
        <p class="p1-cell-body">${diffuserInfo.body}</p>
      </div>
    `;
    cell.appendChild(newLayer); // 뒤에 추가되므로 DOM 순서상 기존 레이어보다 위에 그려짐

    void newLayer.offsetWidth; // 강제 리플로우: 초기(화면 밖) 상태를 확실히 그리게 함
    requestAnimationFrame(() => newLayer.classList.add("is-active"));

    function onIn(e) {
      if (e.propertyName !== "transform") return;
      newLayer.removeEventListener("transitionend", onIn);
      if (oldLayer) oldLayer.remove(); // 완전히 덮인 뒤 기존 레이어 제거
    }
    newLayer.addEventListener("transitionend", onIn);

    currentLayerByPos[pos] = newLayer;

    clickCount++;
    if (clickCount === 1) {
      infoEl.classList.add("is-hidden"); // 첫 클릭 이후로는 안내 문구를 숨김
    }
  }

  function onDiffuserClick(e) {
    const id = Number(e.currentTarget.dataset.id);
    const diffuser = DIFFUSERS.find((d) => d.id === id);
    if (diffuser) assignNext(diffuser);
  }

  diffuserBtns.forEach((btn) => btn.addEventListener("click", onDiffuserClick));

  return function unmount() {
    diffuserBtns.forEach((btn) =>
      btn.removeEventListener("click", onDiffuserClick),
    );
  };
}
