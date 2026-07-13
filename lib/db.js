'use strict';
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'waga.sqlite'));
db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Erdbau',
  image TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// ---------- Settings ----------
const DEFAULT_SETTINGS = {
  site_name: 'WAGA Erdbau',
  hero_kicker: 'Erdbau im Montafon & Umgebung',
  hero_title: 'Wir bewegen\nBerge.',
  hero_subtitle: 'Vom komplexen Großprojekt bis zum kleinen Aushub – mit Bagger und Menzi Muck meistern wir jedes Gelände. Auch das steilste.',
  intro_title: 'Was mache ich?',
  intro_text: 'Seit meinem Weg in die Selbständigkeit habe ich mich auf den Bereich Erdbau spezialisiert und bin bereit, alles in Angriff zu nehmen: von komplexen und großen Bauprojekten bis hin zu kleinen Aushubarbeiten. Mit meinem Fuhrpark bin ich bestens ausgerüstet für Ihre Baustelle.',
  about_title: 'Zu meiner Person',
  about_tagline: 'Präzision. Pünktlichkeit. Der Exzellenz verpflichtet.',
  about_text: 'Wachter Joel – selbständig und spezialisiert auf Grabarbeiten mit Baggern und dem Menzi Muck in allen Geländen.\n\nAufgewachsen bin ich auf knapp 1.000 Höhenmetern im Montafon – daher weiß ich genauestens, wie man aus jedem Gelände das Beste herausholt.',
  services_intro: 'Neben der Spezialisierung auf allerlei Arbeiten im steilen Gelände biete ich auch einfache Grabarbeiten oder Aushübe für diverse Gebäude und Projekte an.',
  machine_1: 'Bagger – Takeuchi',
  machine_2: 'Schreitbagger – Menzi Muck',
  machine_3: 'Toyota Hilux mit Hänger',
  stat_years: '5',
  stat_projects: '120',
  stat_machines: '3',
  stat_altitude: '1000',
  contact_address: 'Saprau 164e, Montafon',
  contact_email: 'waga.erdbau@hotmail.com',
  contact_phone: '0664 387 20 64',
  footer_text: '©2026 WAGA Erdbau – FS Creative',
  legal_impressum: `## Angaben gemäß § 5 ECG und § 25 MedienG

**WAGA Erdbau**
Inhaber: Joel Wachter
Saprau 164e
[PLZ und Ort bitte ergänzen], Österreich

**Kontakt**
Telefon: 0664 387 20 64
E-Mail: waga.erdbau@hotmail.com

**Unternehmensgegenstand:** Erdbau und Erdbewegungsarbeiten

**UID-Nummer:** [bitte ergänzen]
**Gewerbebehörde:** [zuständige Bezirkshauptmannschaft bitte ergänzen]
**Mitgliedschaft:** Wirtschaftskammer Vorarlberg [bitte prüfen]

**Verbraucherstreitbeilegung:** Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: [https://ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr). Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`,
  legal_datenschutz: `## Datenschutzerklärung

Zuletzt aktualisiert: Juli 2026

### 1. Verantwortlicher

WAGA Erdbau, Inhaber Joel Wachter, Saprau 164e, [PLZ und Ort], Österreich
E-Mail: waga.erdbau@hotmail.com, Telefon: 0664 387 20 64

### 2. Allgemeines

Wir verarbeiten personenbezogene Daten ausschließlich im Rahmen der DSGVO und des österreichischen Datenschutzgesetzes (DSG). Diese Website verwendet **keine Analyse- oder Tracking-Dienste**, keine Werbe-Cookies und keine Social-Media-Plugins. Schriftarten und alle weiteren Ressourcen werden **lokal von unserem Server** geladen — es werden keine Verbindungen zu Google Fonts oder anderen Drittanbieter-CDNs aufgebaut.

### 3. Hosting und Server-Logfiles

Diese Website wird bei Railway Corp. (San Francisco, USA) gehostet. Beim Aufruf der Website verarbeitet der Server technisch notwendige Daten (IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browser-Typ) in Logfiles, um den sicheren Betrieb zu gewährleisten (Rechtsgrundlage: berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO). Soweit dabei Daten in die USA übermittelt werden, erfolgt dies auf Grundlage der EU-Standardvertragsklauseln (Art. 46 DSGVO). Logfiles werden nach kurzer Zeit automatisch gelöscht.

### 4. Kontaktformular

Wenn Sie unser Kontaktformular nutzen, verarbeiten wir die von Ihnen angegebenen Daten (Name, E-Mail, Telefon, Adresse/Baustelle, Betreff, Nachricht) ausschließlich zur Bearbeitung Ihrer Anfrage (Rechtsgrundlage: Vertragsanbahnung bzw. Einwilligung, Art. 6 Abs. 1 lit. a und b DSGVO). Die Daten werden auf unserem Server gespeichert und gelöscht, sobald sie für die Bearbeitung nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten bestehen.

### 5. Cookies

Diese Website setzt für Besucherinnen und Besucher **keine Cookies**. Ausschließlich im passwortgeschützten Verwaltungsbereich wird ein technisch notwendiges Session-Cookie verwendet (Rechtsgrundlage: berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO). Dafür ist keine Einwilligung erforderlich.

### 6. Ihre Rechte

Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Wenden Sie sich dazu einfach an die oben genannten Kontaktdaten. Außerdem haben Sie das Recht, sich bei der österreichischen Datenschutzbehörde zu beschweren: Österreichische Datenschutzbehörde, Barichgasse 40–42, 1030 Wien, [www.dsb.gv.at](https://www.dsb.gv.at).`,
};

const getSettingStmt = db.prepare('SELECT value FROM settings WHERE key = ?');
const setSettingStmt = db.prepare(
  'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
);

for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
  if (!getSettingStmt.get(k)) setSettingStmt.run(k, v);
}

function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const out = { ...DEFAULT_SETTINGS };
  for (const r of rows) out[r.key] = r.value;
  return out;
}
function setSetting(key, value) {
  if (!(key in DEFAULT_SETTINGS)) return false;
  setSettingStmt.run(key, String(value));
  return true;
}

// ---------- Seed content ----------
const projectCount = db.prepare('SELECT COUNT(*) AS c FROM projects').get().c;
if (projectCount === 0) {
  const ins = db.prepare(
    'INSERT INTO projects (title, description, category, image, sort) VALUES (?, ?, ?, ?, ?)'
  );
  ins.run('Bohrungen im Steilgelände', 'Präzise Bohrarbeiten mit dem Menzi Muck – auch dort, wo andere nicht hinkommen.', 'Spezialarbeiten', '/assets/img/projekt-bohrung.jpg', 1);
  ins.run('Aushub Einfamilienhaus', 'Kompletter Baugrubenaushub für ein Einfamilienhaus inklusive Abtransport.', 'Aushub', '/assets/img/projekt-aushub.jpg', 2);
  ins.run('Fundamentausgrabung', 'Exakte Fundamentausgrabung für einen Neubau – termingerecht und sauber.', 'Aushub', '/assets/img/projekt-fundament.jpg', 3);
  ins.run('Bohrungen am Hang', 'Bohrungen und Verankerungsarbeiten in extremem Gelände im Montafon.', 'Spezialarbeiten', '/assets/img/projekt-bohrung-2.jpg', 4);
}

const postCount = db.prepare('SELECT COUNT(*) AS c FROM posts').get().c;
if (postCount === 0) {
  db.prepare(
    'INSERT INTO posts (title, slug, excerpt, body, image, published) VALUES (?, ?, ?, ?, ?, 1)'
  ).run(
    'Willkommen auf der neuen Website',
    'willkommen',
    'WAGA Erdbau hat eine neue Website – moderner, schneller und mit Baustellen-Berichten direkt aus dem Montafon.',
    'Herzlich willkommen auf der neuen Website von **WAGA Erdbau**!\n\nHier berichte ich ab sofort regelmäßig von aktuellen Baustellen und Projekten – vom Aushub im Tal bis zur Bohrung im steilsten Gelände.\n\n## Was Sie hier finden\n\n- Aktuelle Projektberichte mit Fotos\n- Einblicke in den Maschinenpark\n- Neuigkeiten rund um WAGA Erdbau\n\nSchauen Sie regelmäßig vorbei – oder kontaktieren Sie mich direkt für ein unverbindliches Angebot.',
    '/assets/img/projekt-aushub.jpg'
  );
}

// ---------- Helpers ----------
const q = {
  posts: {
    allPublished: () => db.prepare("SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC, id DESC").all(),
    all: () => db.prepare('SELECT * FROM posts ORDER BY created_at DESC, id DESC').all(),
    bySlug: (slug) => db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug),
    byId: (id) => db.prepare('SELECT * FROM posts WHERE id = ?').get(id),
    create: (p) => db.prepare('INSERT INTO posts (title, slug, excerpt, body, image, published) VALUES (?, ?, ?, ?, ?, ?)').run(p.title, p.slug, p.excerpt, p.body, p.image, p.published),
    update: (p) => db.prepare('UPDATE posts SET title=?, slug=?, excerpt=?, body=?, image=?, published=? WHERE id=?').run(p.title, p.slug, p.excerpt, p.body, p.image, p.published, p.id),
    delete: (id) => db.prepare('DELETE FROM posts WHERE id = ?').run(id),
  },
  projects: {
    all: () => db.prepare('SELECT * FROM projects ORDER BY sort ASC, id ASC').all(),
    byId: (id) => db.prepare('SELECT * FROM projects WHERE id = ?').get(id),
    categories: () => db.prepare('SELECT DISTINCT category FROM projects ORDER BY category').all().map((r) => r.category),
    create: (p) => db.prepare('INSERT INTO projects (title, description, category, image, sort) VALUES (?, ?, ?, ?, ?)').run(p.title, p.description, p.category, p.image, p.sort),
    update: (p) => db.prepare('UPDATE projects SET title=?, description=?, category=?, image=?, sort=? WHERE id=?').run(p.title, p.description, p.category, p.image, p.sort, p.id),
    delete: (id) => db.prepare('DELETE FROM projects WHERE id = ?').run(id),
  },
  inquiries: {
    all: () => db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC, id DESC').all(),
    unreadCount: () => db.prepare('SELECT COUNT(*) AS c FROM inquiries WHERE read = 0').get().c,
    create: (i) => db.prepare('INSERT INTO inquiries (name, email, phone, address, subject, message) VALUES (?, ?, ?, ?, ?, ?)').run(i.name, i.email, i.phone, i.address, i.subject, i.message),
    markRead: (id) => db.prepare('UPDATE inquiries SET read = 1 WHERE id = ?').run(id),
    delete: (id) => db.prepare('DELETE FROM inquiries WHERE id = ?').run(id),
  },
};

module.exports = { db, q, getSettings, setSetting, DEFAULT_SETTINGS, DATA_DIR, UPLOAD_DIR };
