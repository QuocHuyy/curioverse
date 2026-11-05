/** Tương tác cho Bản đồ sao: kéo, zoom, hover/chạm, lọc theo loại, tìm sao. */

type Meta = { title: string; kind: string; date: string; desc: string; url: string; stage: string; draft: boolean };
type Data = { adj: Record<string, string[]>; meta: Record<string, Meta> };

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export function initUniverse(root: HTMLElement) {
  const svg = root.querySelector<SVGSVGElement>('[data-u-svg]');
  const viewport = root.querySelector<SVGGElement>('[data-u-viewport]');
  const stage = root.querySelector<HTMLElement>('[data-u-stage]');
  const tooltip = root.querySelector<HTMLElement>('[data-u-tooltip]');
  const hint = root.querySelector<HTMLElement>('[data-u-hint]');
  const dataEl = root.querySelector<HTMLScriptElement>('[data-u-data]');
  if (!svg || !viewport || !stage || !tooltip || !dataEl) return;

  const data = JSON.parse(dataEl.textContent || '{}') as Data;
  const nodes = [...svg.querySelectorAll<SVGAElement>('.u-node')];
  const edges = [...svg.querySelectorAll<SVGLineElement>('.u-edge')];
  const byId = new Map(nodes.map((n) => [n.dataset.id!, n]));
  const vb = svg.viewBox.baseVal;

  // ---------- Biến đổi (pan/zoom) ----------
  let k = 1;
  let tx = 0;
  let ty = 0;
  const MIN = 0.6;
  const MAX = 5;

  const screenScale = () => {
    const r = svg.getBoundingClientRect();
    return Math.min(r.width / vb.width, r.height / vb.height) || 1;
  };
  const apply = () => {
    viewport.setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k.toFixed(4)})`);
    // giữ cỡ chữ nhãn gần như cố định trên màn hình
    svg.style.setProperty('--px', String(1 / (k * screenScale())));
    svg.classList.toggle('zoomed', k * screenScale() > 1.5);
  };
  const toSvg = (clientX: number, clientY: number) => {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const m = svg.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : pt;
  };
  const zoomAt = (factor: number, cx: number, cy: number) => {
    const nk = Math.min(MAX, Math.max(MIN, k * factor));
    tx = cx - (cx - tx) * (nk / k);
    ty = cy - (cy - ty) * (nk / k);
    k = nk;
    apply();
    hideTooltip();
  };
  const initialK = () => {
    const r = stage.getBoundingClientRect();
    const s = screenScale();
    return Math.min(1.8, Math.max(1, (r.height / (vb.height * s)) * 0.72));
  };
  const reset = () => {
    k = initialK();
    tx = (vb.width - vb.width * k) / 2;
    ty = (vb.height - vb.height * k) / 2;
    apply();
  };
  reset();
  new ResizeObserver(() => apply()).observe(stage);

  // ---------- Kéo & chụm ----------
  const pointers = new Map<number, { x: number; y: number }>();
  let moved = 0;
  let pinchDist = 0;
  let suppressClick = false;

  // Không cho trình duyệt kéo-thả link gốc (sẽ huỷ thao tác kéo bản đồ)
  svg.addEventListener('dragstart', (e) => e.preventDefault());
  svg.addEventListener('pointerdown', (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = 0;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  });
  svg.addEventListener('pointermove', (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    if (pointers.size === 1) {
      const p0 = toSvg(prev.x, prev.y);
      const p1 = toSvg(cur.x, cur.y);
      moved += Math.hypot(cur.x - prev.x, cur.y - prev.y);
      if (moved > 4) {
        if (!svg.classList.contains('dragging')) {
          svg.classList.add('dragging');
          try {
            svg.setPointerCapture(e.pointerId);
          } catch {}
          hideTooltip();
        }
        tx += p1.x - p0.x;
        ty += p1.y - p0.y;
        apply();
      }
    } else if (pointers.size === 2) {
      pointers.set(e.pointerId, cur);
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist > 0) {
        const mid = toSvg((a.x + b.x) / 2, (a.y + b.y) / 2);
        zoomAt(dist / pinchDist, mid.x, mid.y);
      }
      pinchDist = dist;
      moved = 99;
      return;
    }
    pointers.set(e.pointerId, cur);
  });
  const endPointer = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchDist = 0;
    if (!pointers.size) {
      if (moved > 4) suppressClick = true;
      svg.classList.remove('dragging');
    }
  };
  svg.addEventListener('pointerup', endPointer);
  svg.addEventListener('pointercancel', endPointer);

  // Ctrl/⌘ + cuộn (và pinch trên touchpad) để zoom; cuộn thường thì vẫn cuộn trang
  let hintTimer = 0;
  svg.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const p = toSvg(e.clientX, e.clientY);
        zoomAt(Math.exp(-e.deltaY * 0.0022), p.x, p.y);
      } else if (hint) {
        hint.classList.add('show');
        clearTimeout(hintTimer);
        hintTimer = window.setTimeout(() => hint.classList.remove('show'), 1400);
      }
    },
    { passive: false },
  );

  root.querySelectorAll<HTMLButtonElement>('[data-u-zoom]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const mode = btn.dataset.uZoom;
      if (mode === 'reset') return reset();
      zoomAt(mode === 'in' ? 1.35 : 1 / 1.35, vb.width / 2, vb.height / 2);
    }),
  );
  stage.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    if (e.key === '+' || e.key === '=') zoomAt(1.25, vb.width / 2, vb.height / 2);
    else if (e.key === '-' || e.key === '_') zoomAt(1 / 1.25, vb.width / 2, vb.height / 2);
    else if (e.key === '0') reset();
    else if (e.key === 'Escape') clearFocus();
  });

  // ---------- Làm sáng lân cận + thẻ thông tin ----------
  let active: string | null = null;
  let pinned = false;
  const title = tooltip.querySelector<HTMLElement>('.ut-title')!;
  const kind = tooltip.querySelector<HTMLElement>('.ut-kind')!;
  const desc = tooltip.querySelector<HTMLElement>('.ut-desc')!;
  const open = tooltip.querySelector<HTMLAnchorElement>('.ut-open')!;

  function hideTooltip() {
    if (!pinned) tooltip!.hidden = true;
  }
  function clearFocus() {
    active = null;
    pinned = false;
    tooltip!.hidden = true;
    tooltip!.classList.remove('pinned');
    svg!.classList.remove('has-focus');
    nodes.forEach((n) => n.classList.remove('is-near', 'is-active'));
    edges.forEach((e) => e.classList.remove('is-near'));
  }
  function focusNode(id: string, pin = false) {
    const node = byId.get(id);
    const m = data.meta[id];
    if (!node || !m) return;
    active = id;
    pinned = pin;
    const near = new Set([id, ...(data.adj[id] ?? [])]);
    svg!.classList.add('has-focus');
    nodes.forEach((n) => {
      n.classList.toggle('is-near', near.has(n.dataset.id!));
      n.classList.toggle('is-active', n.dataset.id === id);
    });
    edges.forEach((e) => e.classList.toggle('is-near', e.dataset.a === id || e.dataset.b === id));

    kind.textContent = [m.kind, m.stage, m.date].filter(Boolean).join(' · ');
    title.textContent = m.title;
    desc.textContent = m.desc;
    open.href = m.url;
    tooltip!.dataset.kind = node.dataset.kind;
    tooltip!.classList.toggle('pinned', pin);
    tooltip!.hidden = false;

    const core = node.querySelector('.u-core') ?? node;
    const nr = core.getBoundingClientRect();
    const sr = stage!.getBoundingClientRect();
    const tw = tooltip!.offsetWidth;
    const th = tooltip!.offsetHeight;
    let left = nr.left - sr.left + nr.width / 2 + 16;
    let top = nr.top - sr.top - th / 2;
    if (left + tw > sr.width - 12) left = nr.left - sr.left - tw - 16;
    left = Math.max(12, Math.min(left, sr.width - tw - 12));
    top = Math.max(12, Math.min(top, sr.height - th - 12));
    tooltip!.style.left = `${left}px`;
    tooltip!.style.top = `${top}px`;
  }

  nodes.forEach((node) => {
    const id = node.dataset.id!;
    node.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse' && !svg.classList.contains('dragging') && !pinned) focusNode(id);
    });
    node.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' && !pinned) clearFocus();
    });
    node.addEventListener('focus', () => focusNode(id));
    node.addEventListener('blur', () => {
      if (!pinned) clearFocus();
    });
    node.addEventListener('click', (e) => {
      if (suppressClick) {
        e.preventDefault();
        suppressClick = false;
        return;
      }
      // Trên màn hình cảm ứng: chạm lần đầu để xem, lần hai để mở
      const coarse = matchMedia('(pointer: coarse)').matches;
      if (coarse && !(pinned && active === id)) {
        e.preventDefault();
        focusNode(id, true);
      }
    });
  });
  svg.addEventListener('click', (e) => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    if (!(e.target as Element).closest('.u-node')) clearFocus();
  });

  // ---------- Lọc theo loại ----------
  root.querySelectorAll<HTMLInputElement>('[data-u-kind]').forEach((input) =>
    input.addEventListener('change', () => {
      svg.toggleAttribute(`data-hide-${input.dataset.uKind}`, !input.checked);
      clearFocus();
    }),
  );

  // ---------- Tìm sao ----------
  const search = root.querySelector<HTMLInputElement>('[data-u-search]');
  const matches = root.querySelector<HTMLElement>('.u-matches');
  search?.addEventListener('input', () => {
    const q = fold(search.value);
    clearFocus();
    svg.classList.toggle('searching', q.length > 0);
    let count = 0;
    nodes.forEach((n) => {
      const hit = q.length > 0 && (n.dataset.search ?? '').includes(q);
      n.classList.toggle('is-match', hit);
      if (hit) count++;
    });
    if (matches) matches.textContent = q ? `${count} ${matches.dataset.label ?? ''}`.trim() : '';
  });
  if (matches) matches.dataset.label = root.dataset.matchLabel ?? '';
}
