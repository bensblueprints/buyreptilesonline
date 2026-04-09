// Downloads ONE image for the next product that needs one, then exits.
// Designed to be called by cron/launchd every few seconds.

const dbPromise = require('./db');
const fs = require('fs');
const path = require('path');
const https = require('https');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const LOG_FILE = path.join(__dirname, 'image-cron.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG_FILE, line);
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'TheReptilePlug/1.0 (educational project; contact@buyreptilesonline.com)' }, timeout: 10000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode === 429) return reject(new Error('RATE_LIMITED'));
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('Parse error')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'TheReptilePlug/1.0' }, timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(true); });
      stream.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function searchWikimedia(query) {
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=8&format=json`;
  const result = await fetchJSON(searchUrl);
  if (!result.query?.search?.length) return null;

  for (const item of result.query.search) {
    const titleLower = item.title.toLowerCase();
    if (titleLower.includes('map') || titleLower.includes('distribution') || titleLower.includes('logo') || titleLower.includes('diagram') || titleLower.includes('chart')) continue;

    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(item.title)}&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=800&format=json`;
    const info = await fetchJSON(infoUrl);
    const page = Object.values(info.query.pages)[0];

    if (page.imageinfo?.[0]) {
      const img = page.imageinfo[0];
      if ((img.mime === 'image/jpeg' || img.mime === 'image/png') && img.size > 10000) {
        return img.thumburl || img.url;
      }
    }
  }
  return null;
}

async function findImage(name) {
  const cleanName = name.replace(/\b(cb|Baby|Adult|Captive Bred|Normal|for Sale)\b/gi, '').replace(/\s+/g, ' ').trim();
  const baseName = cleanName.replace(/\b(Albino|Leucistic|Melanoid|Piebald|Pastel|Fire|Ghost|Snow|Blizzard|Hypo|Super|Giant|Motley|Tessera|Sunkissed|Crimson|Blood Red|Lavender|Ultra|Enigma|Tangerine|Sunglow|Pinstripe|Mack|Blazing|Woma|Spinner|Spider|Yellow Bellied|Black Pastel|Banana|Orange|High White|Red|Citrus|Translucent|Leatherback|Zero|Witblits|Fantasy|Strawberry|Ornate|Cherry Head|Flame|Harlequin|Dalmatian|Lilly White)\b/gi, '').replace(/\s+/g, ' ').trim();

  const queries = [...new Set([cleanName, baseName, cleanName + ' reptile', baseName + ' animal'].filter(q => q.length > 3))];

  for (const query of queries) {
    try {
      const url = await searchWikimedia(query);
      if (url) return url;
    } catch(e) {
      if (e.message === 'RATE_LIMITED') throw e; // bubble up rate limits
    }
  }
  return null;
}

// Track failed attempts so we don't retry endlessly
const FAILED_FILE = path.join(__dirname, 'image-failed.json');
function getFailedIds() {
  try { return JSON.parse(fs.readFileSync(FAILED_FILE, 'utf-8')); }
  catch(e) { return {}; }
}
function markFailed(id) {
  const failed = getFailedIds();
  failed[id] = (failed[id] || 0) + 1;
  fs.writeFileSync(FAILED_FILE, JSON.stringify(failed));
}

async function main() {
  const db = await dbPromise;
  const failed = getFailedIds();

  // Get one product without an image, skip ones that failed 3+ times
  const products = db.prepare("SELECT id, name FROM products WHERE (image IS NULL OR image = '') ORDER BY id").all();
  const product = products.find(p => (failed[p.id] || 0) < 3);

  if (!product) {
    // Check if truly done or all exhausted
    const remaining = products.length;
    const exhausted = products.filter(p => (failed[p.id] || 0) >= 3).length;
    if (remaining === 0) {
      log('ALL DONE - every product has an image');
    } else {
      log(`EXHAUSTED - ${exhausted} products tried 3+ times, ${remaining} still without images`);
    }
    process.exit(0);
  }

  try {
    const imageUrl = await findImage(product.name);
    if (imageUrl) {
      const filename = `product_${product.id}.jpg`;
      const destPath = path.join(UPLOADS_DIR, filename);
      await downloadFile(imageUrl, destPath);
      const stats = fs.statSync(destPath);
      if (stats.size > 5000) {
        db.prepare('UPDATE products SET image = ? WHERE id = ?').run(`/uploads/${filename}`, product.id);
        log(`OK [${product.id}] ${product.name} (${Math.round(stats.size/1024)}KB)`);
      } else {
        fs.unlinkSync(destPath);
        markFailed(product.id);
        log(`TOO SMALL [${product.id}] ${product.name}`);
      }
    } else {
      markFailed(product.id);
      log(`NOT FOUND [${product.id}] ${product.name}`);
    }
  } catch(e) {
    if (e.message === 'RATE_LIMITED') {
      log(`RATE LIMITED - skipping [${product.id}] ${product.name}, will retry next run`);
      // Don't mark as failed, just skip
    } else {
      markFailed(product.id);
      log(`ERROR [${product.id}] ${product.name}: ${e.message}`);
    }
  }
}

main().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
