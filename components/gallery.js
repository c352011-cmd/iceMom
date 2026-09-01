/*
  이미지 갤러리 컴포넌트 (재사용 가능)
  mountGallery(container, [{ src, alt } 또는 { color, alt }, ...]) -> destroy()
  실제 이미지가 없을 때는 color 로 자리표시(placeholder) 스와치를 보여준다.
  src 를 넘기면 실제 <img> 로 렌더링된다.
*/
export function mountGallery(container, slides){
  const wrap = document.createElement('div');
  wrap.className = 'gallery';

  const viewport = document.createElement('div');
  viewport.className = 'gallery-viewport';

  const slideEls = slides.map((slide, i) => {
    const el = document.createElement('div');
    el.className = 'gallery-slide';
    if (slide.src){
      const img = document.createElement('img');
      img.src = slide.src;
      img.alt = slide.alt || '';
      el.appendChild(img);
    } else {
      el.style.background = slide.color || '#ddd';
      el.textContent = slide.alt || `이미지 ${i + 1}`;
    }
    viewport.appendChild(el);
    return el;
  });

  const controls = document.createElement('div');
  controls.className = 'gallery-controls';

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'gallery-btn';
  prevBtn.textContent = '‹';
  prevBtn.setAttribute('aria-label', '이전 이미지');

  const dots = document.createElement('div');
  dots.className = 'gallery-dots';
  const dotEls = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'gallery-dot';
    dot.setAttribute('aria-label', `${i + 1}번째 이미지로 이동`);
    dots.appendChild(dot);
    return dot;
  });

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'gallery-btn';
  nextBtn.textContent = '›';
  nextBtn.setAttribute('aria-label', '다음 이미지');

  controls.appendChild(prevBtn);
  controls.appendChild(dots);
  controls.appendChild(nextBtn);

  wrap.appendChild(viewport);
  wrap.appendChild(controls);
  container.appendChild(wrap);

  let index = 0;
  function render(){
    slideEls.forEach((el, i) => el.classList.toggle('is-active', i === index));
    dotEls.forEach((el, i) => el.classList.toggle('is-active', i === index));
  }
  function go(delta){
    index = (index + delta + slides.length) % slides.length;
    render();
  }

  const onPrev = () => go(-1);
  const onNext = () => go(1);
  prevBtn.addEventListener('click', onPrev);
  nextBtn.addEventListener('click', onNext);

  const dotHandlers = dotEls.map((dot, i) => {
    const fn = () => { index = i; render(); };
    dot.addEventListener('click', fn);
    return [dot, fn];
  });

  const onKeydown = (e) => {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  };
  wrap.tabIndex = 0;
  wrap.addEventListener('keydown', onKeydown);

  render();

  return function destroy(){
    prevBtn.removeEventListener('click', onPrev);
    nextBtn.removeEventListener('click', onNext);
    dotHandlers.forEach(([dot, fn]) => dot.removeEventListener('click', fn));
    wrap.removeEventListener('keydown', onKeydown);
    wrap.remove();
  };
}
