'use strict';
const crypto = require('node:crypto');

function esc(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function nl2br(s) {
  return esc(s).replaceAll('\n', '<br>');
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replaceAll('ä', 'ae').replaceAll('ö', 'oe').replaceAll('ü', 'ue').replaceAll('ß', 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'beitrag';
}

function formatDate(iso) {
  try {
    const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z');
    return d.toLocaleDateString('de-AT', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

// --- Tiny Markdown renderer (headings, bold, italic, links, images, lists, paragraphs) ---
function inlineMd(s) {
  let t = esc(s);
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return t;
}

function markdown(src) {
  const lines = String(src || '').replaceAll('\r\n', '\n').split('\n');
  const out = [];
  let para = [];
  let list = null;
  const flushPara = () => {
    if (para.length) { out.push('<p>' + para.map(inlineMd).join('<br>') + '</p>'); para = []; }
  };
  const flushList = () => {
    if (list) { out.push('<ul>' + list.map((li) => '<li>' + inlineMd(li) + '</li>').join('') + '</ul>'); list = null; }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    const li = line.match(/^[-*]\s+(.*)$/);
    if (!line.trim()) { flushPara(); flushList(); continue; }
    if (h) { flushPara(); flushList(); const lvl = Math.min(h[1].length + 1, 5); out.push(`<h${lvl}>` + inlineMd(h[2]) + `</h${lvl}>`); continue; }
    if (li) { flushPara(); (list ||= []).push(li[1]); continue; }
    flushList();
    para.push(line);
  }
  flushPara(); flushList();
  return out.join('\n');
}

// --- Signed session cookies ---
const SECRET = process.env.SESSION_SECRET || 'waga-dev-secret-change-me';

function sign(value) {
  const mac = crypto.createHmac('sha256', SECRET).update(value).digest('base64url');
  return value + '.' + mac;
}
function unsign(signed) {
  if (!signed) return null;
  const idx = signed.lastIndexOf('.');
  if (idx < 0) return null;
  const value = signed.slice(0, idx);
  const expected = sign(value);
  const a = Buffer.from(signed), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return value;
}

function parseCookies(req) {
  const out = {};
  const h = req.headers.cookie;
  if (!h) return out;
  for (const part of h.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function isAdmin(req) {
  const cookies = parseCookies(req);
  const v = unsign(cookies['waga_admin']);
  return v === 'admin';
}

function adminCookie() {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  return `waga_admin=${encodeURIComponent(sign('admin'))}; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
}
function clearAdminCookie() {
  return 'waga_admin=; Path=/; HttpOnly; Max-Age=0';
}

function parseForm(body) {
  const out = {};
  for (const pair of String(body).split('&')) {
    if (!pair) continue;
    const i = pair.indexOf('=');
    const k = decodeURIComponent((i < 0 ? pair : pair.slice(0, i)).replaceAll('+', ' '));
    const v = i < 0 ? '' : decodeURIComponent(pair.slice(i + 1).replaceAll('+', ' '));
    out[k] = v;
  }
  return out;
}

// --- Minimal multipart/form-data parser ---
function parseMultipart(buffer, contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '');
  if (!m) return { fields: {}, files: [] };
  const boundary = Buffer.from('--' + (m[1] || m[2]).trim());
  const fields = {};
  const files = [];
  let pos = buffer.indexOf(boundary);
  while (pos !== -1) {
    const start = pos + boundary.length;
    if (buffer.slice(start, start + 2).toString() === '--') break;
    const headEnd = buffer.indexOf('\r\n\r\n', start);
    if (headEnd === -1) break;
    const head = buffer.slice(start, headEnd).toString('utf8');
    const next = buffer.indexOf(boundary, headEnd);
    if (next === -1) break;
    const content = buffer.slice(headEnd + 4, next - 2); // strip trailing \r\n
    const nameM = /name="([^"]*)"/i.exec(head);
    const fileM = /filename="([^"]*)"/i.exec(head);
    const typeM = /content-type:\s*([^\r\n]+)/i.exec(head);
    const name = nameM ? nameM[1] : '';
    if (fileM && fileM[1]) {
      files.push({ field: name, filename: fileM[1], contentType: typeM ? typeM[1].trim() : 'application/octet-stream', data: content });
    } else if (name) {
      fields[name] = content.toString('utf8');
    }
    pos = next;
  }
  return { fields, files };
}

function readBody(req, limit = 20 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('payload too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = { esc, nl2br, slugify, formatDate, markdown, sign, unsign, parseCookies, isAdmin, adminCookie, clearAdminCookie, parseForm, parseMultipart, readBody };
