const fs = require('fs');
const path = require('path');

const IMAGE_DIR = path.resolve(__dirname, '../frontend/public/images/pharmacy');
const SOURCES_FILE = path.resolve(__dirname, '../frontend/public/images/pharmacy/sources.json');
const SEED_FILE = path.resolve(__dirname, '../backend/src/appSeeds.js');

const products = [
  {
    name: 'Paracetamol (Napa 500mg)',
    category: 'Essential Medicines',
    price: 11,
    sourceUrl: 'https://epharma.com.bd/en/medicines/fever/napa-500mg-tablet-10pcs-4720'
  },
  {
    name: 'Ibuprofen (Kirkland 200mg)',
    category: 'Essential Medicines',
    price: 3149,
    sourceUrl: 'https://epharma.com.bd/en/vitamins-and-supplements/food-supplement/kirkland-signature-ibuprofen-200mg-500-tablets-usa-144142'
  },
  {
    name: 'Azithromycin (Zithrin 250mg)',
    category: 'Essential Medicines',
    price: 123,
    sourceUrl: 'https://epharma.com.bd/en/medicines/infection/zithrin-250-tablet-6pcs-16305'
  },
  {
    name: 'Metronidazole (Amodis 400mg)',
    category: 'Essential Medicines',
    price: 16,
    sourceUrl: 'https://epharma.com.bd/en/medicines/infection/amodis-400mg-10pcs-13576'
  },
  {
    name: 'Ciprofloxacin (Ancipro 500mg)',
    category: 'Essential Medicines',
    price: 0,
    sourceUrl: 'https://epharma.com.bd/en/medicines/infection/ancipro-500mg-tablet-9591'
  },
  {
    name: 'Amoxicillin (Moxacil 500mg)',
    category: 'Essential Medicines',
    price: 71,
    sourceUrl: 'https://epharma.com.bd/details/moxacil-500-box_14709'
  },
  {
    name: 'Ampicillin (Skycillin 250mg)',
    category: 'Essential Medicines',
    price: 2,
    sourceUrl: 'https://epharma.com.bd/details/skycillin-250mg_13361'
  },
  {
    name: 'Cefixime (Rofixim 200mg)',
    category: 'Essential Medicines',
    price: 0,
    sourceUrl: 'https://epharma.com.bd/en/medicines/infection/rofixim-200mg-capsule-12276'
  },
  {
    name: 'Omeprazole (Omenix 40mg)',
    category: 'Essential Medicines',
    price: 76,
    sourceUrl: 'https://epharma.com.bd/en/medicines/gastro/omenix-40-capsule-10pcs-15892'
  },
  {
    name: 'Salbutamol Inhaler (Asmalin HFA)',
    category: 'Essential Medicines',
    price: 238,
    sourceUrl: 'https://epharma.com.bd/product/16814'
  },
  {
    name: 'Metformin (Metfo 500mg)',
    category: 'Essential Medicines',
    price: 38,
    sourceUrl: 'https://epharma.com.bd/en/diabetic-care/diabetes-medicines/metfo-500mg-tablet-1-strip-11956'
  },
  {
    name: 'Insulin (Ansulin 30/70 Vial)',
    category: 'Essential Medicines',
    price: 394,
    sourceUrl: 'https://epharma.com.bd/en/diabetic-care/insulin-vial/ansulin-3070-vial-100iuml-142282'
  },
  {
    name: 'Amlodipine (Amlocard 5mg)',
    category: 'Essential Medicines',
    price: 66,
    sourceUrl: 'https://epharma.com.bd/en/medicines/hypertension/amlocard-5mg-14pcs-3491'
  },
  {
    name: 'Furosemide (Lasix 40mg)',
    category: 'Essential Medicines',
    price: 9,
    sourceUrl: 'https://epharma.com.bd/product/14425'
  },
  {
    name: 'Cetirizine (Cetizin 10mg)',
    category: 'Essential Medicines',
    price: 29,
    sourceUrl: 'https://epharma.com.bd/en/medicines/allergies/cetizin-10mg-10pcs-3592'
  },
  {
    name: 'Zinc Sulfate (Oral Z 20)',
    category: 'Essential Medicines',
    price: 17,
    sourceUrl: 'https://epharma.com.bd/details/oral-z-20-20mg_8289'
  },
  {
    name: 'Oral Rehydration Salts (SMC Tasty Saline)',
    category: 'Essential Medicines',
    price: 7,
    sourceUrl: 'https://epharma.com.bd/en/medicines/dehydration/smc-fruity-tasty-saline-orange-flavor-1pc-141069'
  },
  {
    name: 'Povidone Iodine 10% (Povisep)',
    category: 'Essential Medicines',
    price: 114,
    sourceUrl: 'https://epharma.com.bd/details/povisep-10-100ml_10702'
  },
  {
    name: 'Chlorhexidine + Cetrimide (Savlon Cream)',
    category: 'Essential Medicines',
    price: 34,
    sourceUrl: 'https://epharma.com.bd/en/health-accessories/first-aid/savlon-cream-30gm-14804'
  },
  {
    name: 'Aspirin 75mg (Ecosprin)',
    category: 'Essential Medicines',
    price: 8,
    sourceUrl: 'https://epharma.com.bd/en/medicines/pain/ecosprin-75mg-tablet-10pcs-38'
  },
  {
    name: 'Pentaxim Vaccine',
    category: 'Vaccines',
    price: 1943,
    sourceUrl: 'https://epharma.com.bd/en/medicines/otc-medicines/pentaxim-3235'
  },
  {
    name: 'Prevenar 13 Vaccine',
    category: 'Vaccines',
    price: 0,
    sourceUrl: 'https://epharma.com.bd/en/medicines/vaccines/prevenar-13-injection-17229'
  },
  {
    name: 'Hepatitis B Vaccine (Hepa-B)',
    category: 'Vaccines',
    price: 0,
    sourceUrl: 'https://epharma.com.bd/en/medicines/vaccines/hepa-b-vaccine-1ml-15552'
  },
  {
    name: 'MMR Vaccine (Trimovax)',
    category: 'Vaccines',
    price: 6637,
    sourceUrl: 'https://epharma.com.bd/details/trimovax-05ml-10pcs_3237'
  },
  {
    name: 'Tetanus Vaccine (TTvax)',
    category: 'Vaccines',
    price: 93,
    sourceUrl: 'https://epharma.com.bd/en/medicines/vaccines/ttvax-im-injection-40iu05ml-143498'
  },
  {
    name: 'Pneumococcal Vaccine (Evimar 13)',
    category: 'Vaccines',
    price: 3920,
    sourceUrl: 'https://epharma.com.bd/en/medicines/vaccines/evimar-13-im-injection-14177'
  },
  {
    name: 'Influenza Vaccine (Influvax Tetra)',
    category: 'Vaccines',
    price: 931,
    sourceUrl: 'https://epharma.com.bd/en/medicines/vaccines/influvax-tetra-05ml-15595'
  },
  {
    name: 'Rabies Vaccine (Rabix VC)',
    category: 'Vaccines',
    price: 470,
    sourceUrl: 'https://epharma.com.bd/en/medicines/otc-medicines/rabix-vc-vaccine-1ml-16009'
  }
];

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const fetchHtml = async (url) => {
  let res;
  try {
    res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  } catch (err) {
    throw new Error(`Failed to fetch ${url}: ${err?.message || err}`);
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.text();
};

const extractImageUrl = (html) => {
  const og = html.match(/property=\"og:image\" content=\"([^\"]+)\"/i);
  if (og && og[1]) return og[1];
  const match = html.match(/https?:\\\/\\\/[^\"'\s>]+storage\\\/app\\\/public\\\/[^\"'\s>]+/i);
  if (match) return match[0];
  const altMatch = html.match(/https?:\\\/\\\/[^\"'\s>]+\.(?:jpg|jpeg|png|webp)/i);
  return altMatch ? altMatch[0] : null;
};

const downloadImage = async (url, filePath) => {
  let res;
  try {
    res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  } catch (err) {
    throw new Error(`Failed to download ${url}: ${err?.message || err}`);
  }
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
};

const toSafeName = (value) =>
  String(value || '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const updateSeedFile = (items) => {
  const seedText = fs.readFileSync(SEED_FILE, 'utf8');
  const startToken = "  {\n    id: 'med-001'";
  const endToken = "  {\n    id: 'med-029'";
  const startIndex = seedText.indexOf(startToken);
  const endIndex = seedText.indexOf(endToken);
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error('Failed to locate med-001..med-028 block in appSeeds.js');
  }

  const replacementBlocks = items
    .map((item) =>
      [
        '  {',
        `    id: '${item.id}',`,
        `    name: '${item.name.replace(/'/g, "\\'")}',`,
        `    price: ${item.price},`,
        `    image: '${item.image}',`,
        `    category: '${item.category.replace(/'/g, "\\'")}'`,
        '  }'
      ].join('\n')
    )
    .join(',\n');

  const updated = seedText.slice(0, startIndex) + replacementBlocks + ',\n' + seedText.slice(endIndex);
  fs.writeFileSync(SEED_FILE, updated, 'utf8');
};

const updateSources = (items) => {
  let sources = [];
  if (fs.existsSync(SOURCES_FILE)) {
    try {
      sources = JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf8')) || [];
    } catch (err) {
      sources = [];
    }
  }

  const sourceMap = new Map(sources.map((entry) => [entry.id, entry]));
  items.forEach((item) => {
    sourceMap.set(item.id, {
      id: item.id,
      name: item.name,
      source: 'ePharma',
      sourceUrl: item.sourceUrl,
      imageUrl: item.imageUrl
    });
  });

  const merged = Array.from(sourceMap.values()).sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(SOURCES_FILE, JSON.stringify(merged, null, 2));
};

(async () => {
  try {
    ensureDir(IMAGE_DIR);
    const items = [];

    for (let i = 0; i < products.length; i += 1) {
      const id = `med-${String(i + 1).padStart(3, '0')}`;
      const product = products[i];
      const html = await fetchHtml(product.sourceUrl);
      const imageUrl = extractImageUrl(html);
      if (!imageUrl) {
        throw new Error(`No image found for ${product.sourceUrl}`);
      }

      const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
      const safeExt = ext.length <= 5 ? ext : '.jpg';
      const fileName = `${id}${safeExt}`;
      const filePath = path.join(IMAGE_DIR, fileName);

      await downloadImage(imageUrl, filePath);

      const price = Number.isFinite(product.price) && product.price > 0 ? product.price : 100;

      items.push({
        id,
        name: toSafeName(product.name),
        category: product.category,
        price,
        image: `/images/pharmacy/${fileName}`,
        sourceUrl: product.sourceUrl,
        imageUrl
      });
    }

    updateSeedFile(items);
    updateSources(items);

    console.log(`Updated ${items.length} medicine/vaccine items.`);
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
})();
