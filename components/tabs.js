/*
  탭 컴포넌트 (재사용 가능)
  mountTabs(container, [{ label, content }, ...]) -> destroy()
  content 는 HTML 문자열 또는 DOM 노드 둘 다 허용.
*/
export function mountTabs(container, tabs){
  const wrap = document.createElement('div');
  wrap.className = 'tabs';

  const nav = document.createElement('div');
  nav.className = 'tabs-nav';
  nav.setAttribute('role', 'tablist');

  const panels = document.createElement('div');
  panels.className = 'tabs-panels';

  const buttons = [];
  const panelEls = [];
  const clickHandlers = [];

  tabs.forEach((tab, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tabs-btn';
    btn.textContent = tab.label;
    btn.setAttribute('role', 'tab');
    const onClick = () => activate(i);
    btn.addEventListener('click', onClick);
    clickHandlers.push([btn, onClick]);
    nav.appendChild(btn);
    buttons.push(btn);

    const panel = document.createElement('div');
    panel.className = 'tabs-panel';
    if (typeof tab.content === 'string') panel.innerHTML = tab.content;
    else if (tab.content instanceof Node) panel.appendChild(tab.content);
    panels.appendChild(panel);
    panelEls.push(panel);
  });

  function activate(i){
    buttons.forEach((b, idx) => b.classList.toggle('is-active', idx === i));
    panelEls.forEach((p, idx) => p.classList.toggle('is-active', idx === i));
  }
  activate(0);

  wrap.appendChild(nav);
  wrap.appendChild(panels);
  container.appendChild(wrap);

  return function destroy(){
    clickHandlers.forEach(([btn, fn]) => btn.removeEventListener('click', fn));
    wrap.remove();
  };
}
