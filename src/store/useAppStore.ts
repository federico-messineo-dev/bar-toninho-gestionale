import { create } from 'zustand';
import db, {
  type ProductDoc,
  type UserDoc,
  type MovementDoc,
} from '../db/dexie';
import { SEED_USERS } from '../db/seed';
import type { AppRole, AuthUser } from '../types';
import RAW_PRODUCTS from '../data/prodotti.json';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { fullSync, uploadImageToStorage, deleteImageFromStorage, syncPendingProducts } from '../utils/syncQueue';

const PRODUCT_IMAGES: Record<string, string> = {
  '1':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAO0W6zkIqgIKQJmBfVIHmBv7oUw_F8TDZQYAko4SPdOtBcWng3OetpkiyO1tMI11sK6KiXCNC-d0p1TnAuiZc_O7Z2SCEKN7F1cWKKTQ7Gf4P0sVrrliNuIojfQrNR7NDVtgKoBLhGO2MTkUCr7ZhLytVFuLQ7sfWW00GjERY9AtYSC6xPDn0f2OR-Z7NWiWnNJJT7p5I0lItmc32KwiTDXt2FCv4DBw-p7_ph23zHUqtOyngnvfEM',
  '2':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD1i9RQsHjqDhm3J6UKGwxbdcKHlCFrb9VhXlceggPuNwmmOyLV5_SdMchLTJ1BgBtCNZuW7aUq9HNaPHaS16bjYYJgzgECPou5O0i25a2D9lKYJzYgS0qBNxtIq1QLcKvRKIAR70tejDf24kkTAoWx-mT3vh6reDiBLmT_QO78lKTH0Clz2U3U08TlIq-wgvjoRtTjv-qTj7cJ8yoJSo9LRYzmOu8J0kEUBOtKOfn_Cu0atuQeirRG',
  '3':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD26AG6ifEtnXZL6FEt9vDg9XXgjJWNJTLbTMyWisIsODWb3MYKBMS4-pBB-7tdetxx6lYQutpgZ9hAWvklocw_rUoE_VM9N7UuuaaN-_rbYcuOfUFJACXfKPUMTReAk4_kGJkryxfcBO8hCj8VpWGE2hmJjmjhZjfte_q9WnqGtiA2ku5KQTCFvsb03an0GGzXEkDOlyAWMwn7eKoU_veq7AXRD4w12ce-bG9aSHgB0F4bXbqGt0Hl',
  '4':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAHL1IPcTikIrFHQAs4g9uS02PFiS_7zBCz5_juqmm3hoknwp2clteAtyXTBgBZbbbrBUBmW7xQ9BnbXe1K5DNsU2AtpJ0oAgT6GbCYxZeeRJZwGJZkAfYkwJoMTNgAWofarArdWhp2u6WfPuSq_z0E7V_u1TirFDraLdyjh-W4AhHq65ZT70MWur7hp5dlArO5DJFD1vKnxrPNp_uUug2nimRDecyh9Q1-fVq6m_K4cHOddZLBdpP9',
  '5':
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD491CX23JcKS7c31gee8QCE55kyXVPZ574ABUkZnaF4L_A7wXlCDlfabGdtd-CoirFlRyh4bNk928NqAW1xOxSImMPvBTWVElB29sdItlP_e1mU5arhGA7l5z1br70_ro6t3NGLxGrKXHuNyvfz35iSzspCkMEFTt4AudUhurtnr_RftqgeBNwQA69In01JtoDMf750_AYnw3O3KY9U_zwLPnM58pMgf-QzWJvq5mhyMkW63Bon0qW',
};

function sanitizeProduct(p: ProductDoc): ProductDoc {
  return {
    ...p,
    name: p.name || 'Prodotto senza nome',
    category: p.category || 'Altro',
    supplier: p.supplier || null,
    format: p.format || null,
    image_url: p.image_url || '',
    barcode: p.barcode || null,
    allergens: p.allergens || '',
    notes: p.notes || '',
    description: p.description || '',
    synced: p.synced !== undefined ? p.synced : true,
  };
}

function toProductView(p: ProductDoc, legacyMap?: Record<string, string>) {
  const image =
    p.image_url || legacyMap?.[p.id] || PRODUCT_IMAGES[p.id] || '';
  const dot: 'low' | 'healthy' | 'out' =
    p.stock === 0 ? 'out' : p.stock <= (p.min_stock || 2) ? 'low' : 'healthy';

  return {
    id: p.id,
    code: p.id.toUpperCase(),
    name: p.name,
    category: p.category,
    subcategory: p.category,
    price: Number(p.price) || 0,
    costPrice: p.price_purchase ?? null,
    stock: Number(p.stock) || 0,
    stockUnit: 'bottiglie',
    format: p.format || '',
    supplier: p.supplier || '',
    barcode: p.barcode || '',
    description: p.description || '',
    containsSulfites: (p.allergens || '').toLowerCase().includes('solfiti'),
    image,
    statusDot: dot,
    visibleOnMenu: !!p.active,
    minStock: p.min_stock || 2,
    notes: p.notes || '',
    dateAdded: p.created_at ? new Date(p.created_at).toLocaleDateString('it-IT') : '',
  };
}

function toUserView(u: UserDoc) {
  return {
    id: u.id,
    name: u.name,
    role: u.role as 'Admin' | 'Staff',
    status: 'online' as const,
    lastAccess: undefined as string | undefined,
    avatar: u.avatar || '',
  };
}

function getSalesResetAt(): string {
  try {
    return localStorage.getItem('salesResetAt') || '';
  } catch {
    return '';
  }
}

function setSalesResetAt(iso: string) {
  try {
    localStorage.setItem('salesResetAt', iso);
  } catch { /* noop */ }
}

function todayStart2AM(): Date {
  const d = new Date();
  d.setHours(2, 0, 0, 0);
  return d;
}

interface AppState {
  hydrated: boolean;
  authUser: AuthUser | null;
  products: ProductDoc[];
  users: UserDoc[];
  movements: MovementDoc[];
  searchQuery: string;
  selectedCategory: string;
  selectedProductId: string | null;
  toastMessage: string | null;

  hydrate: () => Promise<void>;
  setAuthUser: (user: AuthUser | null) => void;
  logout: () => void;

  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string) => void;
  selectProduct: (id: string | null) => void;
  showToast: (msg: string) => void;

  updateProduct: (patch: Partial<ProductDoc> & { id: string }) => Promise<void>;
  addProduct: (data: Omit<ProductDoc, 'synced' | 'id' | 'created_at' | 'updated_at'>) => Promise<string>;
  toggleProductVisibility: (id: string) => Promise<void>;
  sellProduct: (id: string, qty?: number) => Promise<void>;
  restockProduct: (id: string, qty?: number) => Promise<void>;

  addUser: (name: string, role: AppRole) => Promise<void>;
  updateUser: (patch: Partial<UserDoc> & { id: string }) => Promise<void>;
  removeUser: (email: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  lowStockCount: () => number;
  lowStockProducts: () => ProductDoc[];
  publicProducts: () => ProductDoc[];
  filteredProducts: () => ProductDoc[];
  todaySalesAmount: () => number;
  todaySalesCount: () => number;
  resetTodaySales: () => void;
}

const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  authUser: null,
  products: [],
  users: [],
  movements: [],
  searchQuery: '',
  selectedCategory: 'Tutti',
  selectedProductId: null,
  toastMessage: null,

  hydrate: async () => {
    let reseeded = false;
    await db.transaction('rw', [db.products, db.users, db.movements], async () => {
      const count = await db.products.count();
      if (count === 0) {
        reseeded = true;
        const mapped: ProductDoc[] = (RAW_PRODUCTS as any[]).map((p) =>
          sanitizeProduct({ ...p, synced: false })
        );
        await db.products.bulkPut(mapped);
      }
      const userCount = await db.users.count();
      if (userCount === 0) {
        await db.users.bulkPut(SEED_USERS);
      }
    });

    const [products, users, movements] = await Promise.all([
      db.products.toArray(),
      db.users.toArray(),
      db.movements.orderBy('id').reverse().toArray(),
    ]);

    // Auto-reset sales at 2 AM
    const resetAt = getSalesResetAt();
    const now = new Date();
    const cutoff = todayStart2AM();
    if (now >= cutoff && (!resetAt || new Date(resetAt) < cutoff)) {
      setSalesResetAt(now.toISOString());
    }

    set({ hydrated: true, products, users, movements });

    if (isSupabaseConfigured && navigator.onLine) {
      if (reseeded) {
        syncPendingProducts().then(() => {
          db.products.toArray().then((fresh) => set({ products: fresh }));
        });
      } else {
        fullSync().then(() => {
          db.products.toArray().then((fresh) => set({ products: fresh }));
        });
      }
    }
  },

  setAuthUser: (user) => set({ authUser: user }),

  logout: () => {
    set({ authUser: null });
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedCategory: (c) => set({ selectedCategory: c }),
  selectProduct: (id) => set({ selectedProductId: id }),
  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => set({ toastMessage: null }), 2500);
  },

  updateProduct: async (patch) => {
    const oldProduct = await db.products.get(patch.id);
    const update: Partial<ProductDoc> = {
      ...patch,
      updated_at: new Date().toISOString(),
      synced: false,
    };
    await db.products.update(patch.id, update);
    const products = await db.products.toArray();
    set({ products });

    if (isSupabaseConfigured && navigator.onLine) {
      const product = await db.products.get(patch.id);
      if (product) {
        let imageUrl = product.image_url;
        if (imageUrl && imageUrl.startsWith('data:')) {
          if (oldProduct?.image_url && oldProduct.image_url.startsWith('http')) {
            await deleteImageFromStorage(oldProduct.image_url);
          }
          const uploaded = await uploadImageToStorage(product.id, imageUrl);
          if (uploaded) {
            imageUrl = uploaded;
            await db.products.update(patch.id, { image_url: imageUrl });
          }
        }
        const { error } = await supabase.from('products').upsert({
          id: product.id,
          name: product.name,
          price: product.price,
          price_purchase: product.price_purchase,
          category: product.category,
          format: product.format,
          description: product.description,
          supplier: product.supplier,
          stock: product.stock,
          min_stock: product.min_stock,
          active: product.active,
          image_url: imageUrl,
          barcode: product.barcode,
          allergens: product.allergens,
          notes: product.notes,
          requires_review: product.requires_review,
          created_at: product.created_at,
          updated_at: product.updated_at,
        }, { onConflict: 'id' });

        if (!error) {
          await db.products.update(patch.id, { synced: true });
          const fresh = await db.products.toArray();
          set({ products: fresh });
        }
      }
    }
  },

  addProduct: async (data) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const online = navigator.onLine;
    const product: ProductDoc = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
      synced: online && isSupabaseConfigured,
    };
    await db.products.add(product);
    const products = await db.products.toArray();
    set({ products });

    if (isSupabaseConfigured && online) {
      let imageUrl = product.image_url;
      if (imageUrl && imageUrl.startsWith('data:')) {
        const uploaded = await uploadImageToStorage(id, imageUrl);
        if (uploaded) {
          imageUrl = uploaded;
          await db.products.update(id, { image_url: imageUrl });
        }
      }
      const { error } = await supabase.from('products').upsert({
        id, name: product.name, price: product.price, price_purchase: product.price_purchase,
        category: product.category, format: product.format, description: product.description,
        supplier: product.supplier, stock: product.stock, min_stock: product.min_stock,
        active: product.active, image_url: imageUrl, barcode: product.barcode,
        allergens: product.allergens, notes: product.notes, requires_review: product.requires_review,
        created_at: now, updated_at: now,
      }, { onConflict: 'id' });
      if (!error) {
        await db.products.update(id, { synced: true });
        const fresh = await db.products.toArray();
        set({ products: fresh });
      }
    }

    get().showToast(`Prodotto "${product.name}" creato`);
    return id;
  },

  toggleProductVisibility: async (id) => {
    const p = await db.products.get(id);
    if (!p) return;
    const now = new Date().toISOString();
    await db.products.update(id, { active: !p.active, updated_at: now, synced: false });
    const products = await db.products.toArray();
    set({ products });

    if (isSupabaseConfigured && navigator.onLine) {
      const { error } = await supabase.from('products').upsert({
        id: p.id, name: p.name, price: p.price, price_purchase: p.price_purchase,
        category: p.category, subcategory: p.category, format: p.format, description: p.description,
        supplier: p.supplier, stock: p.stock, min_stock: p.min_stock, active: !p.active,
        image_url: p.image_url, barcode: p.barcode, allergens: p.allergens, notes: p.notes,
        requires_review: p.requires_review, created_at: p.created_at, updated_at: now,
      }, { onConflict: 'id' });
      if (!error) {
        await db.products.update(id, { synced: true });
        const fresh = await db.products.toArray();
        set({ products: fresh });
      }
    }
  },

  sellProduct: async (id, qty = 1) => {
    const p = await db.products.get(id);
    if (!p) return;
    const newStock = Math.max(0, (p.stock || 0) - qty);
    const now = new Date().toISOString();
    await db.products.update(id, { stock: newStock, updated_at: now, synced: false });
    const movementId = await db.movements.add({ product_id: id, type: 'sale', qty, at: now, synced: false });
    const [products, movements] = await Promise.all([db.products.toArray(), db.movements.orderBy('id').reverse().toArray()]);
    set({ products, movements });
    get().showToast(`Vendita registrata: -${qty} "${p.name}"`);

    if (isSupabaseConfigured && navigator.onLine) {
      await supabase.from('products').upsert({
        id: p.id, name: p.name, price: p.price, price_purchase: p.price_purchase,
        category: p.category, subcategory: p.category, format: p.format, description: p.description,
        supplier: p.supplier, stock: newStock, min_stock: p.min_stock, active: p.active,
        image_url: p.image_url, barcode: p.barcode, allergens: p.allergens, notes: p.notes,
        requires_review: p.requires_review, created_at: p.created_at, updated_at: now,
      }, { onConflict: 'id' });
      await supabase.from('movements').insert({ product_id: id, type: 'sale', quantity: qty, created_at: now });
      await db.products.update(id, { synced: true });
      await db.movements.update(movementId, { synced: true });
    }
  },

  restockProduct: async (id, qty = 1) => {
    const p = await db.products.get(id);
    if (!p) return;
    const newStock = (p.stock || 0) + qty;
    const now = new Date().toISOString();
    await db.products.update(id, { stock: newStock, updated_at: now, synced: false });
    const movementId = await db.movements.add({ product_id: id, type: 'restock', qty, at: now, synced: false });
    const [products, movements] = await Promise.all([db.products.toArray(), db.movements.orderBy('id').reverse().toArray()]);
    set({ products, movements });
    get().showToast(`Rifornimento registrato: +${qty} "${p.name}"`);

    if (isSupabaseConfigured && navigator.onLine) {
      await supabase.from('products').upsert({
        id: p.id, name: p.name, price: p.price, price_purchase: p.price_purchase,
        category: p.category, subcategory: p.category, format: p.format, description: p.description,
        supplier: p.supplier, stock: newStock, min_stock: p.min_stock, active: p.active,
        image_url: p.image_url, barcode: p.barcode, allergens: p.allergens, notes: p.notes,
        requires_review: p.requires_review, created_at: p.created_at, updated_at: now,
      }, { onConflict: 'id' });
      await supabase.from('movements').insert({ product_id: id, type: 'restock', quantity: qty, created_at: now });
      await db.products.update(id, { synced: true });
      await db.movements.update(movementId, { synced: true });
    }
  },

  addUser: async (name, role) => {
    const id = `u-${Date.now()}`;
    await db.users.add({ id, name, role: role === 'admin' ? 'Admin' : 'Staff', email: `${name.toLowerCase().replace(/\s+/g, '.')}@caffetoninho.it`, password: 'temp123', avatar: '' });
    const users = await db.users.toArray();
    set({ users });
    get().showToast(`Utente "${name}" aggiunto`);
  },

  updateUser: async (patch) => {
    await db.users.update(patch.id, patch);
    const users = await db.users.toArray();
    set({ users });
    get().showToast(`Utente aggiornato`);
  },

  removeUser: async (email) => {
    const user = await db.users.where('email').equals(email).first();
    if (!user) return;
    await db.users.delete(user.id);
    const users = await db.users.toArray();
    set({ users });
    get().showToast(`Utente rimosso`);
  },

  deleteProduct: async (id) => {
    const product = await db.products.get(id);
    await db.products.delete(id);
    const products = await db.products.toArray();
    set({ products, selectedProductId: null });
    get().showToast(`Prodotto eliminato`);

    if (isSupabaseConfigured && navigator.onLine) {
      if (product?.image_url && product.image_url.startsWith('http')) {
        await deleteImageFromStorage(product.image_url);
      }
      await supabase.from('products').delete().eq('id', id);
    }
  },

  lowStockCount: () => get().products.filter((p) => p.stock <= (p.min_stock || 2)).length,
  lowStockProducts: () => get().products.filter((p) => p.stock <= (p.min_stock || 2)),
  publicProducts: () => get().products.filter((p) => p.active),
  filteredProducts: () => {
    const { products, searchQuery, selectedCategory } = get();
    const q = searchQuery.toLowerCase();
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'Tutti' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.supplier || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  },

  todaySalesAmount: () => {
    const { movements, products } = get();
    const resetAt = getSalesResetAt();
    const from = resetAt ? new Date(resetAt) : todayStart2AM();
    return movements
      .filter((m) => m.type === 'sale' && new Date(m.at) >= from)
      .reduce((sum, m) => {
        const p = products.find((pp) => pp.id === m.product_id);
        return sum + (p ? m.qty * p.price : 0);
      }, 0);
  },

  todaySalesCount: () => {
    const { movements } = get();
    const resetAt = getSalesResetAt();
    const from = resetAt ? new Date(resetAt) : todayStart2AM();
    return movements.filter((m) => m.type === 'sale' && new Date(m.at) >= from).length;
  },

  resetTodaySales: () => {
    setSalesResetAt(new Date().toISOString());
    get().showToast('Vendite di oggi azzerate');
  },
}));

export default useAppStore;
