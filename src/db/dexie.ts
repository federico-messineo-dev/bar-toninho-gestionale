import Dexie, { type EntityTable } from 'dexie';
import { SEED_USERS } from './seed';

export interface ProductDoc {
  id: string;
  name: string;
  price: number;
  price_purchase: number | null;
  category: string;
  format: string | null;
  description: string;
  supplier: string | null;
  stock: number;
  min_stock: number;
  active: boolean;
  image_url: string;
  barcode: string | null;
  allergens: string;
  notes: string;
  requires_review: boolean;
  created_at: string;
  updated_at: string;
  synced: boolean;
}

export interface UserDoc {
  id: string;
  name: string;
  role: 'Admin' | 'Staff';
  email: string;
  password: string;
  avatar: string;
}

export interface MovementDoc {
  id: number;
  product_id: string;
  type: 'sale' | 'restock' | 'adjust';
  qty: number;
  at: string;
  synced: boolean;
}

const db = new Dexie('CaffeToninhoDB') as Dexie & {
  products: EntityTable<ProductDoc, 'id'>;
  users: EntityTable<UserDoc, 'id'>;
  movements: EntityTable<MovementDoc, 'id'>;
};

db.version(1).stores({
  products: 'id, category, supplier, active, stock, min_stock, updated_at',
  users: 'id, role, email',
  movements: '++id, product_id, type, at',
});

db.version(2).stores({
  products: 'id, category, supplier, active, stock, min_stock, updated_at',
  users: 'id, role, email',
  movements: '++id, product_id, type, at',
}).upgrade(async (tx) => {
  await tx.table('users').clear();
  await tx.table('users').bulkAdd(SEED_USERS);
});

db.version(3).stores({
  products: 'id, category, supplier, active, stock, min_stock, updated_at, synced',
  users: 'id, role, email',
  movements: '++id, product_id, type, at, synced',
}).upgrade(async (tx) => {
  await tx.table('products').toCollection().modify((p: any) => {
    if (p.synced === undefined) p.synced = true;
  });
  await tx.table('movements').toCollection().modify((m: any) => {
    if (m.synced === undefined) m.synced = true;
  });
});

db.version(4).stores({
  products: 'id, category, supplier, active, stock, min_stock, updated_at, synced',
  users: 'id, role, email',
  movements: '++id, product_id, type, at, synced',
}).upgrade(async (tx) => {
  await tx.table('products').clear();
});

db.version(5).stores({
  products: 'id, category, supplier, active, stock, min_stock, updated_at, synced',
  users: 'id, role, email',
  movements: '++id, product_id, type, at, synced',
}).upgrade(async (tx) => {
  await tx.table('users').clear();
  await tx.table('users').bulkAdd(SEED_USERS);
});

export default db;
