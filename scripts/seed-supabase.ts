import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  console.error('Set them in .env or export them as environment variables');
  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY
);

async function seed() {
  console.log('Reading prodotti.json...');
  const filePath = join(__dirname, '..', 'src', 'data', 'prodotti.json');
  const raw = readFileSync(filePath, 'utf-8');
  const products = JSON.parse(raw);

  console.log(`Found ${products.length} products. Upserting to Supabase...`);

  const BATCH_SIZE = 50;
  let upserted = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE).map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      price_purchase: p.price_purchase,
      category: p.category,
      format: p.format,
      description: p.description,
      supplier: p.supplier,
      stock: p.stock,
      min_stock: p.min_stock,
      active: p.active,
      image_url: p.image_url,
      barcode: p.barcode,
      allergens: p.allergens,
      notes: p.notes,
      requires_review: p.requires_review,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    const { error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message);
    } else {
      upserted += batch.length;
      console.log(`  Upserted ${upserted}/${products.length}`);
    }
  }

  console.log(`\nDone! ${upserted} products seeded to Supabase.`);
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
