const dbPromise = require('./db');
const fs = require('fs');
const path = require('path');
const https = require('https');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : require('http');
    const req = client.get(url, { headers: { 'User-Agent': 'TheReptilePlug/1.0 (educational project; contact@buyreptilesonline.com)' }, timeout: 10000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject);
      }
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
    const client = url.startsWith('https') ? https : require('http');
    const req = client.get(url, { headers: { 'User-Agent': 'TheReptilePlug/1.0' }, timeout: 15000 }, (res) => {
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

// Try multiple search strategies
async function findImage(name) {
  // Build search queries from most specific to general
  const cleanName = name
    .replace(/\b(cb|Baby|Adult|Captive Bred|Normal|for Sale)\b/gi, '')
    .replace(/\s+/g, ' ').trim();

  // Extract base species name (remove morph qualifiers for fallback)
  const baseName = cleanName
    .replace(/\b(Albino|Leucistic|Melanoid|Piebald|Pastel|Fire|Ghost|Snow|Blizzard|Hypo|Super|Giant|Motley|Tessera|Sunkissed|Crimson|Blood Red|Lavender|Ultra|Enigma|Tangerine|Sunglow|Pinstripe|Mack|Blazing|Woma|Spinner|Spider|Yellow Bellied|Black Pastel|Banana|Orange|High White|Albino|Red|Citrus|Translucent|Leatherback|Zero|Witblits|Fantasy|Strawberry|Ornate|Cherry Head|Flame|Harlequin|Dalmatian|Lilly White)\b/gi, '')
    .replace(/\s+/g, ' ').trim();

  const queries = [
    cleanName,                          // Full name: "Piebald Ball Python"
    baseName,                           // Base: "Ball Python"
    cleanName + ' reptile',             // With context
    baseName + ' animal',               // Broader
  ];

  // Deduplicate
  const uniqueQueries = [...new Set(queries.filter(q => q.length > 3))];

  for (const query of uniqueQueries) {
    const url = await searchWikimedia(query);
    if (url) return url;
    await sleep(200);
  }
  return null;
}

async function searchWikimedia(query) {
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=8&format=json`;
  try {
    const result = await fetchJSON(searchUrl);
    if (!result.query?.search?.length) return null;

    for (const item of result.query.search) {
      const title = item.title;
      // Skip SVGs, maps, icons, logos, distribution maps
      const titleLower = title.toLowerCase();
      if (titleLower.includes('map') || titleLower.includes('distribution') || titleLower.includes('logo') || titleLower.includes('icon') || titleLower.includes('diagram') || titleLower.includes('chart')) continue;

      const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=800&format=json`;
      const info = await fetchJSON(infoUrl);
      const page = Object.values(info.query.pages)[0];

      if (page.imageinfo?.[0]) {
        const img = page.imageinfo[0];
        // Only JPEG/PNG, min 10KB, skip tiny icons
        if ((img.mime === 'image/jpeg' || img.mime === 'image/png') && img.size > 10000) {
          return img.thumburl || img.url;
        }
      }
    }
    return null;
  } catch(e) {
    return null;
  }
}

async function main() {
  const db = await dbPromise;
  const products = db.prepare("SELECT id, name, morph FROM products WHERE image IS NULL OR image = ''").all();
  console.log(`Found ${products.length} products without images\n`);

  let downloaded = 0, failed = 0;
  const failedNames = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    process.stdout.write(`[${i+1}/${products.length}] ${p.name}... `);

    try {
      const imageUrl = await findImage(p.name);
      if (imageUrl) {
        const filename = `product_${p.id}.jpg`;
        const destPath = path.join(UPLOADS_DIR, filename);
        await downloadFile(imageUrl, destPath);
        const stats = fs.statSync(destPath);
        if (stats.size > 5000) {
          db.prepare('UPDATE products SET image = ? WHERE id = ?').run(`/uploads/${filename}`, p.id);
          downloaded++;
          console.log(`OK (${Math.round(stats.size/1024)}KB)`);
        } else {
          fs.unlinkSync(destPath);
          failed++;
          failedNames.push(p.name);
          console.log('too small');
        }
      } else {
        failed++;
        failedNames.push(p.name);
        console.log('not found');
      }
    } catch(e) {
      failed++;
      failedNames.push(p.name);
      console.log(`error: ${e.message}`);
    }
    await sleep(300);
  }

  console.log(`\n========================================`);
  console.log(`Done: ${downloaded} downloaded, ${failed} failed`);
  if (failedNames.length > 0 && failedNames.length < 50) {
    console.log(`\nFailed products:`);
    failedNames.forEach(n => console.log(`  - ${n}`));
  }
}

main().catch(console.error);
