const dbPromise = require('./db');
const fs = require('fs');
const path = require('path');

// Map SEO content files to category slugs
const contentMap = {
  'snakes_category_content.html': ['snakes'],
  'geckos-category-content.html': ['geckos'],
  'turtles-tortoises-content.html': ['turtles', 'tortoises'],
  'amphibians-category-seo.html': ['frogs-toads', 'salamanders-newts'],
  'lizards-category.html': ['bearded-dragons', 'chameleons', 'monitors-tegus', 'agamas-water-dragons', 'skinks', 'uromastyx', 'other-lizards-iguanas'],
  'tarantulas-scorpions-invertebrates.html': ['tarantulas-spiders', 'scorpions', 'insects-invertebrates'],
};

async function main() {
  const db = await dbPromise;

  for (const [file, slugs] of Object.entries(contentMap)) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.log(`SKIP: ${file} not found`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // Strip any full HTML document wrapper, keep just the body content
    // Remove <!DOCTYPE>, <html>, <head>...</head>, <body>, </body>, </html>
    content = content.replace(/<!DOCTYPE[^>]*>/gi, '');
    content = content.replace(/<html[^>]*>/gi, '');
    content = content.replace(/<\/html>/gi, '');
    content = content.replace(/<head>[\s\S]*?<\/head>/gi, '');
    content = content.replace(/<body[^>]*>/gi, '');
    content = content.replace(/<\/body>/gi, '');
    content = content.trim();

    for (const slug of slugs) {
      const cat = db.prepare('SELECT id, name FROM categories WHERE slug = ?').get(slug);
      if (cat) {
        db.prepare('UPDATE categories SET seo_content = ? WHERE id = ?').run(content, cat.id);
        console.log(`✓ Loaded SEO content for "${cat.name}" (${slug}) - ${Math.round(content.length/1024)}KB`);
      } else {
        console.log(`✗ Category not found: ${slug}`);
      }
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
