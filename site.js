/* logos: hide any tile whose file is missing */
document.querySelectorAll('img.lg').forEach(function (img) {
  if (img.complete && img.naturalWidth === 0) img.classList.add('missing');
  img.addEventListener('error', function () { img.classList.add('missing'); });
});

/* photos: build each thumbnail; drop it if the file is missing */
function tidy(gallery) {
  if (gallery.querySelector('figure')) return;
  var block = gallery.closest('.photoblock');
  (block || gallery).remove();
}
document.querySelectorAll('figure[data-p]').forEach(function (fig) {
  var src = fig.dataset.p;
  var cap = fig.querySelector('figcaption');
  var a = document.createElement('a');
  a.href = src;
  var img = document.createElement('img');
  img.alt = (cap && cap.textContent ? cap.textContent + ' | ' : '') + 'Yashvardhan Singh';
  img.loading = 'lazy';
  img.onerror = function () { var g = fig.parentElement; fig.remove(); if (g) tidy(g); };
  img.src = src;
  a.appendChild(img);
  fig.insertBefore(a, cap);
});

/* photo viewer */
(function () {
  var lb = document.getElementById('lb');
  if (!lb) return;
  var lbImg = document.getElementById('lb-img'), lbCap = document.getElementById('lb-cap'), lbCount = document.getElementById('lb-count');
  var set = [], i = 0, opener = null;
  function show() {
    var f = set[i], img = f.querySelector('img'), cap = f.querySelector('figcaption');
    lbImg.src = img.src; lbImg.alt = img.alt;
    lbCap.textContent = cap ? cap.textContent : '';
    lbCount.textContent = set.length > 1 ? (i + 1) + ' / ' + set.length : '';
    document.getElementById('lb-prev').hidden = document.getElementById('lb-next').hidden = set.length < 2;
  }
  function open(fig) {
    set = Array.prototype.slice.call(fig.parentElement.querySelectorAll('figure'));
    i = set.indexOf(fig); opener = fig.querySelector('a');
    show(); lb.hidden = false; document.body.style.overflow = 'hidden';
    document.getElementById('lb-close').focus();
  }
  function close() { lb.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus(); }
  function step(d) { i = (i + d + set.length) % set.length; show(); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.gallery a');
    if (a) { e.preventDefault(); open(a.closest('figure')); }
  });
  document.getElementById('lb-close').onclick = close;
  document.getElementById('lb-prev').onclick = function () { step(-1); };
  document.getElementById('lb-next').onclick = function () { step(1); };
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
})();

/* the cell-row strip under the intro */
(function () {
  var svg = document.getElementById('cells');
  if (!svg) return;
  var ns = 'http://www.w3.org/2000/svg';
  var seed = 373;
  function rand() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
  var layers = ['--diff', '--poly', '--m1', '--m2', '--m1', '--diff'];
  var styles = getComputedStyle(document.documentElement);
  var rowH = 10, gap = 4, width = 704;
  for (var r = 0; r < 3; r++) {
    var y = r * (rowH + gap), x = 0;
    while (x < width) {
      var w = Math.min(6 + Math.floor(rand() * 34), width - x);
      var rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', x); rect.setAttribute('y', y);
      rect.setAttribute('width', Math.max(w - 1.5, 1)); rect.setAttribute('height', rowH);
      rect.setAttribute('fill', styles.getPropertyValue(layers[Math.floor(rand() * layers.length)]).trim());
      rect.setAttribute('opacity', (0.45 + rand() * 0.4).toFixed(2));
      svg.appendChild(rect);
      if (rand() < 0.12) {
        var via = document.createElementNS(ns, 'rect');
        via.setAttribute('x', x + w / 2 - 1.5); via.setAttribute('y', y + rowH / 2 - 1.5);
        via.setAttribute('width', 3); via.setAttribute('height', 3);
        via.setAttribute('fill', styles.getPropertyValue('--via').trim());
        svg.appendChild(via);
      }
      x += w;
    }
  }
})();
