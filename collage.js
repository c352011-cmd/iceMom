/*
  collage.js
  ---------------------------------------------------------------
  그리드(요약) 상태에서만 보이는 "이미지 콜라주" 연출을 담당한다.
  - 각 셀의 .collage 안에 있는 .collage-img / .collage-label 요소들을
    Matter.js 물리 엔진의 리지드바디로 만들어, 중력을 받아 아래로
    떨어져 바닥에 쌓이게 한다.
  - 마우스로 잡아서 끌 수도 있다(드래그).
  - 펼쳐진(is-active) 칸은 계산을 건너뛰어 자원을 아낀다.
  - 실제 이미지 로딩/레이아웃과는 무관하게, 항상 즉시 로드되는 가벼운
    장식 요소이므로 (지연 로딩되는 screens/*.js 와 달리) main.js에서 바로 import 한다.
*/

const { Engine, World, Bodies, Body, Mouse, MouseConstraint } = Matter;

const wrapperEl = document.getElementById("canvas-wrapper");
const DRAG_THRESHOLD = 6; // px, 이 이상 움직여야 "드래그"로 인정(클릭-확장과 구분)

function currentStageScale() {
  const m = /scale\(([^)]+)\)/.exec(wrapperEl.style.transform || "");
  return m ? parseFloat(m[1]) : 1;
}

function waitForImages(items) {
  return Promise.all(
    items.map((el) => {
      if (el.tagName !== "IMG" || el.complete) return Promise.resolve();
      return new Promise((resolve) => {
        el.addEventListener("load", resolve, { once: true });
        el.addEventListener("error", resolve, { once: true });
      });
    }),
  );
}

const instances = [];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/*
  collage 요소에 data-images="경로1, 경로2, ..." 가 있으면
  <img class="collage-img"> 들을 자동으로 만들어 넣는다.
  - 위치(top/left)는 칸 상단 쪽에 랜덤하게 배치 -> 중력으로 떨어져 쌓인다.
  - 크기는 랜덤이 아니라 이미지 원본 크기 그대로 사용한다(width를 지정하지 않음).
  - 회전(rotate)만 매번 랜덤.
  - data-label 이 있으면 .collage-label 도 함께 생성한다.
  - 이미 손으로 <img class="collage-img">를 넣어둔 칸은 data-images가 없으니 그대로 둔다.
*/
function buildCollageFromData(collage) {
  const list = collage.dataset.images;
  if (!list) return;

  list
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((entry) => {
      const [src, topStr, leftStr, rotateStr] = entry
        .split("|")
        .map((s) => s.trim());
      const img = document.createElement("img");
      img.className = "collage-img";
      img.src = src;
      img.alt = "";
      img.style.top =
        (topStr ? parseFloat(topStr) : randomBetween(4, 40)) + "%";
      img.style.left =
        (leftStr ? parseFloat(leftStr) : randomBetween(10, 60)) + "%";
      img.dataset.rotate =
        (rotateStr ? parseFloat(rotateStr) : randomBetween(-20, 20)).toFixed(
          1,
        ) + "deg";
      collage.appendChild(img);
    });

  if (collage.dataset.label) {
    const label = document.createElement("p");
    label.className = "collage-label";
    label.style.top = "6%";
    label.style.left = "6%";
    label.style.width = "60%";
    label.innerHTML = collage.dataset.label;
    collage.appendChild(label);
  }
}

const IMAGE_GAP = 3;

function mountGravity(cell) {
  const collage = cell.querySelector(".collage");
  if (!collage) return;
  buildCollageFromData(collage);
  const items = Array.from(
    collage.querySelectorAll(".collage-img, .collage-label"),
  );
  if (!items.length) return;

  waitForImages(items).then(() => {
    const width = collage.clientWidth;
    const height = collage.clientHeight;
    if (!width || !height) return;

    const engine = Engine.create();
    engine.gravity.y = 3; // 기본 중력(아래 방향). 숫자를 키우면 더 빨리 떨어진다.

    // ---- 바닥/좌/우/천장 벽: 이 안에서만 떨어지고 쌓인다 ----
    const t = 80; // 벽 두께
    const wallOpts = { isStatic: true, restitution: 0.2, friction: 0.7 };
    World.add(engine.world, [
      Bodies.rectangle(width / 2, height + t / 2, width + t * 2, t, wallOpts), // 바닥
      Bodies.rectangle(-t / 2, height / 2, t, height + t * 2, wallOpts), // 왼쪽 벽
      Bodies.rectangle(width + t / 2, height / 2, t, height + t * 2, wallOpts), // 오른쪽 벽
      Bodies.rectangle(width / 2, -t / 2, width + t * 2, t, wallOpts), // 천장(위로 튀는 것 방지)
    ]);

    // ---- 각 이미지/라벨을 리지드바디로 등록. 시작 위치 = 현재 top/left(%) ----
    const parts = items.map((el) => {
      const w = el.offsetWidth || 60;
      let h = el.offsetHeight;
      if (!h) {
        if (el.tagName === "IMG" && el.naturalWidth && el.naturalHeight) {
          h = w * (el.naturalHeight / el.naturalWidth);
        } else {
          h = w;
        }
        el.style.height = h + "px";
      }
      const leftPct = parseFloat(el.style.left) / 100 || 0;
      const topPct = parseFloat(el.style.top) / 100 || 0;
      const x = leftPct * width + w / 2;
      const y = topPct * height + h / 2;
      const initialAngle =
        ((parseFloat(el.dataset.rotate) || 0) * Math.PI) / 180;

      // 이제부터는 물리 엔진이 위치를 전담한다(top/left 대신 transform으로 이동).
      el.style.position = "absolute";
      el.style.left = "0px";
      el.style.top = "0px";
      el.style.margin = "0";
      el.style.transformOrigin = "center center";

      const body = Bodies.rectangle(x, y, w + IMAGE_GAP, h + IMAGE_GAP, {
        isStatic: true,
        restitution: 0.7, // 탄성(바닥에 닿았을 때 튀는 정도)
        friction: 0.6, // 서로 맞닿았을 때 미끄러짐 저항 -> 쌓임
        frictionAir: 0.1,
        angle: initialAngle,
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);
      World.add(engine.world, body);
      return { el, body, w, h };
    });

    // ---- 마우스로 잡아서 끌기 ----
    const mouse = Mouse.create(collage);
    Mouse.setScale(mouse, {
      x: 1 / currentStageScale(),
      y: 1 / currentStageScale(),
    });
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, damping: 0.15, render: { visible: false } },
    });
    World.add(engine.world, mouseConstraint);

    // 드래그 직후 클릭(확장)이 같이 발동하지 않도록 이동거리로 구분
    let dragStartPos = null;
    collage.addEventListener("mousedown", () => {
      dragStartPos = { x: mouse.position.x, y: mouse.position.y };
    });
    collage.addEventListener("mouseup", () => {
      if (dragStartPos) {
        const dx = mouse.position.x - dragStartPos.x;
        const dy = mouse.position.y - dragStartPos.y;
        if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
          cell.dataset.suppressNextClick = "1";
        }
      }
      dragStartPos = null;
    });

    cell.addEventListener("mouseenter", () => {
      cell.classList.add("is-collage-hover");
      parts.forEach(({ body }) => Body.setStatic(body, false)); // 처음 호버할 때 고정을 풀어준다
    });
    cell.addEventListener("mouseleave", () =>
      cell.classList.remove("is-collage-hover"),
    );

    instances.push({ cell, engine, mouse, parts });
  });
}

// 창 크기가 바뀌면(=캔버스 스케일이 바뀌면) 마우스 좌표 보정값도 갱신
window.addEventListener("resize", () => {
  const scale = currentStageScale();
  instances.forEach(({ mouse }) =>
    Mouse.setScale(mouse, { x: 1 / scale, y: 1 / scale }),
  );
});

// ---- 마우스 호버 시 근처 오브젝트를 살짝 밀어내는 효과("섞이는" 느낌) ----
const HOVER_RADIUS = 40; // px, 마우스로부터 이 거리 안이면 반응
const HOVER_STRENGTH = 0.5; // 밀어내는 힘의 세기 (키우면 더 세게 흩어짐)

// 렌더 루프: 펼쳐진(is-active) 칸은 계산을 건너뛰어 자원을 아낀다

// 렌더 루프: 펼쳐진(is-active) 칸은 계산을 건너뛰어 자원을 아낀다
let lastTime = performance.now();
function tick(now) {
  const delta = Math.min(now - lastTime, 33);
  lastTime = now;

  instances.forEach(({ cell, engine, mouse, parts }) => {
    if (cell.classList.contains("is-active")) return;

    // 클릭/드래그 없이 마우스만 올려도 근처 오브젝트가 반응하도록 힘을 가한다.
    if (cell.classList.contains("is-collage-hover")) {
      const mx = mouse.position.x;
      const my = mouse.position.y;
      parts.forEach(({ body }) => {
        const dx = body.position.x - mx;
        const dy = body.position.y - my;
        const dist = Math.hypot(dx, dy);
        if (dist < HOVER_RADIUS && dist > 1) {
          const strength =
            (1 - dist / HOVER_RADIUS) * HOVER_STRENGTH * body.mass; // ← * body.mass 추가
          Body.applyForce(body, body.position, {
            x: (dx / dist) * strength,
            y: (dy / dist) * strength,
          });
        }
      });
    }

    Engine.update(engine, delta);
    parts.forEach(({ el, body, w, h }) => {
      const x = body.position.x - w / 2;
      const y = body.position.y - h / 2;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${body.angle}rad)`;
    });
  });

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

document.querySelectorAll(".cell").forEach(mountGravity);
