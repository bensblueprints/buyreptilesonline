const https = require('https');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Use Wikimedia API to get proper thumbnail URLs first
const images = [
  [1, 'Hatchling_Pastel_Ball_Python.jpg', 'pastel-ball-python.jpg'],
  [2, 'Banana_python.png', 'banana-ball-python.png'],
  [3, 'Piebald_(Pied)_Ball_Python.jpg', 'piebald-ball-python.jpg'],
  [4, 'Ball_python_lucy.JPG', 'normal-ball-python.jpg'],
  [5, 'Albino_ball_python.png', 'albino-ball-python.png'],
  [6, 'Boa_constrictor_imperator.jpg', 'colombian-red-tail-boa.jpg'],
  [7, 'Mochi_Ball_Python.JPG', 'enchi-ball-python.jpg'],
  [8, 'JuvenileMojaveBallPython.png', 'ghi-mojave-ball-python.png'],
  [9, 'Orange_Ghost_(Hypomelanistic)_Ball_Python.jpg', 'clown-ball-python.jpg'],
  [10, 'Adult-mexican-black-kingsnake.png', 'mexican-black-kingsnake.png'],
  [11, 'Gekkoninae_Rhacodactylus_ciliatus_orange.png', 'flame-crested-gecko.png'],
  [12, 'Gekon_orzęsiony,_Correlophus_ciliatus_Harlequin.jpg', 'harlequin-crested-gecko.jpg'],
  [13, 'Rhacodactylus_ciliatus_"dalmatien".jpg', 'dalmatian-crested-gecko.jpg'],
  [14, 'Rhacodactylus_leachianus_-_gecko_geant_de_nouvelle_caledonie_-Cedric_Loury_-_wiki12.JPG', 'leachianus-gecko.jpg'],
  [15, 'Gekko_gecko_192144834.jpg', 'tokay-gecko.jpg'],
  [16, 'Madagascar_giant_day_gecko_(Phelsuma_grandis)_Nosy_Komba.jpg', 'giant-day-gecko.jpg'],
  [17, 'Mourning_Gecko_2021.jpg', 'mourning-gecko.jpg'],
  [18, 'Crested_gecko_-_1.jpg', 'lilly-white-crested-gecko.jpg'],
  [19, 'Porcellio_laevis_-_Bouxweerd20090527_897.jpg', 'dairy-cow-isopods.jpg'],
  [20, 'Porcellionides_pruinosus_P1380341a.jpg', 'powder-orange-isopods.jpg'],
  [21, 'Cubaris_murina.png', 'rubber-ducky-isopods.png'],
  [22, 'Zebra_Isopod_(Armadillidium_maculatum).png', 'zebra-isopods.png'],
  [23, 'Armadillidium_vulgare_000.jpg', 'magic-potion-isopods.jpg'],
  [24, 'Porcellio_dilatatus_4762119.jpg', 'giant-canyon-isopods.jpg'],
  [25, 'Cubaris_murina.png', 'panda-king-isopods.png'],
  [26, 'Pinky_mice.JPG', 'frozen-pinky-mice.jpg'],
  [27, 'Fuzzy_and_pinky_mice.JPG', 'frozen-fuzzy-mice.jpg'],
  [28, 'Albino_Rat.jpg', 'frozen-small-rats.jpg'],
  [29, '10_Male_Rats.jpg', 'frozen-medium-rats.jpg'],
  [30, '10_Male_Rats.jpg', 'frozen-large-rats.jpg'],
  [31, 'Gryllus_bimaculatus_(Mediterranean_field_cricket),_Skala_Kalloni,_Lesbos,_Greece.jpg', 'live-crickets.jpg'],
  [32, 'Blaptica_dubia_(Serville,_1839).jpg', 'dubia-roaches.jpg'],
  [33, 'Zophobas_morio_larva_-_top_(aka).jpg', 'superworms.jpg'],
  [34, 'Rain_Quail.JPG', 'frozen-quail.jpg'],
  [35, 'Tomato_Hornworm_Larva_-_Relic38_-_Ontario_Canada.JPG', 'hornworms.jpg'],
  [36, 'Brick_of_coco_coir.JPG', 'coconut-substrate.jpg'],
  [37, 'Thermo-Hygrometer.JPG', 'thermo-hygrometer.jpg'],
  [38, 'Infrared_Heat_Lamp.jpg', 'ceramic-heat-emitter.jpg'],
  [39, 'Doggie_dish_(152143213).jpg', 'reptile-water-bowl.jpg'],
  [40, 'Cork_oak_in_Israel_-_Bark_-2.JPG', 'cork-bark.jpg'],
  [41, 'A_touch-screen_programmable_thermostat.jpg', 'reptile-thermostat.jpg'],
  [42, 'Spray_bottles.jpg', 'spray-bottle.jpg'],
  [43, 'Shining_fluorescent_lamp.JPG', 'uvb-light.jpg'],
  [44, '500_mg_calcium_supplements_with_vitamin_D.jpg', 'calcium-powder.jpg'],
  [45, 'Crested_gecko_-_1.jpg', 'crested-gecko-diet.jpg'],
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Use Wikimedia API to get the actual image URL (avoids rate limiting on direct links)
function getImageUrl(filename) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`;
    https.get(apiUrl, { headers: { 'User-Agent': 'TheReptilePlug/1.0 (ecommerce store; contact@thereptileplug.com)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const page = Object.values(pages)[0];
          if (page.imageinfo) {
            // Use thumburl (800px) if available, otherwise original
            const url = page.imageinfo[0].thumburl || page.imageinfo[0].url;
            resolve(url);
          } else {
            reject(new Error('No image info for ' + filename));
          }
        } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const doGet = (u, redirects = 0) => {
      if (redirects > 5) return reject(new Error('Too many redirects'));
      const proto = u.startsWith('https') ? https : require('http');
      proto.get(u, { headers: { 'User-Agent': 'TheReptilePlug/1.0 (ecommerce store)' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.destroy();
          return doGet(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) {
          file.destroy();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const newFile = fs.createWriteStream(dest);
        res.pipe(newFile);
        newFile.on('finish', () => { newFile.close(); resolve(); });
      }).on('error', reject);
    };
    doGet(url);
  });
}

async function main() {
  const initDB = require('./db');
  const db = await initDB;

  let success = 0, failed = 0, skipped = 0;

  for (const [id, wikiFile, localFile] of images) {
    const dest = path.join(UPLOAD_DIR, localFile);

    // Skip if already downloaded successfully (> 5KB)
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
      console.log(`✓ ${localFile} exists (${(fs.statSync(dest).size/1024).toFixed(0)}KB)`);
      db.prepare('UPDATE products SET image = ? WHERE id = ?').run('/uploads/' + localFile, id);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`[${id}/45] ${localFile}...`);

      // Get proper URL via API
      const url = await getImageUrl(wikiFile);
      await sleep(1000);

      // Download the image
      await downloadFile(url, dest);

      const size = fs.statSync(dest).size;
      if (size < 5000) {
        fs.unlinkSync(dest);
        throw new Error(`Too small (${size} bytes)`);
      }

      console.log(` OK (${(size/1024).toFixed(0)}KB)`);
      db.prepare('UPDATE products SET image = ? WHERE id = ?').run('/uploads/' + localFile, id);
      success++;

      // Polite delay between downloads
      await sleep(3000);
    } catch(e) {
      console.log(` FAILED: ${e.message}`);
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      failed++;
      await sleep(2000);
    }
  }

  console.log(`\nDone! ${success} downloaded, ${skipped} existed, ${failed} failed`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
