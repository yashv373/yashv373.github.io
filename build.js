/* Builds index.html from content.json. Used by admin.html (in the browser). */
(function (root) {
  var SITE = 'https://yashv373.github.io/';
  var MONO_DARK = 'M0.5 99 0.5 110.5 12 122 88.5 122 100 110.5 100 90 89 79 45 79 45 93.5 84 94 85.5 95.5 85.5 105 85 106 83 107 17.5 107 15 105 15 99ZM65 65.5 83.5 65.5 85.5 67.5 85.5 73.5 100 73.5 100 62 88.5 50.5 79.5 50.5ZM24.5 50.5 12 50.5 0.5 62.5 0.5 82 12 93.5 24.5 93.5 24.5 79 17.5 79 15 76.5 15.5 66 17 65.5 24.5 65.5ZM91.5 0 70.5 0 27.5 43 27.5 104 42.5 104 42.5 49.5ZM0 0 33 33.5 43.5 23 21 0Z';
  var MONO_ORANGE = 'M94 32 77 32 55 53.5 54.5 41 45 50.5 45.5 66 52.5 73.5Z';
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
    var dl = (n.place ? n.place.toUpperCase() + ', ' : '') + (n.date || '');
    return '<article class="story">' + logoCol(n.logo, 'lg') + '<div><h3>' + inline(n.headline) + '</h3><p>' +
      (dl ? '<span class="dateline">' + esc(dl) + '</span> &mdash; ' : '') + inline(n.text) + '</p></div></article>\n';
  }

  function authorsList(s) {
    return String(s || '').replace(/\([^)]*\)/g, '').split(/,| and /).map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function jsonld(d) {
    var me = SITE + '#person';
    var graph = [
      {'@type': 'ProfilePage', '@id': SITE + '#page', url: SITE, name: d.profile.name, mainEntity: {'@id': me}},
      {'@type': 'Person', '@id': me, name: d.profile.name, givenName: 'Yashvardhan', familyName: 'Singh', url: SITE,
        image: SITE + 'photo.jpg', email: 'mailto:' + d.profile.email, jobTitle: 'Digital Integrated Circuit Design Engineer',
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
    var contact = [['email', 'mailto:' + P.email], ['github', P.github], ['google scholar', P.scholar], ['linkedin', P.linkedin], ['cv', P.cv]]
      .filter(function (x) { return x[1] && x[1] !== 'mailto:'; })
      .map(function (x) { return '<a href="' + esc(x[1]) + '">' + x[0] + '</a>'; }).join(' / ');
    var bio = String(P.bio || '').split(/\n\s*\n/).map(function (p) { return '<p>' + inline(p.trim()) + '</p>'; }).join('\n');
    var h = [];
    h.push('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="color-scheme" content="light">');
    h.push('<title>' + esc(title) + '</title>');
    h.push('<meta name="description" content="' + esc(desc) + '">');
    h.push('<meta name="author" content="' + esc(P.name) + '">\n<meta name="robots" content="index, follow, max-image-preview:large">');
    h.push('<link rel="canonical" href="' + SITE + '">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/photo.jpg">');
    h.push('<link rel="alternate" type="text/plain" href="/llms.txt" title="Plain-text summary for AI assistants">');
    h.push('<meta property="og:type" content="profile">\n<meta property="og:site_name" content="' + esc(P.name) + '">\n<meta property="og:title" content="' + esc(title) + '">');
    h.push('<meta property="og:description" content="' + esc(desc) + '">\n<meta property="og:url" content="' + SITE + '">\n<meta property="og:image" content="' + SITE + 'photo.jpg">');
    h.push('<meta property="og:image:alt" content="' + esc(P.name) + '">\n<meta property="profile:first_name" content="Yashvardhan">\n<meta property="profile:last_name" content="Singh">');
    h.push('<meta name="twitter:card" content="summary">\n<meta name="twitter:title" content="' + esc(title) + '">\n<meta name="twitter:description" content="' + esc(desc) + '">\n<meta name="twitter:image" content="' + SITE + 'photo.jpg">');
    h.push('<script type="application/ld+json">\n' + jsonld(d) + '\n</script>');
    h.push('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
    h.push('<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=UnifrakturCook:wght@700&display=swap" rel="stylesheet">');
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
    h.push('<div class="paper-top"><div class="ear">All the Silicon That\'s Fit to Print</div><p class="masthead">The Yashvardhan Times</p><div class="ear right">Late Edition<br>' + esc(P.updated) + '</div></div>');
    h.push('<div class="paper-bar"><span>Vol. III</span><span>Manipal &middot; Greater Noida &middot; New Delhi</span><span>&#8377;0.00</span></div>');
    h.push('<div class="stories" tabindex="0" aria-label="News stories">\n' + (d.news || []).map(story).join('') + '</div>');
    h.push('<div class="paper-foot">Scroll for earlier editions</div>\n</div>');
    var oa = gallery(d.outAndAbout);
    if (oa) h.push('<div class="photoblock"><h4>Out and about</h4>' + oa + '</div>');
    h.push('</section>');
    h.push('\n<footer>' + badge('badge') + '<div><a class="admin-link" href="admin.html">' + esc(P.name) + '</a><br>Last updated ' + esc(P.updated) + '.</div></footer>\n</main>');
    h.push('<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Photo viewer"><span class="lb-count" id="lb-count"></span><button class="lb-close" id="lb-close" aria-label="Close">&times;</button><button class="lb-prev" id="lb-prev" aria-label="Previous photo">&lsaquo;</button><figure><img id="lb-img" alt=""><figcaption id="lb-cap"></figcaption></figure><button class="lb-next" id="lb-next" aria-label="Next photo">&rsaquo;</button></div>');
    h.push('<script src="site.js"></script>\n</body>\n</html>\n');
    return h.join('\n');
  }

  var api = {page: page, badge: badge, favicon: favicon, names: NAMES};
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.YSBuild = api;
})(this);
