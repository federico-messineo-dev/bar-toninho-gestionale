export type AppRole = 'admin' | 'staff';

export interface AuthUser {
  id: string;
  name: string;
  role: AppRole;
  email: string;
}

export type ActiveTab = 'login' | 'dashboard' | 'prodotti' | 'product_detail' | 'menu_qr' | 'utenti' | 'profilo';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  costPrice: number | null;
  stock: number;
  stockUnit?: string;
  format: string | null;
  supplier: string | null;
  barcode: string | null;
  description: string;
  containsSulfites: boolean;
  image: string;
  statusDot: 'low' | 'healthy' | 'out';
  visibleOnMenu: boolean;
  minStock: number;
  notes: string;
  dateAdded: string;
}

export interface UserItem {
  id: string;
  name: string;
  role: 'Admin' | 'Staff';
  status: 'online' | 'offline' | 'recent';
  lastAccess?: string;
  avatar: string;
}
