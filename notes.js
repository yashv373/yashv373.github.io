/* Notes page: navigation, search, pane toggles and the graph. */
(function () {
  var app = document.getElementById('nt-app'), side = document.getElementById('nt-side'), main = document.getElementById('nt-main');
  var home = document.getElementById('nt-home'), views = [].slice.call(document.querySelectorAll('.nt-view'));
  var links = [].slice.call(side.querySelectorAll('a[data-s]')), base = document.title;
  function mobile() { return window.matchMedia('(max-width: 900px)').matches; }

  /* ---------- graph ---------- */
  var graph = (function () {
    var c = document.getElementById('nt-graph'), G = window.NT_GRAPH || {nodes: [], links: []}, N = G.nodes, E = G.links;
    var cols = ['#3E9E62', '#D0453E', '#3B78DE', '#9157D0', '#D8A31E', '#2A9D8F', '#B5651D', '#5E6672'];
    var ctx, W = 0, H = 0, dpr = window.devicePixelRatio || 1, v = {x: 0, y: 0, k: 1}, hover = -1, active = -1, fitted = false;
    var deg = N.map(function () { return 0; }), nb = N.map(function () { return {}; });
    E.forEach(function (e) { deg[e[0]]++; deg[e[1]]++; nb[e[0]][e[1]] = 1; nb[e[1]][e[0]] = 1; });
    var seed = 3;
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    N.forEach(function (n) { n.x = (rnd() - 0.5) * 300; n.y = (rnd() - 0.5) * 300; n.vx = 0; n.vy = 0; });
    for (var it = 0; it < 400; it++) {
      for (var i = 0; i < N.length; i++) for (var j = i + 1; j < N.length; j++) {
        var a = N[i], b = N[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy + 0.01, d = Math.sqrt(d2), f = Math.min(2400 / d2, 20);
        a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f;
      }
      E.forEach(function (e) {
        var a = N[e[0]], b = N[e[1]], dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, f = (d - 80) * 0.03;
        a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f;
      });
      N.forEach(function (n) { n.vx -= n.x * 0.004; n.vy -= n.y * 0.004; n.vx *= 0.82; n.vy *= 0.82; n.x += n.vx; n.y += n.vy; });
    }
    function rad(i) { return 4 + 1.8 * Math.sqrt(deg[i]); }
    function sx(n) { return n.x * v.k + v.x; }
    function sy(n) { return n.y * v.k + v.y; }
    function fit() {
      if (!N.length) return;
      var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      N.forEach(function (n) { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y); });
      v.k = Math.min(W / (x1 - x0 + 220), H / (y1 - y0 + 120), 2.2);
      v.x = W / 2 - (x0 + x1) / 2 * v.k; v.y = H / 2 - (y0 + y1) / 2 * v.k;
    }
    function resize() {
      if (!c || !c.offsetParent) return;
      var r = c.getBoundingClientRect();
      if (!r.width || !r.height) return;
      W = r.width; H = r.height; c.width = W * dpr; c.height = H * dpr; ctx = c.getContext('2d');
      if (!fitted) { fit(); fitted = true; }
      draw();
    }
    function draw() {
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      var fo = hover >= 0 ? hover : active;
      E.forEach(function (e) {
        var lit = fo >= 0 && (e[0] === fo || e[1] === fo);
        ctx.strokeStyle = lit ? 'rgba(29,78,137,0.8)' : 'rgba(21,19,15,' + (fo >= 0 ? 0.08 : 0.22) + ')';
        ctx.lineWidth = lit ? 1.6 : 1;
        ctx.beginPath(); ctx.moveTo(sx(N[e[0]]), sy(N[e[0]])); ctx.lineTo(sx(N[e[1]]), sy(N[e[1]])); ctx.stroke();
      });
      N.forEach(function (n, i) {
        var near = fo >= 0 && (i === fo || nb[fo][i]);
        ctx.globalAlpha = fo >= 0 && !near ? 0.25 : 1;
        ctx.beginPath(); ctx.arc(sx(n), sy(n), rad(i) * (i === fo ? 1.35 : 1), 0, 2 * Math.PI);
        ctx.fillStyle = cols[n.f % cols.length]; ctx.fill();
        if (i === active) { ctx.lineWidth = 2; ctx.strokeStyle = '#15130F'; ctx.stroke(); }
        if (v.k > 0.6 || near) {
          ctx.font = (i === fo ? '600 ' : '') + '14px "EB Garamond", Georgia, serif';
          ctx.fillStyle = '#15130F'; ctx.fillText(n.t, sx(n) + rad(i) + 5, sy(n) + 4);
        }
        ctx.globalAlpha = 1;
      });
    }
    function pick(px, py) {
      for (var i = N.length - 1; i >= 0; i--) {
        var dx = sx(N[i]) - px, dy = sy(N[i]) - py, r = rad(i) + 5;
        if (dx * dx + dy * dy <= r * r) return i;
      }
      return -1;
    }
    var drag = null;
    function pos(e) { var r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    if (c) {
      c.addEventListener('pointerdown', function (e) { var p = pos(e); drag = {x: p[0], y: p[1], vx: v.x, vy: v.y, moved: 0}; c.setPointerCapture(e.pointerId); });
      c.addEventListener('pointermove', function (e) {
        var p = pos(e);
        if (drag) {
          drag.moved = Math.max(drag.moved, Math.abs(p[0] - drag.x) + Math.abs(p[1] - drag.y));
          v.x = drag.vx + p[0] - drag.x; v.y = drag.vy + p[1] - drag.y; c.style.cursor = 'grabbing'; draw(); return;
        }
        var h = pick(p[0], p[1]);
        if (h !== hover) { hover = h; c.style.cursor = h >= 0 ? 'pointer' : 'grab'; draw(); }
      });
      c.addEventListener('pointerup', function (e) {
        var p = pos(e), moved = drag ? drag.moved : 0; drag = null; c.style.cursor = 'grab';
        if (moved < 5) { var i = pick(p[0], p[1]); if (i >= 0) location.hash = '#' + N[i].s; }
      });
      c.addEventListener('pointerleave', function () { if (!drag && hover >= 0) { hover = -1; draw(); } });
      c.addEventListener('wheel', function (e) {
        e.preventDefault();
        var p = pos(e), k2 = Math.min(4, Math.max(0.3, v.k * Math.exp(-e.deltaY * 0.0015)));
        v.x = p[0] - (p[0] - v.x) * k2 / v.k; v.y = p[1] - (p[1] - v.y) * k2 / v.k; v.k = k2; draw();
      }, {passive: false});
    }
    function focus(s) { active = -1; N.forEach(function (n, i) { if (n.s === s) active = i; }); resize(); draw(); }
    return {resize: resize, focus: focus};
  })();

  /* ---------- pane toggles ---------- */
  var bS = document.getElementById('nt-t-side'), bG = document.getElementById('nt-t-graph');
  function pref(k, val) { try { if (val === undefined) return localStorage.getItem(k); localStorage.setItem(k, val); } catch (e) { return null; } }
  if (pref('nt-no-side') === '1') app.classList.add('no-side');
  if (pref('nt-no-graph') === '1') app.classList.add('no-graph');
  function sync() {
    var m = mobile();
    bS.setAttribute('aria-pressed', String(m ? app.classList.contains('m-side') : !app.classList.contains('no-side')));
    bG.setAttribute('aria-pressed', String(m ? app.classList.contains('m-graph') : !app.classList.contains('no-graph')));
  }
  bS.onclick = function () {
    if (mobile()) { app.classList.toggle('m-side'); app.classList.remove('m-graph'); }
    else { app.classList.toggle('no-side'); pref('nt-no-side', app.classList.contains('no-side') ? '1' : '0'); }
    sync(); graph.resize();
  };
  bG.onclick = function () {
    if (mobile()) { app.classList.toggle('m-graph'); app.classList.remove('m-side'); }
    else { app.classList.toggle('no-graph'); pref('nt-no-graph', app.classList.contains('no-graph') ? '1' : '0'); }
    sync(); graph.resize();
  };

  /* ---------- math (KaTeX) ---------- */
  function typeset(el) {
    if (el && window.renderMathInElement) {
      window.renderMathInElement(el, {delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}], throwOnError: false});
    }
  }
  window.ntMath = function () { typeset(main); };

  /* ---------- open a note ---------- */
  function route() {
    var s = decodeURIComponent(location.hash.slice(1)), el = s && document.getElementById('n-' + s), cur = el ? s : '';
    views.forEach(function (x) { x.hidden = true; });
    (el || home).hidden = false;
    links.forEach(function (a) {
      var on = a.dataset.s === cur;
      a.classList.toggle('on', on);
      if (on) for (var p = a.parentElement; p && p !== side; p = p.parentElement) if (p.tagName === 'DETAILS') p.open = true;
    });
    document.title = el ? el.querySelector('h1').textContent + ' | Notes' : base;
    app.classList.remove('m-side', 'm-graph'); sync();
    main.scrollTop = 0; if (mobile()) window.scrollTo(0, 0);
    typeset(el || home); graph.focus(cur);
  }

  /* ---------- search ---------- */
  var q = document.getElementById('nt-q'), text = {};
  views.forEach(function (x) { if (x.id.indexOf('n-') === 0) text[x.id.slice(2)] = x.textContent.toLowerCase(); });
  q.addEventListener('input', function () {
    var t = q.value.trim().toLowerCase();
    links.forEach(function (a) { a.parentElement.hidden = !!t && text[a.dataset.s].indexOf(t) < 0; });
    [].slice.call(side.querySelectorAll('li.nt-dir')).reverse().forEach(function (li) {
      li.hidden = !!t && !li.querySelector('li:not([hidden]) a[data-s]');
      if (t && !li.hidden) li.firstElementChild.open = true;
    });
    if (t && mobile()) { app.classList.add('m-side'); app.classList.remove('m-graph'); sync(); }
  });

  /* in-page links set the hash directly, so they also work inside the editor's preview */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    location.hash = a.getAttribute('href');
  });
  window.addEventListener('hashchange', route);
  window.addEventListener('resize', function () { sync(); graph.resize(); });
  route();
})();
