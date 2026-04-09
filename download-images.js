const dbPromise = require('./db');
const fs = require('fs');
const path = require('path');
const https = require('https');

const UPLOADS_DIR = path.join(__dirname, 'uploads');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : require('http');
    client.get(url, { headers: { 'User-Agent': 'TheReptilePlug/1.0 (educational project)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('Parse error')); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : require('http');
    client.get(url, { headers: { 'User-Agent': 'TheReptilePlug/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(true); });
      stream.on('error', reject);
    }).on('error', reject);
  });
}

async function searchWikimediaImage(query) {
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json`;
  try {
    const result = await fetchJSON(searchUrl);
    if (!result.query || !result.query.search || result.query.search.length === 0) return null;
    for (const item of result.query.search) {
      const title = item.title;
      const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json`;
      const info = await fetchJSON(infoUrl);
      const pages = info.query.pages;
      const page = Object.values(pages)[0];
      if (page.imageinfo && page.imageinfo[0]) {
        const imgInfo = page.imageinfo[0];
        if (imgInfo.mime && (imgInfo.mime === 'image/jpeg' || imgInfo.mime === 'image/png' || imgInfo.mime === 'image/webp')) {
          return imgInfo.thumburl || imgInfo.url;
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
  console.log(`Found ${products.length} products without images`);

  let downloaded = 0, failed = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const searchTerm = p.name.replace(/\b(cb|Baby|Adult)\b/gi, '').trim();
    process.stdout.write(`[${i+1}/${products.length}] ${searchTerm}... `);

    try {
      const imageUrl = await searchWikimediaImage(searchTerm);
      if (imageUrl) {
        const ext = '.jpg';
        const filename = `product_${p.id}${ext}`;
        const destPath = path.join(UPLOADS_DIR, filename);
        await downloadFile(imageUrl, destPath);
        const stats = fs.statSync(destPath);
        if (stats.size > 1000) {
          db.prepare('UPDATE products SET image = ? WHERE id = ?').run(`/uploads/${filename}`, p.id);
          downloaded++;
          console.log(`OK (${Math.round(stats.size/1024)}KB)`);
        } else {
          fs.unlinkSync(destPath);
          failed++;
          console.log('too small');
        }
      } else {
        failed++;
        console.log('not found');
      }
    } catch(e) {
      failed++;
      console.log(`error: ${e.message}`);
    }
    await sleep(400);
  }

  console.log(`\nDone: ${downloaded} downloaded, ${failed} failed`);
}

main().catch(console.error);
