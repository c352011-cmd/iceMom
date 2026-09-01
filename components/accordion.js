/*
  아코디언 컴포넌트 (재사용 가능)
  mountAccordion(container, [{ heading, body }, ...], { multiple: false }) -> destroy()
*/
export function mountAccordion(container, items, options = {}){
  const multiple = !!options.multiple;
  const wrap = document.createElement('div');
  wrap.className = 'accordion';

  const cleanups = [];

  const itemEls = items.map((item) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'accordion-item';

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'accordion-header';
    header.textContent = item.heading;

    const body = document.createElement('div');
    body.className = 'accordion-body';
    const bodyInner = document.createElement('div');
    bodyInner.className = 'accordion-body-inner';
    if (typeof item.body === 'string') bodyInner.innerHTML = item.body;
    else if (item.body instanceof Node) bodyInner.appendChild(item.body);
    body.appendChild(bodyInner);

    const onClick = () => {
      const willOpen = !itemEl.classList.contains('is-open');
      if (!multiple){
        itemEls.forEach((el) => el !== itemEl && el.classList.remove('is-open'));
      }
      itemEl.classList.toggle('is-open', willOpen);
    };
    header.addEventListener('click', onClick);
    cleanups.push(() => header.removeEventListener('click', onClick));

    itemEl.appendChild(header);
    itemEl.appendChild(body);
    wrap.appendChild(itemEl);
    return itemEl;
  });

  if (itemEls[0]) itemEls[0].classList.add('is-open');

  container.appendChild(wrap);

  return function destroy(){
    cleanups.forEach((fn) => fn());
    wrap.remove();
  };
}
