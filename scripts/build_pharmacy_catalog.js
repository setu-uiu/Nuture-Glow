const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '../frontend/public/images/pharmacy');
const SEED_FILE = path.resolve(__dirname, '../backend/src/appSeeds.js');
const SOURCES_FILE = path.resolve(__dirname, '../frontend/public/images/pharmacy/sources.json');

const sources = [
  {
    name: 'PinkStork',
    url: 'https://pinkstork.com/products.json?limit=250',
    count: 40,
    categoryFallback: 'Mother Care'
  },
  {
    name: 'Nanobebe',
    url: 'https://nanobebe.com/products.json?limit=250',
    count: 10,
    categoryFallback: 'Baby Feeding'
  },
  {
    name: 'CopperPearl',
    url: 'https://copperpearl.com/products.json?limit=250',
    count: 25,
    categoryFallback: 'Baby Accessories'
  },
  {
    name: 'LittleUnicorn',
    url: 'https://littleunicorn.com/products.json?limit=250',
    count: 25,
    categoryFallback: 'Baby Essentials'
  }
];

const toAscii = (value) =>
  String(value || '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const toNumber = (value) => {
  const num = Number.parseFloat(String(value || '').trim());
  return Number.isFinite(num) ? Math.max(0, Math.round(num)) : 0;
};

const pickImageUrl = (product) => {
  if (Array.isArray(product?.images) && product.images.length > 0) {
    return product.images[0]?.src || product.images[0]?.url || null;
  }
  if (product?.image?.src) return product.image.src;
  return null;
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const downloadImage = async (url, filePath) => {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
};

const buildItems = async () => {
  const items = [];
  const sourcesMeta = [];

  for (const source of sources) {
    const res = await fetch(source.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${source.url}: ${res.status}`);
    }
    const data = await res.json();
    const products = Array.isArray(data?.products) ? data.products : [];
    const usable = products
      .map((product) => ({
        product,
        imageUrl: pickImageUrl(product)
      }))
      .filter((entry) => entry.imageUrl);

    const slice = usable.slice(0, source.count);
    if (slice.length < source.count) {
      throw new Error(`Not enough products with images from ${source.name}. Needed ${source.count}, got ${slice.length}.`);
    }

    for (const entry of slice) {
      items.push({
        source: source.name,
        sourceUrl: source.url,
        categoryFallback: source.categoryFallback,
        product: entry.product,
        imageUrl: entry.imageUrl
      });
    }
  }

  if (items.length !== 100) {
    throw new Error(`Expected 100 items, got ${items.length}`);
  }

  ensureDir(OUTPUT_DIR);

  const catalog = [];
  for (let i = 0; i < items.length; i += 1) {
    const index = i + 1;
    const id = `med-${String(index).padStart(3, '0')}`;
    const entry = items[i];
    const product = entry.product || {};
    const name = toAscii(product.title) || `Product ${index}`;
    const rawCategory = toAscii(product.product_type);
    const category = rawCategory || entry.categoryFallback;
    const price = toNumber(product?.variants?.[0]?.price);

    const imageUrl = entry.imageUrl;
    const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
    const safeExt = ext.length <= 5 ? ext : '.jpg';
    const fileName = `${id}${safeExt}`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      await downloadImage(imageUrl, filePath);
    }

    catalog.push({
      id,
      name,
      price,
      image: `/images/pharmacy/${fileName}`,
      category
    });

    sourcesMeta.push({
      id,
      name,
      source: entry.source,
      sourceUrl: entry.sourceUrl,
      imageUrl
    });
  }

  fs.writeFileSync(SOURCES_FILE, JSON.stringify(sourcesMeta, null, 2));
  return catalog;
};

const updateSeedFile = (catalog) => {
  const seedText = fs.readFileSync(SEED_FILE, 'utf8');
  const lines = catalog
    .map((item) => [
      '  {',
      `    id: '${item.id}',`,
      `    name: '${item.name.replace(/'/g, "\\'")}',`,
      `    price: ${item.price},`,
      `    image: '${item.image}',`,
      `    category: '${item.category.replace(/'/g, "\\'")}'`,
      '  }'
    ].join('\n'))
    .join(',\n');

  const replacement = `export const SEED_MEDICINES = [\n${lines}\n];`;
  const nextText = seedText.replace(/export const SEED_MEDICINES = \[[\s\S]*?\];/m, replacement);

  if (nextText === seedText) {
    console.log('SEED_MEDICINES already up to date.');
    return;
  }

  fs.writeFileSync(SEED_FILE, nextText, 'utf8');
};

(async () => {
  try {
    const catalog = await buildItems();
    updateSeedFile(catalog);
    console.log('Pharmacy catalog updated:', catalog.length, 'items');
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
})();
