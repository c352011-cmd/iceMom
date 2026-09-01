/*
  screens/green.js
  "엄마를 글로 동결건조하기" 상세 화면

  구조:
    .g-wrap
      .g-top
        .g-title      → 타이틀 (TITLE_LINES 배열만 고치면 됨)
        .g-top-right  → 우측: 텍스트 없는 색상 칸
      .g-cards   → 2x2 카드 그리드
        .g-card × 4 (CARDS 배열 순서대로 채워짐)
          .g-card-dot     → 검은 점 표시
          .g-card-scroll  → 칸별로 독립 스크롤되는 본문
        .g-divider-x/-y/-xy → 드래그로 칸 크기 조절하는 핸들
      .g-tooltip → 텍스트 안의 .g-annot(주석 대상)에 마우스를 올리면
                   커서 옆에 뜨는 정보 박스

  ※ TITLE_LINES / CARDS 두 군데만 고치면 텍스트가 전부 바뀝니다.
    CARDS의 text 안에 <span class="g-annot" data-note="...">...</span>로
    감싼 부분에 마우스를 올리면 data-note 내용이 커서 옆에 표시됩니다.
*/

export const title = "";

const TITLE_LINES = [
  "엄마를",
  '<span class="title-highlight">글</span>로',
  "동결건조하기",
];

// 2x2 그리드 순서: [좌상, 우상, 좌하, 우하]. 항상 4개를 유지하세요.
const CARDS = [
  {
    text: '엄마의 신체는 <span class="g-annot" data-note="엄마는 오랫동안 사무직 일을 하셨다. 그러던 중 딸들의 입학, 엄마의 엄마의 병으로 사무실을 떠나 작은 옷가게를 운영했다.">세월의 무게를</span> 직관적으로 보여준다. 키는 150cm 초반으로 아담한 편에 속하며, 서 있거나 걸어갈 때의 체형은 수직으로 바르게 솟아있기보다는 세월의 가해진 무게를 받아들여 <span class="g-annot" data-note="튼튼한 엄마의 몸은 날이 갈수록 굽어보였다. 그러면서도 집에 오면 집안일을 미루지 않는 엄마는 아마 체력이 매우 좋은 것 같다.">약간 앞으로 기울어진 완만한 곡선</span>을 이룬다. 오랫동안 가족의 끼니를 차리고, 바닥을 쓸고 닦으며, 작은 물건들을 집어 올리던 신체적 행위들이 수십 년간 반복된 결과다. <span class="g-annot" data-note="엄마의 어깨에는 항상 파스가 가득 붙어있었다. 발과 다리는 늘 피로해 저렴한 마사지 기기를 달고 살았다.">어깨 선은 단단함과 다정함이 동시에 느껴지는 둥근 형태를 띠고 있으며</span>, 목선 아래로 이어지는 등 줄기는 시간의 궤적을 묵묵히 받아들인 사람 특유의 세월감이 느껴진다. 피부를 관찰해 보면 지나온 시간의 흔적들이 정갈하게 배열되어 있는데, 피부 표면은 얇고 다소 건조한 편이며, 손등과 팔목 부위에는 표피 아래로 푸르스름한 정맥 선들이 얇은 나뭇가지처럼 도드라져 보인다. 집안일을 도맡아 온 손마디는 마디마디가 약간 굵어져 있다. 매일 일정한 길이와 두께로 다듬어져 엄마의 성격처럼 매우 깔끔한 모습이다. ',
  },
  {
    text: '엄마의 성격적 특성은 커다란 목소리나 과장된 수식어 대신, 무던함과 정적이라는 감정의 절제 속에서 드러난다. 기쁘거나 반가운 일이 생겨도 감정을 크게 터뜨리기보다는 그저 “잘됐다”, “다행이네” 같은 <span class="g-annot" data-note="엄마가 입버릇처럼 하는 말 중 하나는 그럴 수 있지-였다. 가끔 이해가 안되는 딸들을 이해하기 귀찮아서인지, 정말 깊은 이해심에서 우러나오는 말인지 알 수 없지만, 실용적인 엄마의 성격을 정확하게 보여주는 말이다.">나지막한 한두 마디로 마음을 표현하곤 한다</span>. 슬프거나 낙담스러운 순간을 맞이할 때도 다변으로 불만을 토로하기보다는, 조용히 입을 다물고 창밖을 바라보거나 <span class="g-annot" data-note="엄마는 유독 집안 청소를 자주했다. 아마 쉴새없이 떠드는 우리에게서 안전하게 혼자만의 시간을 가질 수 있는 방법을 찾았을 것이다."> 집안 청소를 시작하는 방식으로 </span> 속 안의 감정을 지그시 눌러 담는 편이다. 언어로 자신을 과시하거나 감정을 비대하게 부풀리는 일에 극도로 서툰 사람이기도 하다. 타인과의 관계에서도 남에게 신세를 지거나 불편을 주는 것을 유독 견디지 못하며, 어떤 상황에서도 자기 몫의 일은 스스로 마쳐야 마음을 놓는다. 정직하고 정갈하게 자기 자리를 지키는 일에서 오는 깊은 안도감을 사람들에게 선사하는 인물이다. 시간이 지나 돌아보면 언제나 <span class="g-annot" data-note="가끔 전화를 해서 너무 힘들다고 얘기하면 엄마는 항상 아무렇지 않게 하지말라고 말한다. 너가 힘들면 언제든 그만하라는 시원한 말은 오히려 나를 더 힘나게 하고 멈추지 않게 한다. 가끔 그 말을 듣기 위해 전화를 걸 때도 있다는걸 엄마도 알까.">그 자리에서 비바람을 막아주고 있던 가장 단단한 기둥이었음을 깨닫게 된다.</span>',
  },
  {
    text: '집 안을 둘러보면 어느 한 곳도 그냥 방치된 공간이 없다. <span class="g-annot" data-note="엄마는 건축학과를 가고싶어했다. 인테리어에 관심이 많았지만 넉넉하지 않은 집안 사정때문에 꿈을 포기해야했다. 엄마는 펼치지 못한 엄마의 미술적 재능을 딸들이 물려받았다고 좋아하신다." > 모든 구석구석에는 부지런한 손길이 깊게 닿아 있다. </span> 매일 아침 일찍 일을 하러 나가는 바쁜 일상 속에서도, 주방과 거실은 물론 잘 보이지 않는 작은 방의 모퉁이까지 빠짐없이 정돈되어있다. 완벽하게 구역이 나누어진 찬장 안에는 각기다른 식기와 음식들이 질서를 유지한다. 밥그릇과 국그릇이 따로 노는 나의 자취방과는 다르게 식기들은 짝을 이룬다. 안방 한구석의 작은 화장대에는 화려한 화장품 대신 소박한 로션 한 병과 세월이 오래된 빗이 흐트러짐 없이 놓여있다. 비좁은 서랍 안쪽조차 자식들이 어릴 적 어설프게 적어 준 어버이날 편지와 빛바랜 앨범들이 자리를 지킨다. 매일 아침 출퇴근길을 함께하는 차 안은 내가 지난 여행에서 돌아오며 선물해 준 키링들이 주렁주렁 걸려있다. 가족과 본인을 싣고 나르던 차 안은 세월의 흔적을 담아 반질반질하고 차를 탄 내가 빠뜨리고 내린 카드나 종이조각들을 그대로 싣고 달린다.',
  },
  {
    text: '엄마는 어릴 적 밤이 되면 쉽게 잠들지 못하고 머뭇거리던 나를 위해, 엄마는 <span class="g-annot" data-note="밤 10시까지 일을 하고 들어와 침대로 다시 출근하는 엄마의 삶은 꽤나 고단했을 것 같다. 그래도 언제든 화내거나 귀찮은 기색없이 잠을 잘 수 있도록 이야기를 해줬다. 과자나라 이야기 해줘!">침대 머리맡에 앉아 작은 목소리로 이야기를 들려주곤 했다 </span>. 책에 적힌 평범한 동화가 아니었다. 초콜릿으로 만든 길을 걸어가고, 알록달록한 사탕 나무 아래서 바삭한 쿠키 집을 만나는 소박하고 달콤한 이야기였다. 고된 노동으로 눈꺼풀이 무겁게 내려앉았을 텐데도, 엄마는 나지막하고 부드러운 음성으로 그 풍경을 정성스레 그려냈다. 내가 서서히 잠에 빠져들 때까지, 엄마의 <span class="g-annot" data-note="과자나라에는 말랑말랑한 솜사탕 구름이 길게 이어져있어, 발을 내딛을 때마다 포근하게 폭폭 파이지. 길 양 옆으로는 알록달록한 사탕 나무들이 서 있고, 솜사탕 길을 따라 조금 더 걸어가면 진한 초콜릿 강이 나와. 그 강 위에는 노릇노릇하게 구워진 기다란 웨하스 배가 동동 떠 있단다. 배에 올라타 노를 저어가다 보면, 강가 한 구석에 알록달록한 제리 지붕을 얹은 바삭한 쿠키 집들이 모여 있는 작은 마을이 보여.">과자나라 이야기</span>는 어두운 방 안을 가득 채우며 밤의 무서움을 순식간에 달콤한 안도감으로 바꾸어 놓았다.어른이 되어 돌아본 그 풍경은 커다랗게 다가온다. 피곤에 지친 하루의 끝에서도 이야기를 지어내며 안심시켜 주려 했던 그 다정한 노력. 엄격한 규칙으로 삶의 틀을 잡아주면서도, 밤이 오면 부드러운 상상의 세계를 내어주던 그 세심함이야말로 나를 불안함 없이 자라게 한 진짜 힘이었다. 과자나라 이야기를 들려주던 엄마의 낮고 온화한 목소리는, 지금도 내 기억 속에서 가장 포근한 밤의 소리로 남아있다.',
  },
];

// 초기 분할 비율(%). x = 좌/우 폭, y = 상/하 높이
const DEFAULT_SPLIT = { x: 68, y: 70 };
// 너무 한쪽으로 몰려서 칸이 사라지는 걸 막는 한계값
const MIN_PCT = 15;
const MAX_PCT = 85;

// 커서 옆에 뜨는 툴팁의 오프셋(px, 디자인 해상도 1080x1920 기준)
const TOOLTIP_OFFSET_X = 18;
const TOOLTIP_OFFSET_Y = 12;

export function mount(bodyEl) {
  bodyEl.innerHTML = `
    <div class="g-wrap">
      <div class="g-top">
        <div class="g-title">
          ${TITLE_LINES.map((line) => `<div>${line}</div>`).join("")}
        </div>
        <div class="g-top-right"></div>
      </div>

      <div class="g-cards">
        ${CARDS.map(
          (card, i) => `
          <div class="g-card" data-card="${i}">
            <div class="g-card-dot"></div>
            <div class="g-card-scroll">
              <p class="g-card-text">${card.text}</p>
            </div>
          </div>
        `,
        ).join("")}
        <div class="g-divider g-divider-x" data-axis="x"></div>
        <div class="g-divider g-divider-y" data-axis="y"></div>
        <div class="g-divider g-divider-xy" data-axis="xy"></div>
      </div>

      <div class="g-tooltip" hidden></div>
    </div>
  `;

  const wrapEl = bodyEl.querySelector(".g-wrap");
  const cardsEl = bodyEl.querySelector(".g-cards");
  const tooltip = bodyEl.querySelector(".g-tooltip");
  const dividerX = bodyEl.querySelector(".g-divider-x");
  const dividerY = bodyEl.querySelector(".g-divider-y");
  const dividerXY = bodyEl.querySelector(".g-divider-xy");
  const annotEls = Array.from(bodyEl.querySelectorAll(".g-annot"));

  // ---- 칸 크기 조절 ----
  const split = { ...DEFAULT_SPLIT };

  function applySplit() {
    cardsEl.style.setProperty("--g-col", split.x + "%");
    cardsEl.style.setProperty("--g-row", split.y + "%");
    dividerX.style.left = split.x + "%";
    dividerY.style.top = split.y + "%";
    dividerXY.style.left = split.x + "%";
    dividerXY.style.top = split.y + "%";
  }
  applySplit();

  let dragAxis = null; // "x" | "y" | "xy" | null

  function onDown(axis) {
    return (e) => {
      e.preventDefault();
      dragAxis = axis;
      document.body.style.cursor =
        axis === "x" ? "col-resize" : axis === "y" ? "row-resize" : "move";
    };
  }

  // getBoundingClientRect는 부모의 scale()이 반영된 화면상 실제 크기를 주므로,
  // 그 비율(%)은 확대/축소 배율과 무관하게 항상 정확하다.
  function onMove(e) {
    if (!dragAxis) return;
    const rect = cardsEl.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    const relY = ((e.clientY - rect.top) / rect.height) * 100;

    if (dragAxis === "x" || dragAxis === "xy") {
      split.x = Math.min(Math.max(relX, MIN_PCT), MAX_PCT);
    }
    if (dragAxis === "y" || dragAxis === "xy") {
      split.y = Math.min(Math.max(relY, MIN_PCT), MAX_PCT);
    }
    applySplit();
  }

  function onUp() {
    dragAxis = null;
    document.body.style.cursor = "";
  }

  dividerX.addEventListener("mousedown", onDown("x"));
  dividerY.addEventListener("mousedown", onDown("y"));
  dividerXY.addEventListener("mousedown", onDown("xy"));
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);

  // ---- 텍스트 주석 툴팁 ----
  let activeAnnot = null;

  function positionTooltip(clientX, clientY) {
    // wrapEl 기준 좌표로 변환 — getBoundingClientRect는 부모의 transform: scale()이
    // 반영된 화면상 실제 크기를 주므로, 이 비율은 배율과 무관하게 항상 정확하다.
    const rect = wrapEl.getBoundingClientRect();
    const scale = rect.width / wrapEl.offsetWidth; // 현재 화면 배율
    const localX = (clientX - rect.left) / scale;
    const localY = (clientY - rect.top) / scale;

    tooltip.style.left = localX + TOOLTIP_OFFSET_X + "px";
    tooltip.style.top = localY + TOOLTIP_OFFSET_Y + "px";
  }

  function onAnnotEnter(e) {
    activeAnnot = e.currentTarget;
    tooltip.textContent = activeAnnot.dataset.note || "";
    tooltip.hidden = false;
  }

  function onAnnotLeave() {
    activeAnnot = null;
    tooltip.hidden = true;
  }

  function onWrapMouseMove(e) {
    if (!activeAnnot) return;
    positionTooltip(e.clientX, e.clientY);
  }

  annotEls.forEach((el) => {
    el.addEventListener("mouseenter", onAnnotEnter);
    el.addEventListener("mouseleave", onAnnotLeave);
  });
  wrapEl.addEventListener("mousemove", onWrapMouseMove);

  return function unmount() {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
    annotEls.forEach((el) => {
      el.removeEventListener("mouseenter", onAnnotEnter);
      el.removeEventListener("mouseleave", onAnnotLeave);
    });
    wrapEl.removeEventListener("mousemove", onWrapMouseMove);
  };
}
