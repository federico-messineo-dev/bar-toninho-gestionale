require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const products = require('./src/data/prodotti.json');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Errore: VITE_SUPABASE_URL e SUPABASE_SERVICE_KEY devono essere presenti nel file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function importProducts() {
  const { error } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'id' });

  if (error) {
    console.error('Errore durante l’import:', error);
  } else {
    console.log(`✅ Importati ${products.length} prodotti con successo`);
  }
}

importProducts();