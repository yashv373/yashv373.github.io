/* Builds index.html from content.json. Used by admin.html (in the browser). */
(function (root) {
  var SITE = 'https://yashv373.github.io/';
  var MONO_DARK = 'M0.5 99 0.5 110.5 12 122 88.5 122 100 110.5 100 90 89 79 45 79 45 93.5 84 94 85.5 95.5 85.5 105 85 106 83 107 17.5 107 15 105 15 99ZM65 65.5 83.5 65.5 85.5 67.5 85.5 73.5 100 73.5 100 62 88.5 50.5 79.5 50.5ZM24.5 50.5 12 50.5 0.5 62.5 0.5 82 12 93.5 24.5 93.5 24.5 79 17.5 79 15 76.5 15.5 66 17 65.5 24.5 65.5ZM91.5 0 70.5 0 27.5 43 27.5 104 42.5 104 42.5 49.5ZM0 0 33 33.5 43.5 23 21 0Z';
  var MONO_ORANGE = 'M94 32 77 32 55 53.5 54.5 41 45 50.5 45.5 66 52.5 73.5Z';
  var CHIP = '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="10" y="10" width="20" height="20" rx="2"/><rect x="15" y="15" width="10" height="10"/><path d="M14 5v5M18 5v5M22 5v5M26 5v5M14 30v5M18 30v5M22 30v5M26 30v5M5 14h5M5 18h5M5 22h5M5 26h5M30 14h5M30 18h5M30 22h5M30 26h5"/></svg>';
  var WAFER = '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M16 34.2A15 15 0 1 1 24 34.2Z"/><path stroke-width="0.8" d="M11 14h18M11 20h18M11 26h18M14 11v18M20 8v24M26 11v18"/></svg>';
  var NAMES = {st: 'STMicroelectronics', chipmit: 'ChipMIT', manipal: 'Manipal Institute of Technology', mahe: 'MAHE', beeprecise: 'BeePrecise', loopmit: 'loopMIT', iitbhu: 'IIT (BHU) Varanasi', iitd: 'IIT Delhi', tfi: 'Teach For India', bis: 'Bureau of Indian Standards', ecell: 'E-Cell, MIT Manipal', unwind: 'Unwind', mun: 'Model United Nations', ieee: 'IEEE', ieeesb: 'IEEE Student Branch Manipal', iee: 'IE-E&C, Manipal Chapter', vlsid: 'VLSI Society of India', iswdp: 'ISWDP (IISc, Synopsys, Samsung)', samsung: 'Samsung Semiconductor', sscs: 'IEEE Solid-State Circuits Society', gf: 'GlobalFoundries', arxiv: 'arXiv', rsq: 'Research Square', ssrn: 'SSRN (Elsevier)', jxcdc: 'IEEE JXCDC', semi: 'SEMI', marvell: 'Marvell Technology', nitk: 'NIT Karnataka', rvce: 'RV College of Engineering', iisc: 'IISc Bangalore', synopsys: 'Synopsys', techtatva: 'TechTatva, MIT Manipal', github: 'GitHub'};

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // plain text, plus [text](link) and **bold**
  function inline(s) {
    return esc(s)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, u) { return '<a href="' + u + '">' + t + '</a>'; })
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  }
  function lines(s) { return String(s || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean); }
  function pairs(s) {
    return lines(s).map(function (l) { var i = l.indexOf('|'); return i < 0 ? [l, ''] : [l.slice(0, i).trim(), l.slice(i + 1).trim()]; });
  }
  function logos(s, cls) {
    return String(s || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean).map(function (k) {
      return '<img class="' + cls + '" src="logos/' + esc(k) + '.png" alt="' + esc(NAMES[k] || k) + '" loading="lazy">';
    });
  }
  function logoCol(s, cls) {
    var l = logos(s, cls);
    if (!l.length) return '<span></span>';
    return l.length === 1 ? l[0] : '<span class="lc">' + l.join('') + '</span>';
  }
  function linkRow(s) {
    var p = pairs(s);
    if (!p.length) return '';
    return '<p class="links">' + p.map(function (x) { return '<a href="' + esc(x[1]) + '">' + esc(x[0]) + '</a>'; }).join(' / ') + '</p>';
  }
  function gallery(s) {
    var p = pairs(s);
    if (!p.length) return '';
    return '<div class="gallery">' + p.map(function (x) {
      return '<figure data-p="' + esc(x[0]) + '"><figcaption>' + esc(x[1]) + '</figcaption></figure>';
    }).join('') + '</div>';
  }
  function paras(s) { return lines(s).map(function (l) { return '<p>' + inline(l) + '</p>'; }).join(''); }

  function mono(x, y, scale) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + scale + ')"><path fill="#1E1F22" d="' + MONO_DARK + '"/><path fill="#FF3B00" d="' + MONO_ORANGE + '"/></g>';
  }
  function badge(cls) {
    var pads = '';
    for (var i = 0; i < 60; i++) {
      var a = i * 6;
      pads += '<rect x="-3" y="-3" width="6" height="6" transform="rotate(' + a + ' 120 120) translate(120 16)"/>';
    }
    return '<svg class="' + (cls || '') + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="Yashvardhan Singh logo">' +
      '<defs><path id="ys-top" d="M42 120A78 78 0 0 1 198 120"/><path id="ys-bot" d="M32 120A88 88 0 0 0 208 120"/></defs>' +
      '<circle cx="120" cy="120" r="117" fill="#fff" stroke="#1E1F22" stroke-width="1.5"/>' +
      '<circle cx="120" cy="120" r="111" fill="none" stroke="#1E1F22" stroke-width="0.6"/>' +
      '<g fill="none" stroke="#9AA0A8" stroke-width="0.6">' + pads + '</g>' +
      '<circle cx="120" cy="120" r="97" fill="none" stroke="#1E1F22" stroke-width="0.8"/>' +
      '<g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="700" fill="#1E1F22" text-anchor="middle">' +
      '<text font-size="13" letter-spacing="2.6"><textPath href="#ys-top" startOffset="50%">YASHVARDHAN SINGH</textPath></text>' +
      '<text font-size="11.5" letter-spacing="2.2"><textPath href="#ys-bot" startOffset="50%">HARDWARE ENGINEERING</textPath></text></g>' +
      '<circle cx="37" cy="120" r="2.2" fill="#FF3B00"/><circle cx="203" cy="120" r="2.2" fill="#FF3B00"/>' +
      mono(91.5, 85.25, 0.57) + '</svg>';
  }
  function favicon() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="22" fill="#fff"/>' + mono(21.4, 12, 0.852) + '</svg>\n';
  }

  function entry(e) {
    var bl = lines(e.bullets);
    return '<div class="entry">' + logoCol(e.logo, 'lg') + '<div>' +
      '<div class="role-line"><h3>' + inline(e.title) + '</h3>' + (e.dates ? '<span class="when">' + esc(e.dates) + '</span>' : '') + '</div>' +
      (e.meta ? '<p class="meta">' + inline(e.meta) + '</p>' : '') + paras(e.text) +
      (bl.length ? '<ul>' + bl.map(function (b) { return '<li>' + inline(b) + '</li>'; }).join('') + '</ul>' : '') +
      linkRow(e.links) + gallery(e.photos) + '</div></div>\n';
  }
  function pub(p) {
    var t = esc(p.title);
    var title = p.link ? '<a href="' + esc(p.link) + '">' + t + '</a>' : t;
    return '<div class="entry">' + logoCol(p.logo, 'lg') + '<div>' +
      '<h3>' + title + (p.tag ? ' <span class="tag">' + esc(p.tag) + '</span>' : '') + '</h3>' +
      '<p class="authors">' + esc(p.authors).replace('Yashvardhan Singh', '<b>Yashvardhan Singh</b>') + '</p>' +
      '<p class="venue">' + esc(p.venue) + '</p>' +
      (p.summary ? '<p class="summary">' + inline(p.summary) + '</p>' : '') + linkRow(p.links) + '</div></div>\n';
  }
  function compact(list) {
    return '<ul class="compact">' + (list || []).map(function (c) {
      var name = c.link ? '<a class="name" href="' + esc(c.link) + '">' + inline(c.title) + '</a>' : '<span class="name">' + inline(c.title) + '</span>';
      return '<li>' + logoCol(c.logo, 'lg md') + '<span>' + name + '<span class="sub">' + inline(c.sub) + '</span></span><span class="when">' + esc(c.when) + '</span></li>';
    }).join('\n') + '</ul>\n';
  }
  function story(n) {
    return '<li><span class="when">' + esc(n.date) + '</span>' + logoCol(n.logo, 'lg') + '<span>' + inline(n.text || n.headline) + '</span></li>\n';
  }

  function authorsList(s) {
    return String(s || '').replace(/\([^)]*\)/g, '').split(/,| and /).map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function jsonld(d) {
    var me = SITE + '#person';
    var graph = [
      {'@type': 'ProfilePage', '@id': SITE + '#page', url: SITE, name: d.profile.name, mainEntity: {'@id': me}},
      {'@type': 'Person', '@id': me, name: d.profile.name, givenName: 'Yashvardhan', familyName: 'Singh', url: SITE,
        image: SITE + 'photo.jpg', jobTitle: 'Digital Integrated Circuit Design Engineer',
        description: 'Digital integrated circuit design engineer working on hardware acceleration, digital ASIC design, open-source silicon, machine learning for EDA and spintronics (CMOS-MTJ).',
        worksFor: {'@type': 'Organization', name: 'STMicroelectronics', url: 'https://www.st.com'},
        alumniOf: {'@type': 'CollegeOrUniversity', name: 'Manipal Institute of Technology, Manipal'},
        memberOf: {'@type': 'Organization', name: 'ChipMIT', url: 'https://www.chipmit.in'},
        knowsAbout: ['Digital IC design', 'VLSI design', 'ASIC design', 'RTL design', 'Design verification', 'Hardware accelerators', 'Systolic arrays', 'Open-source silicon', 'RTL-to-GDSII', 'SoC integration', 'IP-XACT', 'Machine learning for EDA', 'Spintronics', 'CMOS-MTJ circuits', 'Compute-in-memory'],
        award: (d.honors || []).map(function (h) { return h.title + ', ' + h.sub; }),
        sameAs: [d.profile.linkedin, d.profile.github, d.profile.scholar, 'https://www.behance.net/zmagnus', 'https://yashvardhans.framer.website/'].filter(Boolean)},
      {'@type': 'WebSite', '@id': SITE + '#website', url: SITE, name: d.profile.name, publisher: {'@id': me}}
    ];
    (d.publications || []).forEach(function (p) {
      if (!p.link) return;
      var a = {'@type': 'ScholarlyArticle', headline: p.title, url: p.link,
        author: authorsList(p.authors).map(function (n) { return n === 'Yashvardhan Singh' ? {'@id': me} : {'@type': 'Person', name: n}; })};
      if (p.date) a.datePublished = p.date;
      graph.push(a);
    });
    return JSON.stringify({'@context': 'https://schema.org', '@graph': graph}, null, 1).replace(/</g, '\\u003c');
  }

  function page(d) {
    var P = d.profile;
    var title = P.name + ' | Digital IC Design Engineer';
    var desc = P.name + ' is a digital integrated circuit design engineer working on hardware accelerators, ASIC design and open-source silicon. MIT Manipal, STMicroelectronics, co-founder of ChipMIT.';
    var em = String(P.email || '').split('@');
    var contact = (em.length === 2 ? ['<a class="em" href="#" data-u="' + esc(em[0]) + '" data-d="' + esc(em[1]) + '">email</a>'] : []).concat(
      [['github', P.github], ['google scholar', P.scholar], ['linkedin', P.linkedin], ['cv', P.cv]]
      .filter(function (x) { return x[1]; })
      .map(function (x) { return '<a href="' + esc(x[1]) + '">' + x[0] + '</a>'; })).join(' / ');
    var bio = String(P.bio || '').split(/\n\s*\n/).map(function (p) { return '<p>' + inline(p.trim()) + '</p>'; }).join('\n');
    var h = [];
    h.push('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="color-scheme" content="light">');
    h.push('<title>' + esc(title) + '</title>');
    h.push('<meta name="description" content="' + esc(desc) + '">');
    h.push('<meta name="author" content="' + esc(P.name) + '">\n<meta name="robots" content="index, follow, max-image-preview:large">');
    h.push('<link rel="canonical" href="' + SITE + '">\n<link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/photo.jpg">');
    h.push('<link rel="alternate" type="text/plain" href="/llms.txt" title="Plain-text summary for AI assistants">');
    h.push('<meta property="og:type" content="profile">\n<meta property="og:site_name" content="' + esc(P.name) + '">\n<meta property="og:title" content="' + esc(title) + '">');
    h.push('<meta property="og:description" content="' + esc(desc) + '">\n<meta property="og:url" content="' + SITE + '">\n<meta property="og:image" content="' + SITE + 'photo.jpg">');
    h.push('<meta property="og:image:alt" content="' + esc(P.name) + '">\n<meta property="profile:first_name" content="Yashvardhan">\n<meta property="profile:last_name" content="Singh">');
    h.push('<meta name="twitter:card" content="summary">\n<meta name="twitter:title" content="' + esc(title) + '">\n<meta name="twitter:description" content="' + esc(desc) + '">\n<meta name="twitter:image" content="' + SITE + 'photo.jpg">');
    h.push('<script type="application/ld+json">\n' + jsonld(d) + '\n</script>');
    h.push('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
    h.push('<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Old+Standard+TT:wght@400;700&family=UnifrakturCook:wght@700&family=Herr+Von+Muellerhoff&family=Inter+Tight:wght@700;800&display=swap" rel="stylesheet">');
    h.push('<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<main>');

    h.push('<header class="intro">\n<img class="photo" src="photo.jpg" alt="' + esc(P.name) + '" width="400" height="400">\n<div>\n<h1>' + esc(P.name) + '</h1>');
    h.push('<p class="contact">' + contact + '</p>\n<div class="bio">\n' + bio + '\n</div>\n</div>\n</header>');
    h.push('<svg class="cells" id="cells" viewBox="0 0 704 38" aria-hidden="true" focusable="false"></svg>');
    h.push('<nav class="jump" aria-label="Sections"><a href="#publications">publications</a> / <a href="#projects">projects</a> / <a href="#experience">experience</a> / <a href="#education">education</a> / <a href="#volunteering">volunteering</a> / <a href="#honors">honors</a> / <a href="#news">news</a></nav>');


    h.push('\n<section id="publications" class="pubs">\n<h2>Publications</h2>\n<p class="section-note">Also on <a href="' + esc(P.scholar) + '">Google Scholar</a>.</p>\n' + (d.publications || []).map(pub).join('') + '</section>');
    h.push('\n<section id="projects">\n<h2>Projects</h2>\n' + (d.projects || []).map(entry).join('') + ((d.smallProjects || []).length ? '<h4>Smaller projects</h4>\n' + compact(d.smallProjects) : '') + '</section>');
    h.push('\n<section id="experience">\n<h2>Experience</h2>\n' + (d.experience || []).map(entry).join('') + '</section>');
    h.push('\n<section id="education">\n<h2>Education</h2>\n' + (d.education || []).map(entry).join('') + '</section>');
    h.push('\n<section id="volunteering">\n<h2>Volunteering &amp; student teams</h2>\n' + (d.volunteering || []).map(entry).join('') + ((d.otherRoles || []).length ? '<h4>Other roles</h4>\n' + compact(d.otherRoles) : '') + '</section>');
    h.push('\n<section id="honors">\n<h2>Honors &amp; fellowships</h2>\n' + compact(d.honors) + '</section>');
    if (P.before) h.push('\n<section id="before">\n<h2>Before chips</h2>\n<p>' + inline(P.before) + '</p>\n</section>');

    h.push('\n<section id="news">\n<h2>News</h2>\n<div class="paper">');
    h.push('<div class="paper-top"><div class="ear" aria-hidden="true">' + CHIP + '</div><p class="masthead">The Yashvardhan Times</p><div class="ear right" aria-hidden="true">' + WAFER + '</div></div>');
    h.push('<div class="paper-bar"></div>');
    h.push('<ul class="stories" tabindex="0" aria-label="News">\n' + (d.news || []).map(story).join('') + '</ul>');
    h.push('<div class="paper-foot">Scroll for earlier editions</div>\n</div>');
    var oa = gallery(d.outAndAbout);
    if (oa) h.push('<div class="photoblock"><h4>Out and about</h4>' + oa + '</div>');
    h.push('</section>');
    h.push('\n<footer>' + badge('badge') + '<div><a class="admin-link" href="admin.html">' + esc(P.name) + '</a><br>Last updated ' + esc(P.updated) + '.' + (P.goatcounter ? '<br><span id="visits" data-gc="' + esc(P.goatcounter) + '"></span>' : '') + '<br><a class="notes-link" href="notes.html">my notes &rarr;</a></div><p class="sig" role="img" aria-label="Signature: ' + esc(P.name) + '"><span>Yashvardhan</span><span>Singh</span></p></footer>\n</main>');
    h.push('<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Photo viewer"><span class="lb-count" id="lb-count"></span><button class="lb-close" id="lb-close" aria-label="Close">&times;</button><button class="lb-prev" id="lb-prev" aria-label="Previous photo">&lsaquo;</button><figure><img id="lb-img" alt=""><figcaption id="lb-cap"></figcaption></figure><button class="lb-next" id="lb-next" aria-label="Next photo">&rsaquo;</button></div>');
    h.push('<script src="site.js"></script>');
    if (P.goatcounter) h.push('<script data-goatcounter="https://' + esc(P.goatcounter) + '.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>');
    h.push('</body>\n</html>\n');
    return h.join('\n');
  }

  function plain(s) { return String(s || '').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, u) { return u.charAt(0) === '#' ? t : t + ' (' + u + ')'; }).replace(/\*\*/g, ''); }
  function llms(d) {
    var P = d.profile, o = [], em = String(P.email || '').split('@');
    o.push('# ' + P.name, '');
    o.push('> ' + plain(String(P.bio || '').replace(/\s*\n\s*\n\s*/g, ' ')), '');
    o.push('Homepage: ' + SITE);
    if (em.length === 2) o.push('Email: ' + em[0] + ' [at] ' + em[1]);
    [['LinkedIn', P.linkedin], ['GitHub', P.github], ['Google Scholar', P.scholar]].forEach(function (x) { if (x[1]) o.push(x[0] + ': ' + x[1]); });
    function block(title, list, fn) { if (!list || !list.length) return; o.push('', '## ' + title); list.forEach(function (x) { o.push('- ' + fn(x)); }); }
    function ent(e) { return [e.title, e.dates, e.meta].filter(Boolean).map(plain).join(', ') + (e.text ? '. ' + plain(lines(e.text).join(' ')) : '') + (lines(e.bullets).length ? ' ' + lines(e.bullets).map(plain).join(' ') : ''); }
    block('Experience', d.experience, ent);
    block('Publications', d.publications, function (p) { return p.title + '. ' + p.authors + '. ' + p.venue + (p.tag ? ' (' + p.tag + ')' : '') + '.' + (p.link ? ' ' + p.link : '') + (p.summary ? ' ' + plain(p.summary) : ''); });
    block('Projects', d.projects, ent);
    block('Smaller projects', d.smallProjects, function (c) { return plain(c.title) + ' (' + c.when + '): ' + plain(c.sub) + (c.link ? ' ' + c.link : ''); });
    block('Education', d.education, ent);
    block('Volunteering and student teams', d.volunteering, ent);
    block('Other roles', d.otherRoles, function (c) { return plain(c.title) + ', ' + plain(c.sub) + ' (' + c.when + ')'; });
    block('Honors', d.honors, function (c) { return plain(c.title) + ', ' + plain(c.sub) + ' (' + c.when + ')'; });
    block('Recent news', (d.news || []).slice(0, 10), function (n) { return n.date + ': ' + plain(n.text); });
    block('Notes (' + SITE + 'notes.html)', noteList(d).slice(0, 40), function (n) { return n.t + ' [' + n.f + ']: ' + SITE + 'notes.html#' + n.s; });
    o.push('', 'Note: other people share the name ' + P.name + '. This page is about the digital IC / chip design engineer from MIT Manipal and STMicroelectronics.', '');
    return o.join('\n');
  }
  function sitemap(d, day) {
    var imgs = ['photo.jpg'];
    [d.outAndAbout].concat((d.projects || []).concat(d.experience || [], d.volunteering || []).map(function (e) { return e.photos; }))
      .forEach(function (s) { pairs(s).forEach(function (x) { imgs.push(x[0]); }); });
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n  <url>\n    <loc>' + SITE + '</loc>\n    <lastmod>' + day + '</lastmod>\n' +
      imgs.map(function (p) { return '    <image:image><image:loc>' + SITE + esc(p) + '</image:loc></image:image>'; }).join('\n') +
      '\n  </url>\n  <url>\n    <loc>' + SITE + 'notes.html</loc>\n    <lastmod>' + day + '</lastmod>\n  </url>\n  <url>\n    <loc>' + SITE + 'llms.txt</loc>\n    <lastmod>' + day + '</lastmod>\n  </url>\n</urlset>\n';
  }

  /* ---------- notes ---------- */
  function slugify(t) { return String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'note'; }
  function mdInline(s, ctx) {
    var keep = [];
    function hold(h) { keep.push(h); return '\u0000' + (keep.length - 1) + '\u0000'; }
    s = s.replace(/`([^`]+)`/g, function (m, c) { return hold('<code>' + esc(c) + '</code>'); });
    s = s.replace(/\$\$([^$]+)\$\$/g, function (m) { return hold(esc(m)); }).replace(/\$([^$\n]+)\$/g, function (m) { return hold(esc(m)); });
    s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (m, t, l) { return hold(ctx.wiki(t.trim(), (l || t).trim())); });
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (m, a, u) { return hold('<img src="' + esc(u) + '" alt="' + esc(a) + '" loading="lazy">'); });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, u) { return hold('<a href="' + esc(u) + '">' + esc(t) + '</a>'); });
    s = esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*\s][^*]*)\*/g, '<i>$1</i>');
    return s.replace(/\u0000(\d+)\u0000/g, function (m, i) { return keep[+i]; });
  }
  function md(src, ctx) {
    var L = String(src || '').replace(/\r/g, '').split('\n'), out = [], i = 0, para = [], m;
    function flush() { if (para.length) { out.push('<p>' + mdInline(para.join(' '), ctx) + '</p>'); para = []; } }
    function cells(r) { return r.trim().replace(/^\||\|$/g, '').split('|').map(function (c) { return c.trim(); }); }
    while (i < L.length) {
      var l = L[i];
      if (/^```/.test(l)) {
        flush(); var lang = l.slice(3).trim(), code = []; i++;
        while (i < L.length && !/^```/.test(L[i])) { code.push(L[i]); i++; }
        i++; out.push('<pre><code' + (lang ? ' class="lang-' + esc(lang) + '"' : '') + '>' + esc(code.join('\n')) + '</code></pre>'); continue;
      }
      if (/^\$\$\s*$/.test(l)) {
        flush(); var mm = []; i++;
        while (i < L.length && !/^\$\$\s*$/.test(L[i])) { mm.push(L[i]); i++; }
        i++; out.push('<div class="math">$$' + esc(mm.join('\n')) + '$$</div>'); continue;
      }
      if (/^\s*$/.test(l)) { flush(); i++; continue; }
      if ((m = l.match(/^(#{1,4})\s+(.*)$/))) { flush(); var n = Math.max(2, m[1].length); out.push('<h' + n + '>' + mdInline(m[2], ctx) + '</h' + n + '>'); i++; continue; }
      if (/^(-{3,}|\*{3,})\s*$/.test(l)) { flush(); out.push('<hr>'); i++; continue; }
      if (/^>\s?/.test(l)) {
        flush(); var q = [];
        while (i < L.length && /^>\s?/.test(L[i])) { q.push(L[i].replace(/^>\s?/, '')); i++; }
        out.push('<blockquote>' + md(q.join('\n'), ctx) + '</blockquote>'); continue;
      }
      if (/^\s*([-*+]|\d+\.)\s+/.test(l)) {
        flush(); var ol = /^\s*\d+\./.test(l), items = [];
        while (i < L.length && /^\s*([-*+]|\d+\.)\s+/.test(L[i])) { items.push(L[i].replace(/^\s*([-*+]|\d+\.)\s+/, '')); i++; }
        var tg = ol ? 'ol' : 'ul';
        out.push('<' + tg + '>' + items.map(function (t) { return '<li>' + mdInline(t, ctx) + '</li>'; }).join('') + '</' + tg + '>'); continue;
      }
      if (/^\|.*\|\s*$/.test(l) && i + 1 < L.length && /^\|?\s*:?-{2,}/.test(L[i + 1])) {
        flush(); var head = cells(l), rows = []; i += 2;
        while (i < L.length && /^\|.*\|\s*$/.test(L[i])) { rows.push(cells(L[i])); i++; }
        out.push('<table><thead><tr>' + head.map(function (c) { return '<th>' + mdInline(c, ctx) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + mdInline(c, ctx) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>'); continue;
      }
      para.push(l.trim()); i++;
    }
    flush(); return out.join('\n');
  }
  function fmtDay(s) {
    var p = String(s || '').split('-'), M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return p.length === 3 ? (+p[2]) + ' ' + M[+p[1] - 1] + ' ' + p[0] : '';
  }
  function noteList(d) {
    var used = {}, list = (d.notes || []).filter(function (n) { return n.title; }).map(function (n) {
      var s = slugify(n.title), k = s, j = 2; while (used[k]) k = s + '-' + (j++); used[k] = 1;
      return {s: k, t: n.title, f: String(n.folder || 'Unsorted').trim() || 'Unsorted', tags: n.tags || '', u: n.updated || '', body: n.body || ''};
    });
    return list;
  }
  function notes(d) {
    var P = d.profile, list = noteList(d), byKey = {}, links = [], back = {};
    list.forEach(function (n) { byKey[n.t.toLowerCase()] = n; byKey[n.s] = n; });
    var tops = [];
    list.forEach(function (n) { var t = n.f.split('/')[0].trim(); if (tops.indexOf(t) < 0) tops.push(t); });
    tops.sort(function (a, b) { return a.localeCompare(b, undefined, {numeric: true}); });
    list.forEach(function (n) {
      n.html = md(n.body, {wiki: function (t, label) {
        var to = byKey[t.toLowerCase()] || byKey[slugify(t)];
        if (!to) return '<span class="wl missing" title="Not written yet">' + esc(label) + '</span>';
        if (to !== n) { links.push([n.s, to.s]); back[to.s] = back[to.s] || []; if (back[to.s].indexOf(n) < 0) back[to.s].push(n); }
        return '<a class="wl" href="#' + to.s + '">' + esc(label) + '</a>';
      }});
    });
    // folder tree: "A / B / C" nests as deep as you like
    var root = {kids: {}, notes: []};
    list.forEach(function (n) {
      var node = root;
      n.f.split('/').map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (seg) { node = node.kids[seg] = node.kids[seg] || {kids: {}, notes: []}; });
      node.notes.push(n);
    });
    function count(node) { var c = node.notes.length; for (var k in node.kids) c += count(node.kids[k]); return c; }
    function tree(node, depth) {
      var keys = Object.keys(node.kids).sort(function (a, b) { return a.localeCompare(b, undefined, {numeric: true}); });
      return '<ul>' + keys.map(function (k) {
        var c = node.kids[k];
        return '<li class="nt-dir"><details' + (depth === 0 ? ' open' : '') + '><summary>' + esc(k) + ' <span>' + count(c) + '</span></summary>' + tree(c, depth + 1) + '</details></li>';
      }).join('') + node.notes.slice().sort(function (a, b) { return a.t.localeCompare(b.t, undefined, {numeric: true}); }).map(function (n) {
        return '<li><a href="#' + n.s + '" data-s="' + n.s + '">' + esc(n.t) + '</a></li>';
      }).join('') + '</ul>';
    }
    var title = 'Notes | ' + P.name, desc = 'Working notes by ' + P.name + ' on chip design, VLSI, computer architecture and more.';
    var h = [];
    h.push('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="color-scheme" content="light">');
    h.push('<title>' + esc(title) + '</title>\n<meta name="description" content="' + esc(desc) + '">\n<meta name="author" content="' + esc(P.name) + '">');
    h.push('<link rel="canonical" href="' + SITE + 'notes.html">\n<link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml">');
    h.push('<meta property="og:title" content="' + esc(title) + '">\n<meta property="og:description" content="' + esc(desc) + '">\n<meta property="og:url" content="' + SITE + 'notes.html">\n<meta property="og:image" content="' + SITE + 'photo.jpg">');
    h.push('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
    h.push('<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter+Tight:wght@700;800&display=swap" rel="stylesheet">');
    h.push('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">\n<link rel="stylesheet" href="style.css">\n</head>\n<body class="nt-page">');
    h.push('<div class="nt-app" id="nt-app">');
    h.push('<header class="nt-top"><button class="nt-btn" id="nt-t-side" type="button" aria-pressed="true">Sidebar</button>' +
      '<a class="nt-home" href="./">' + esc(P.name) + '</a><span class="nt-sep">/</span><a class="nt-title" href="#">Notes</a>' +
      '<input id="nt-q" type="search" placeholder="Search notes" aria-label="Search notes"><button class="nt-btn" id="nt-t-graph" type="button" aria-pressed="true">Graph</button></header>');
    h.push('<aside class="nt-side" id="nt-side" aria-label="All notes"><div class="nt-tree">' + tree(root, 0) + '</div></aside>');
    h.push('<div class="nt-gpane" id="nt-gpane"><canvas id="nt-graph" aria-label="Graph of how notes link to each other"></canvas><p class="nt-hint">Scroll to zoom &middot; drag to move &middot; click a dot to open</p></div>');
    h.push('<main class="nt-main" id="nt-main"><div class="nt-read">');
    var recent = list.slice().sort(function (a, b) { return (b.u || '').localeCompare(a.u || ''); }).slice(0, 8);
    h.push('<div class="nt-view" id="nt-home"><h1>Notes</h1><p class="nt-meta">' + list.length + ' notes. Pick one from the sidebar, or click a dot in the graph. Lines show which notes link to each other.</p>' +
      (recent.length ? '<h4 class="nt-h">Recently updated</h4><ul class="nt-list">' + recent.map(function (n) { return '<li><a href="#' + n.s + '">' + esc(n.t) + '</a><span class="when">' + esc(fmtDay(n.u)) + '</span></li>'; }).join('') + '</ul>' : '') +
      '<p class="nt-back-home"><a href="./">&larr; Back to ' + esc(P.name) + '</a></p></div>');
    list.forEach(function (n) {
      var tags = String(n.tags).split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      var b = back[n.s] || [];
      h.push('<article class="nt-view" id="n-' + n.s + '" hidden><p class="nt-path">' + n.f.split('/').map(function (x) { return esc(x.trim()); }).filter(Boolean).join(' &rsaquo; ') + '</p><h1>' + esc(n.t) + '</h1>' +
        '<p class="nt-meta">' + (n.u ? 'Updated ' + esc(fmtDay(n.u)) : '') + (tags.length ? ' &nbsp;' + tags.map(function (t) { return '<span class="nt-tag">' + esc(t) + '</span>'; }).join('') : '') + '</p>' +
        '<div class="nt-body">' + n.html + '</div>' +
        (b.length ? '<div class="nt-back"><h4>Linked from</h4><ul>' + b.map(function (x) { return '<li><a href="#' + x.s + '">' + esc(x.t) + '</a></li>'; }).join('') + '</ul></div>' : '') + '</article>');
    });
    h.push('</div></main>\n</div>');
    var idx = {}; list.forEach(function (n, i) { idx[n.s] = i; });
    var seen = {}, E = [];
    links.forEach(function (e) { var a = idx[e[0]], b = idx[e[1]], k = Math.min(a, b) + '-' + Math.max(a, b); if (!seen[k]) { seen[k] = 1; E.push([a, b]); } });
    var G = {nodes: list.map(function (n) { return {s: n.s, t: n.t, f: tops.indexOf(n.f.split('/')[0].trim())}; }), links: E};
    h.push('<script>window.NT_GRAPH = ' + JSON.stringify(G).replace(/</g, '\\u003c') + ';</script>');
    h.push('<script src="notes.js"></script>');
    h.push('<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>');
    h.push('<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" onload="window.ntMath && window.ntMath()"></script>');
    h.push('</body>\n</html>\n');
    return h.join('\n');
  }

  var api = {page: page, notes: notes, badge: badge, favicon: favicon, llms: llms, sitemap: sitemap, names: NAMES};
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.YSBuild = api;
})(this);
