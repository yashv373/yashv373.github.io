/* Website editor backend: reads from GitHub, keeps drafts, publishes everything as one commit.
   Works from any computer: all real data lives in the repo; this browser only remembers the token and unsent drafts. */
(function (root) {
  var REPO = 'yashv373/yashv373.github.io', BRANCH = 'main', API = 'https://api.github.com/repos/' + REPO;

  function Core(opts) {
    this.token = opts.token || '';
    this.B = opts.build || root.YSBuild;
    this.fetch = opts.fetch || root.fetch.bind(root);
    this.onProgress = opts.onProgress || function () {};
    this.files = {};
  }

  Core.prototype.req = function (method, path, body, raw) {
    var h = {Accept: raw ? 'application/vnd.github.raw' : 'application/vnd.github+json'};
    if (this.token) h.Authorization = 'Bearer ' + this.token;
    if (body) h['Content-Type'] = 'application/json';
    return this.fetch(API + path, {method: method, headers: h, body: body ? JSON.stringify(body) : undefined, cache: 'no-store'}).then(function (r) {
      if (r.status === 404 && method === 'GET') return null;
      if (!r.ok) return r.text().then(function (t) {
        var e = new Error(r.status === 401 || r.status === 403 ? 'GitHub refused the token (' + r.status + '). It may be expired or missing "Contents: Read and write".' : method + ' ' + path + ' failed (' + r.status + '): ' + t.slice(0, 160));
        e.status = r.status; throw e;
      });
      return raw ? r.text() : r.json();
    });
  };

  /* check the token can actually write, not just read */
  Core.prototype.checkToken = function () {
    return this.req('GET', '').then(function (repo) {
      if (!repo) throw new Error('Repository not found. Check the token has access to ' + REPO + '.');
      if (repo.permissions && repo.permissions.push === false) throw new Error('This token can read but not write. Set "Contents" to "Read and write".');
      return true;
    });
  };

  Core.prototype.headSha = function () { return this.req('GET', '/git/ref/heads/' + BRANCH).then(function (r) { return r.object.sha; }); };
  Core.prototype.treeOf = function (commitSha) {
    var self = this;
    return self.req('GET', '/git/commits/' + commitSha).then(function (c) {
      return self.req('GET', '/git/trees/' + c.tree.sha + '?recursive=1');
    }).then(function (t) {
      var files = {}; (t.tree || []).forEach(function (e) { if (e.type === 'blob') files[e.path] = e.sha; });
      return files;
    });
  };
  Core.prototype.read = function (path, ref) { return this.req('GET', '/contents/' + path + '?ref=' + ref, null, true); };

  /* git's own id for a file, so we only upload what really changed */
  function blobSha(text) {
    var body = new TextEncoder().encode(text), headBytes = new TextEncoder().encode('blob ' + body.length + '\0');
    var all = new Uint8Array(headBytes.length + body.length); all.set(headBytes, 0); all.set(body, headBytes.length);
    return root.crypto.subtle.digest('SHA-1', all).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  Core.blobSha = blobSha;

  function uniqueIds(notes, B) {
    var used = {};
    notes.forEach(function (n) { if (n.id) { n.id = B.slugify(n.id); if (used[n.id]) n.id = ''; else used[n.id] = 1; } });
    notes.forEach(function (n) {
      if (n.id || !n.title) return;
      var base = B.slugify(n.title), k = base, j = 2; while (used[k]) k = base + '-' + (j++);
      n.id = k; used[k] = 1;
    });
  }
  Core.uniqueIds = uniqueIds;

  /* when a note is renamed, fix every [[link]] that pointed at the old title */
  function applyRenames(notes, original) {
    var renames = [];
    notes.forEach(function (n) { var o = original[n.id]; if (o && n.title && o !== n.title) renames.push([o, n.title]); });
    if (!renames.length) return 0;
    var fixed = 0;
    notes.forEach(function (n) {
      var before = n.body || '', after = before;
      renames.forEach(function (r) {
        var re = new RegExp('\\[\\[\\s*' + r[0].replace(/[.*+?^$(){}|[\]\\]/g, '\\$&') + '\\s*(\\|[^\\]]*)?\\]\\]', 'gi');
        after = after.replace(re, function (m, label) { return '[[' + r[1] + (label || '') + ']]'; });
      });
      if (after !== before) { n.body = after; fixed++; }
    });
    return fixed;
  }
  Core.applyRenames = applyRenames;

  Core.prototype.load = function () {
    var self = this;
    return self.headSha().then(function (sha) {
      self.base = sha; return self.treeOf(sha);
    }).then(function (files) {
      self.files = files;
      return Promise.all(['content.json', 'notes.json', 'notes/index.json'].map(function (p) { return files[p] ? self.read(p, self.base) : Promise.resolve(null); }));
    }).then(function (r) {
      if (!r[0]) throw new Error('content.json is missing from the repository.');
      var content = JSON.parse(r[0]);
      var notes = r[1] ? (JSON.parse(r[1]).notes || []) : (content.notes || []);
      delete content.notes;
      uniqueIds(notes, self.B);
      self.prevIndex = r[2] ? JSON.parse(r[2]) : null;
      self.loaded = {content: self.files['content.json'] || null, notes: self.files['notes.json'] || null};
      self.original = {}; notes.forEach(function (n) { self.original[n.id] = n.title; });
      return {content: content, notes: notes, base: self.base};
    });
  };

  Core.prototype.outputs = function (content, notes) {
    var B = this.B, day = new Date().toISOString().slice(0, 10), out = {};
    var nb = B.notesBuild(content, notes, this.prevIndex);
    Object.keys(nb.files).forEach(function (p) { out[p] = nb.files[p]; });
    out['index.html'] = B.page(content);
    out['llms.txt'] = B.llms(content, notes);
    out['sitemap.xml'] = B.sitemap(content, day, notes);
    out['content.json'] = JSON.stringify(content, null, 2) + '\n';
    out['notes.json'] = JSON.stringify({notes: notes}, null, 2) + '\n';
    return {files: out, index: nb.index};
  };

  /* publish everything in ONE commit; refuses if the site was edited elsewhere in the meantime */
  Core.prototype.publish = function (content, notes, message) {
    var self = this, renamed;
    uniqueIds(notes, self.B);
    renamed = applyRenames(notes, self.original || {});
    var built = self.outputs(content, notes), out = built.files;
    var sitemapNow = out['sitemap.xml'];
    var dels;
    return self.headSha().then(function (head) {
      if (head === self.base) return head;
      return self.treeOf(head).then(function (now) {
        if ((now['content.json'] || null) !== self.loaded.content || (now['notes.json'] || null) !== self.loaded.notes) {
          var e = new Error('The site was changed from somewhere else since you opened the editor. Download a backup, then reload the editor to get the latest version.');
          e.conflict = true; throw e;
        }
        self.files = now; self.base = head; return head;
      });
    }).then(function (head) {
      dels = Object.keys(self.files).filter(function (p) { return /^notes\/[^/]+\.html$/.test(p) && !(p in out); });
      var paths = Object.keys(out);
      return Promise.all(paths.map(function (p) { return blobSha(out[p]); })).then(function (shas) {
        var newSha = {}; paths.forEach(function (p, i) { newSha[p] = shas[i]; });
        // the sitemap date alone is not a reason to publish
        var changed = paths.filter(function (p) { return self.files[p] !== newSha[p]; });
        if (changed.length === 1 && changed[0] === 'sitemap.xml' && !dels.length) changed = [];
        if (!changed.length && !dels.length) return {changed: 0, deleted: 0, renamed: renamed};
        var entries = [], done = 0, total = changed.length + 3, queue = changed.slice();
        function worker() {
          var p = queue.shift(); if (!p) return Promise.resolve();
          return self.req('POST', '/git/blobs', {content: out[p], encoding: 'utf-8'}).then(function (bl) {
            entries.push({path: p, mode: '100644', type: 'blob', sha: bl.sha}); self.onProgress(++done, total); return worker();
          });
        }
        return Promise.all([worker(), worker(), worker(), worker()]).then(function () {
          dels.forEach(function (p) { entries.push({path: p, mode: '100644', type: 'blob', sha: null}); });
          return self.req('GET', '/git/commits/' + head);
        }).then(function (c) { self.onProgress(++done, total); return self.req('POST', '/git/trees', {base_tree: c.tree.sha, tree: entries}); })
          .then(function (t) { self.onProgress(++done, total); return self.req('POST', '/git/commits', {message: message || 'Update website (editor)', tree: t.sha, parents: [head]}); })
          .then(function (c) { return self.req('PATCH', '/git/refs/heads/' + BRANCH, {sha: c.sha}).then(function () { return c.sha; }); })
          .then(function (commit) {
            self.onProgress(total, total);
            self.base = commit;
            changed.forEach(function (p) { self.files[p] = newSha[p]; });
            dels.forEach(function (p) { delete self.files[p]; });
            self.loaded = {content: self.files['content.json'] || null, notes: self.files['notes.json'] || null};
            self.prevIndex = built.index;
            self.original = {}; notes.forEach(function (n) { self.original[n.id] = n.title; });
            return {changed: changed.length, deleted: dels.length, renamed: renamed, commit: commit};
          });
      });
    });
  };

  /* pictures go up straight away (their own small commit), so they are online by the time you publish */
  Core.prototype.uploadFile = function (path, base64, message) {
    var self = this;
    return self.req('GET', '/contents/' + path + '?ref=' + BRANCH).then(function (ex) {
      return self.req('PUT', '/contents/' + path, {message: message || ('Add ' + path), content: base64, branch: BRANCH, sha: ex ? ex.sha : undefined});
    }).then(function (r) {
      self.files[path] = r.content.sha;
      if (r.commit && r.commit.parents && r.commit.parents.length && r.commit.parents[0].sha === self.base) self.base = r.commit.sha;
      return path;
    });
  };

  /* drafts: kept in this browser only, so nothing is lost if the tab closes before publishing */
  var DB = null;
  function db() {
    if (DB) return DB;
    DB = new Promise(function (res, rej) {
      var r = root.indexedDB.open('ys-website-editor', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
      r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
    });
    return DB;
  }
  Core.draft = {
    get: function (k) { return db().then(function (d) { return new Promise(function (res) { var g = d.transaction('kv').objectStore('kv').get(k); g.onsuccess = function () { res(g.result || null); }; g.onerror = function () { res(null); }; }); }).catch(function () { return null; }); },
    set: function (k, v) { return db().then(function (d) { return new Promise(function (res) { var t = d.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = function () { res(true); }; t.onerror = function () { res(false); }; }); }).catch(function () { return false; }); },
    del: function (k) { return db().then(function (d) { return new Promise(function (res) { var t = d.transaction('kv', 'readwrite'); t.objectStore('kv').delete(k); t.oncomplete = function () { res(true); }; t.onerror = function () { res(false); }; }); }).catch(function () { return false; }); }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Core; else root.EditorCore = Core;
})(typeof window !== 'undefined' ? window : globalThis);
