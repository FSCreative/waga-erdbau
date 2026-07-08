'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { q, getSettings, setSetting, DEFAULT_SETTINGS, UPLOAD_DIR } = require('./lib/db');
const util = require('./lib/util');
const pages = require('./views/pages');
const admin = require('./views/admin');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'waga2026';
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, body, headers = {}) {
  const h = { 'Content-Type': 'text/html; charset=utf-8', ...headers };
  res.writeHead(status, h);
  res.end(body);
}
function redirect(res, to, headers = {}) {
  res.writeHead(302, { Location: to, ...headers });
  res.end();
}

function serveStatic(req, res, urlPath) {
  // /uploads/* comes from the data dir (admin uploads), everything else from /public
  let base = PUBLIC_DIR;
  let rel = urlPath;
  if (urlPath.startsWith('/uploads/')) {
    base = UPLOAD_DIR;
    rel = urlPath.slice('/uploads/'.length);
  }
  const filePath = path.join(base, path.normalize(rel).replace(/^([.][.][/\\])+/, ''));
  if (!filePath.startsWith(base)) return false;
  let st;
  try { st = fs.statSync(filePath); } catch { return false; }
  if (!st.isFile()) return false;
  const ext = path.extname(filePath).toLowerCase();
  const cache = urlPath.startsWith('/assets/') || urlPath.startsWith('/uploads/') ? 'public, max-age=86400' : 'public, max-age=300';
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': cache });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

function saveUpload(file) {
  const ext = (path.extname(file.filename || '').toLowerCase() || '.jpg').replace(/[^.a-z0-9]/g, '');
  const ok = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  const safeExt = ok.includes(ext) ? ext : '.jpg';
  const name = Date.now() + '-' + crypto.randomBytes(4).toString('hex') + safeExt;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), file.data);
  return '/uploads/' + name;
}

async function handle(req, res) {
  const u = new URL(req.url, 'http://x');
  const p = decodeURIComponent(u.pathname);
  const method = req.method;
  const settings = getSettings();

  // ---------- static ----------
  if (method === 'GET' && (p.startsWith('/css/') || p.startsWith('/js/') || p.startsWith('/assets/') || p.startsWith('/uploads/') || p === '/favicon.svg' || p === '/robots.txt')) {
    if (serveStatic(req, res, p)) return;
    return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
  }

  // ---------- public pages ----------
  if (method === 'GET') {
    if (p === '/') return send(res, 200, pages.indexPage({ settings, projects: q.projects.all(), posts: q.posts.allPublished() }));
    if (p === '/leistungen') return send(res, 200, pages.leistungenPage({ settings }));
    if (p === '/projekte') return send(res, 200, pages.projektePage({ settings, projects: q.projects.all(), categories: q.projects.categories() }));
    if (p === '/ueber-mich' || p === '/über-mich') return send(res, 200, pages.ueberMichPage({ settings }));
    if (p === '/berichte') return send(res, 200, pages.berichtePage({ settings, posts: q.posts.allPublished() }));
    if (p.startsWith('/berichte/')) {
      const post = q.posts.bySlug(p.slice('/berichte/'.length));
      if (post && post.published) return send(res, 200, pages.berichtPage({ settings, post }));
    }
    if (p === '/kontakt') return send(res, 200, pages.kontaktPage({ settings }));
    if (p === '/health') return send(res, 200, 'ok', { 'Content-Type': 'text/plain' });
  }

  // ---------- contact form ----------
  if (method === 'POST' && p === '/kontakt') {
    const body = await util.readBody(req, 200 * 1024);
    const f = util.parseForm(body.toString('utf8'));
    if ((f.message || '').trim() || (f.name || '').trim()) {
      q.inquiries.create({
        name: (f.name || '').slice(0, 200), email: (f.email || '').slice(0, 200),
        phone: (f.phone || '').slice(0, 100), address: (f.address || '').slice(0, 300),
        subject: (f.subject || '').slice(0, 300), message: (f.message || '').slice(0, 5000),
      });
    }
    if ((req.headers.accept || '').includes('application/json')) {
      return send(res, 200, JSON.stringify({ ok: true }), { 'Content-Type': 'application/json' });
    }
    return redirect(res, '/kontakt?gesendet=1');
  }

  // ---------- admin ----------
  if (p === '/admin/login') {
    if (method === 'GET') return send(res, 200, admin.loginPage({}));
    if (method === 'POST') {
      const body = await util.readBody(req, 10 * 1024);
      const f = util.parseForm(body.toString('utf8'));
      const a = Buffer.from(String(f.password || ''));
      const b = Buffer.from(ADMIN_PASSWORD);
      const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
      if (ok) return redirect(res, '/admin', { 'Set-Cookie': util.adminCookie() });
      return send(res, 401, admin.loginPage({ error: 'Falsches Passwort.' }));
    }
  }

  if (p === '/admin' || p.startsWith('/admin/')) {
    if (!util.isAdmin(req)) return p === '/admin' && method === 'GET' ? send(res, 200, admin.loginPage({})) : redirect(res, '/admin');
    const unread = q.inquiries.unreadCount();

    if (method === 'POST' && p === '/admin/logout') return redirect(res, '/', { 'Set-Cookie': util.clearAdminCookie() });

    if (method === 'GET' && p === '/admin') {
      return send(res, 200, admin.dashboard({
        stats: { posts: q.posts.all().length, projects: q.projects.all().length, inquiries: q.inquiries.all().length },
        unread,
      }));
    }

    // --- Berichte ---
    if (p === '/admin/berichte' && method === 'GET') return send(res, 200, admin.postsPage({ posts: q.posts.all(), unread }));
    if (p === '/admin/berichte/neu' && method === 'GET') return send(res, 200, admin.postEditPage({ post: null, unread }));

    if ((p === '/admin/berichte/neu' || p.match(/^\/admin\/berichte\/\d+$/)) && method === 'POST') {
      const buf = await util.readBody(req);
      const { fields, files } = util.parseMultipart(buf, req.headers['content-type']);
      let image = fields.image || '';
      const file = files.find((f) => f.field === 'imagefile' && f.data.length > 0);
      if (file) image = saveUpload(file);
      const isNew = p.endsWith('/neu');
      const id = isNew ? null : Number(p.split('/').pop());
      const title = (fields.title || 'Ohne Titel').slice(0, 300);
      let slug = util.slugify(title);
      const existing = q.posts.bySlug(slug);
      if (existing && existing.id !== id) slug = slug + '-' + Date.now().toString(36);
      const data = {
        id, title, slug,
        excerpt: (fields.excerpt || '').slice(0, 1000),
        body: fields.body || '',
        image,
        published: fields.published ? 1 : 0,
      };
      if (isNew) q.posts.create(data); else if (q.posts.byId(id)) { data.slug = q.posts.byId(id).slug; q.posts.update(data); }
      return redirect(res, '/admin/berichte');
    }
    let m = p.match(/^\/admin\/berichte\/(\d+)\/loeschen$/);
    if (m && method === 'POST') { q.posts.delete(Number(m[1])); return redirect(res, '/admin/berichte'); }
    m = p.match(/^\/admin\/berichte\/(\d+)$/);
    if (m && method === 'GET') {
      const post = q.posts.byId(Number(m[1]));
      if (post) return send(res, 200, admin.postEditPage({ post, unread }));
    }

    // --- Fotos / Projekte ---
    if (p === '/admin/fotos' && method === 'GET') return send(res, 200, admin.fotosPage({ projects: q.projects.all(), unread }));
    if ((p === '/admin/fotos/neu' || p.match(/^\/admin\/fotos\/\d+$/)) && method === 'POST') {
      const buf = await util.readBody(req);
      const { fields, files } = util.parseMultipart(buf, req.headers['content-type']);
      const file = files.find((f) => f.field === 'imagefile' && f.data.length > 0);
      const isNew = p.endsWith('/neu');
      const id = isNew ? null : Number(p.split('/').pop());
      const prev = id ? q.projects.byId(id) : null;
      const data = {
        id,
        title: (fields.title || 'Ohne Titel').slice(0, 300),
        description: (fields.description || '').slice(0, 1000),
        category: (fields.category || 'Erdbau').slice(0, 100) || 'Erdbau',
        image: file ? saveUpload(file) : (prev ? prev.image : ''),
        sort: Number(fields.sort || 0) || 0,
      };
      if (isNew) { if (data.image) q.projects.create(data); } else if (prev) q.projects.update(data);
      return redirect(res, '/admin/fotos');
    }
    m = p.match(/^\/admin\/fotos\/(\d+)\/loeschen$/);
    if (m && method === 'POST') { q.projects.delete(Number(m[1])); return redirect(res, '/admin/fotos'); }

    // --- Texte ---
    if (p === '/admin/texte' && method === 'GET') return send(res, 200, admin.textePage({ settings, unread }));
    if (p === '/admin/texte' && method === 'POST') {
      const body = await util.readBody(req, 500 * 1024);
      const f = util.parseForm(body.toString('utf8'));
      for (const key of Object.keys(DEFAULT_SETTINGS)) if (key in f) setSetting(key, f[key]);
      return send(res, 200, admin.textePage({ settings: getSettings(), unread, flash: 'Texte gespeichert – die Website ist sofort aktuell.' }));
    }

    // --- Anfragen ---
    if (p === '/admin/anfragen' && method === 'GET') return send(res, 200, admin.anfragenPage({ inquiries: q.inquiries.all(), unread }));
    m = p.match(/^\/admin\/anfragen\/(\d+)\/gelesen$/);
    if (m && method === 'POST') { q.inquiries.markRead(Number(m[1])); return redirect(res, '/admin/anfragen'); }
    m = p.match(/^\/admin\/anfragen\/(\d+)\/loeschen$/);
    if (m && method === 'POST') { q.inquiries.delete(Number(m[1])); return redirect(res, '/admin/anfragen'); }
  }

  return send(res, 404, pages.notFoundPage({ settings }));
}

http.createServer((req, res) => {
  handle(req, res).catch((err) => {
    console.error(err);
    try { send(res, 500, 'Interner Fehler'); } catch {}
  });
}).listen(PORT, () => {
  console.log(`WAGA Erdbau läuft auf Port ${PORT}`);
  if (!process.env.ADMIN_PASSWORD) console.warn('⚠ ADMIN_PASSWORD nicht gesetzt – Standardpasswort aktiv!');
});
