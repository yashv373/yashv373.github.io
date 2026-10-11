/* Notes app: sidebar tree, search, graph and pane toggles. Data comes from /notes/index.json. */
(function () {
  var app = document.getElementById('nt-app'), side = document.getElementById('nt-side'), main = document.getElementById('nt-main');
  var treeEl = document.getElementById('nt-tree'), resEl = document.getElementById('nt-results'), q = document.getElementById('nt-q');
  var cur = document.body.getAttribute('data-note') || '';
  var N = [], byId = {}, nbr = {};
  function url(id) { return '/notes/' + id + '.html'; }
  function mobile() { return window.matchMedia('(max-width: 900px)').matches; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- math ---------- */
  function typeset() {
    if (window.renderMathInElement) window.renderMathInElement(main, {delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}], throwOnError: false});
  }
  window.ntMath = typeset;

  /* ---------- graph ---------- */
  var graph = (function () {
    var c = document.getElementById('nt-graph'), bLocal = document.getElementById('nt-g-local'), bAll = document.getElementById('nt-g-all');
    var cols = ['#3E9E62', '#D0453E', '#3B78DE', '#9157D0', '#D8A31E', '#2A9D8F', '#B5651D', '#5E6672'];
    var ctx, W = 0, H = 0, dpr = window.devicePixelRatio || 1, v = {x: 0, y: 0, k: 1}, hover = -1, vis = [], edges = [], tops = {}, mode = cur ? 'local' : 'all', ready = false;
    function setMode(m) {
      mode = cur ? m : 'all';
      bLocal.hidden = !cur;
      bLocal.setAttribute('aria-pressed', String(mode === 'local')); bAll.setAttribute('aria-pressed', String(mode === 'all'));
      pickVisible(); fit(); draw();
    }
    function pickVisible() {
      var keep = {};
      if (mode === 'local' && byId[cur]) {
        keep[cur] = 1;
        var ring = [cur];
        for (var depth = 0; depth < 2; depth++) {
          var next = [];
          ring.forEach(function (id) { Object.keys(nbr[id] || {}).forEach(function (j) { if (!keep[j] && Object.keys(keep).length < 160) { keep[j] = 1; next.push(j); } }); });
          ring = next;
        }
        vis = N.filter(function (n) { return keep[n.i]; });
      } else vis = N.slice();
      var on = {}; vis.forEach(function (n) { on[n.i] = 1; });
      edges = [];
      vis.forEach(function (n) { (n.l || []).forEach(function (j) { if (on[j]) edges.push([n, byId[j]]); }); });
    }
    function fit() {
      if (!vis.length || !W) return;
      var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      vis.forEach(function (n) { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y); });
      v.k = Math.min(W / (x1 - x0 + 240), H / (y1 - y0 + 120), 2.4);
      v.x = W / 2 - (x0 + x1) / 2 * v.k; v.y = H / 2 - (y0 + y1) / 2 * v.k;
    }
    function rad(n) { return Math.min(4 + 1.6 * Math.sqrt(n.deg || 0), 14); }
    function sx(n) { return n.x * v.k + v.x; }
    function sy(n) { return n.y * v.k + v.y; }
    function draw() {
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      var fo = hover >= 0 ? vis[hover] : byId[cur], near = fo ? nbr[fo.i] || {} : {};
      ctx.lineWidth = 1;
      edges.forEach(function (e) {
        var lit = fo && (e[0] === fo || e[1] === fo);
        ctx.strokeStyle = lit ? 'rgba(29,78,137,0.8)' : 'rgba(21,19,15,' + (fo ? 0.08 : 0.2) + ')';
        ctx.beginPath(); ctx.moveTo(sx(e[0]), sy(e[0])); ctx.lineTo(sx(e[1]), sy(e[1])); ctx.stroke();
      });
      var labels = vis.length < 70 || v.k > 1.3;
      vis.forEach(function (n) {
        var close = fo && (n === fo || near[n.i]);
        ctx.globalAlpha = fo && !close ? 0.25 : 1;
        var r = rad(n) * (n === fo ? 1.3 : 1);
        ctx.beginPath(); ctx.arc(sx(n), sy(n), r, 0, 2 * Math.PI);
        ctx.fillStyle = cols[(tops[n.f.split(' / ')[0]] || 0) % cols.length]; ctx.fill();
        if (n.i === cur) { ctx.lineWidth = 2; ctx.strokeStyle = '#15130F'; ctx.stroke(); ctx.lineWidth = 1; }
        if (labels || close) {
          ctx.font = (n === fo ? '600 ' : '') + '14px "EB Garamond", Georgia, serif';
          ctx.fillStyle = '#15130F'; ctx.fillText(n.t, sx(n) + r + 5, sy(n) + 4);
        }
        ctx.globalAlpha = 1;
      });
    }
    function resize() {
      if (!c || !c.offsetParent) return;
      var r = c.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var first = !W; W = r.width; H = r.height; c.width = W * dpr; c.height = H * dpr; ctx = c.getContext('2d');
      if (first || !ready) { ready = true; fit(); }
      draw();
    }
    function pick(px, py) {
      for (var i = vis.length - 1; i >= 0; i--) { var n = vis[i], dx = sx(n) - px, dy = sy(n) - py, r = rad(n) + 5; if (dx * dx + dy * dy <= r * r) return i; }
      return -1;
    }
    var drag = null;
    function pos(e) { var r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    c.addEventListener('pointerdown', function (e) { var p = pos(e); drag = {x: p[0], y: p[1], vx: v.x, vy: v.y, moved: 0}; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', function (e) {
      var p = pos(e);
      if (drag) { drag.moved = Math.max(drag.moved, Math.abs(p[0] - drag.x) + Math.abs(p[1] - drag.y)); v.x = drag.vx + p[0] - drag.x; v.y = drag.vy + p[1] - drag.y; c.style.cursor = 'grabbing'; draw(); return; }
      var h = pick(p[0], p[1]); if (h !== hover) { hover = h; c.style.cursor = h >= 0 ? 'pointer' : 'grab'; draw(); }
    });
    c.addEventListener('pointerup', function (e) {
      var p = pos(e), moved = drag ? drag.moved : 0; drag = null; c.style.cursor = 'grab';
      if (moved < 5) { var i = pick(p[0], p[1]); if (i >= 0) location.href = url(vis[i].i); }
    });
    c.addEventListener('pointerleave', function () { if (!drag && hover >= 0) { hover = -1; draw(); } });
    c.addEventListener('wheel', function (e) {
      e.preventDefault();
      var p = pos(e), k2 = Math.min(6, Math.max(0.05, v.k * Math.exp(-e.deltaY * 0.0015)));
      v.x = p[0] - (p[0] - v.x) * k2 / v.k; v.y = p[1] - (p[1] - v.y) * k2 / v.k; v.k = k2; draw();
    }, {passive: false});
    bLocal.onclick = function () { setMode('local'); };
    bAll.onclick = function () { setMode('all'); };
    function load() {
      var names = []; N.forEach(function (n) { var t = n.f.split(' / ')[0]; if (names.indexOf(t) < 0) names.push(t); });
      names.sort(function (a, b) { return a.localeCompare(b, undefined, {numeric: true}); }).forEach(function (t, i) { tops[t] = i; });
      setMode(mode); resize();
    }
    return {resize: resize, load: load};
  })();

  /* ---------- sidebar tree ---------- */
  var opened = {};
  try { opened = JSON.parse(store('nt-open') || '{}'); } catch (e) { opened = {}; }
  function buildTree() {
    var root = {kids: {}, notes: []};
    N.forEach(function (n) {
      var node = root, path = '';
      n.f.split(' / ').forEach(function (seg) { path += (path ? ' / ' : '') + seg; node = node.kids[seg] = node.kids[seg] || {kids: {}, notes: [], path: path}; });
      node.notes.push(n);
    });
    var curNote = byId[cur], curPath = curNote ? curNote.f : '';
    function count(node) { var c = node.notes.length; for (var k in node.kids) c += count(node.kids[k]); return c; }
    function render(node, depth) {
      var keys = Object.keys(node.kids).sort(function (a, b) { return a.localeCompare(b, undefined, {numeric: true}); });
      return '<ul>' + keys.map(function (k) {
        var c = node.kids[k], open = opened[c.path] !== undefined ? opened[c.path] : depth === 0;
        if (curPath === c.path || curPath.indexOf(c.path + ' / ') === 0) open = true;
        return '<li class="nt-dir"><details data-path="' + esc(c.path) + '"' + (open ? ' open' : '') + '><summary>' + esc(k) + ' <span>' + count(c) + '</span></summary>' + render(c, depth + 1) + '</details></li>';
      }).join('') + node.notes.slice().sort(function (a, b) { return a.t.localeCompare(b.t, undefined, {numeric: true}); }).map(function (n) {
        return '<li><a href="' + url(n.i) + '"' + (n.i === cur ? ' class="on" aria-current="page"' : '') + '>' + esc(n.t) + '</a></li>';
      }).join('') + '</ul>';
    }
    treeEl.innerHTML = N.length ? render(root, 0) : '<p class="nt-empty">No notes yet.</p>';
    treeEl.addEventListener('toggle', function (e) {
      var d = e.target; if (!d.dataset || !d.dataset.path) return;
      opened[d.dataset.path] = d.open; store('nt-open', JSON.stringify(opened));
    }, true);
    var s = sessionStorage.getItem('nt-scroll'); if (s) side.scrollTop = +s;
    var on = treeEl.querySelector('a.on');
    if (on) { var r = on.getBoundingClientRect(), sr = side.getBoundingClientRect(); if (r.top < sr.top || r.bottom > sr.bottom) on.scrollIntoView({block: 'center'}); }
    window.addEventListener('pagehide', function () { sessionStorage.setItem('nt-scroll', side.scrollTop); });
  }

  /* ---------- search: titles, folders and tags instantly; full text once loaded ---------- */
  var full = null, loadingFull = false;
  function loadFull() {
    if (full || loadingFull) return; loadingFull = true;
    fetch('/notes/search.json', {cache: 'no-cache'}).then(function (r) { return r.json(); }).then(function (rows) {
      full = {}; rows.forEach(function (r) { full[r[0]] = r[1]; }); if (q.value.trim()) search();
    }).catch(function () { loadingFull = false; });
  }
  function search() {
    var t = q.value.trim().toLowerCase();
    if (!t) { resEl.hidden = true; treeEl.hidden = false; return; }
    var words = t.split(/\s+/), hits = [];
    N.forEach(function (n) {
      var head = (n.t + ' ' + n.f + ' ' + (n.g || '')).toLowerCase(), body = full ? (full[n.i] || '').toLowerCase() : '', score = 0;
      for (var i = 0; i < words.length; i++) {
        var w = words[i];
        if (n.t.toLowerCase().indexOf(w) >= 0) score += 10; else if (head.indexOf(w) >= 0) score += 5; else if (body.indexOf(w) >= 0) score += 1; else return;
      }
      if (n.t.toLowerCase() === t) score += 50;
      hits.push([score, n]);
    });
    hits.sort(function (a, b) { return b[0] - a[0] || a[1].t.localeCompare(b[1].t); });
    var shown = hits.slice(0, 60);
    resEl.innerHTML = '<p class="nt-rcount">' + hits.length + (hits.length === 1 ? ' result' : ' results') + (full ? '' : ' &middot; searching full text&hellip;') + '</p>' +
      shown.map(function (h, k) {
        var n = h[1], snip = '';
        if (full && full[n.i]) {
          var txt = full[n.i], at = txt.toLowerCase().indexOf(words[0]);
          if (at >= 0) snip = (at > 40 ? '&hellip;' : '') + esc(txt.slice(Math.max(0, at - 40), at + 90)).replace(new RegExp(words[0].replace(/[.*+?^$(){}|[\]\\]/g, '\\$&'), 'ig'), function (m) { return '<mark>' + m + '</mark>'; }) + '&hellip;';
        }
        return '<a class="nt-hit' + (k === 0 ? ' first' : '') + '" href="' + url(n.i) + '"><b>' + esc(n.t) + '</b><span>' + esc(n.f) + '</span>' + (snip ? '<em>' + snip + '</em>' : '') + '</a>';
      }).join('') + (hits.length > shown.length ? '<p class="nt-rcount">Showing the top ' + shown.length + '. Type more to narrow it down.</p>' : '');
    resEl.hidden = false; treeEl.hidden = true;
    if (mobile()) { app.classList.add('m-side'); app.classList.remove('m-graph'); sync(); }
  }
  q.addEventListener('focus', loadFull);
  q.addEventListener('input', function () { loadFull(); search(); });
  q.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { var a = resEl.querySelector('a.nt-hit'); if (a) location.href = a.getAttribute('href'); }
    if (e.key === 'Escape') { q.value = ''; search(); q.blur(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== q && !/input|textarea/i.test((document.activeElement || {}).tagName || '')) { e.preventDefault(); q.focus(); }
  });

  /* ---------- pane toggles ---------- */
  var bS = document.getElementById('nt-t-side'), bG = document.getElementById('nt-t-graph');
  if (store('nt-no-side') === '1') app.classList.add('no-side');
  if (store('nt-no-graph') === '1') app.classList.add('no-graph');
  function sync() {
    var m = mobile();
    bS.setAttribute('aria-pressed', String(m ? app.classList.contains('m-side') : !app.classList.contains('no-side')));
    bG.setAttribute('aria-pressed', String(m ? app.classList.contains('m-graph') : !app.classList.contains('no-graph')));
  }
  bS.onclick = function () {
    if (mobile()) { app.classList.toggle('m-side'); app.classList.remove('m-graph'); }
    else { app.classList.toggle('no-side'); store('nt-no-side', app.classList.contains('no-side') ? '1' : '0'); }
    sync(); graph.resize();
  };
  bG.onclick = function () {
    if (mobile()) { app.classList.toggle('m-graph'); app.classList.remove('m-side'); }
    else { app.classList.toggle('no-graph'); store('nt-no-graph', app.classList.contains('no-graph') ? '1' : '0'); }
    sync(); graph.resize();
  };
  window.addEventListener('resize', function () { sync(); graph.resize(); });
  sync();

  /* ---------- load the list of notes ---------- */
  fetch('/notes/index.json', {cache: 'no-cache'}).then(function (r) { return r.json(); }).then(function (ix) {
    N = ix.notes || [];
    N.forEach(function (n) { byId[n.i] = n; nbr[n.i] = nbr[n.i] || {}; n.deg = 0; });
    N.forEach(function (n) { (n.l || []).forEach(function (j) { if (byId[j]) { nbr[n.i][j] = 1; nbr[j][n.i] = 1; } }); });
    N.forEach(function (n) { n.deg = Object.keys(nbr[n.i]).length; });
    buildTree(); graph.load();
  }).catch(function () { treeEl.innerHTML = '<p class="nt-empty">Could not load the list of notes. Try refreshing.</p>'; });
})();
