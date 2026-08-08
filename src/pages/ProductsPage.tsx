import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import ScrollArrows from '../components/ScrollArrows';
import type { ProductDoc } from '../db/dexie';

const CATEGORIES = [
  'Tutti', 'Spumante', 'Amari', 'Champagne', 'Birra', 'Vino',
  'Rum', 'Grappa', 'Armagnac',
];

const STOCK_FILTERS = [
  { key: 'all' as const, label: 'Tutti', icon: 'inventory_2' },
  { key: 'low' as const, label: 'In esaurimento', icon: 'warning' },
  { key: 'out' as const, label: 'Esauriti', icon: 'block' },
];

const ALPHA_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);
  const filteredProducts = useAppStore((s) => s.filteredProducts);
  const selectProduct = useAppStore((s) => s.selectProduct);

  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [alphaFilter, setAlphaFilter] = useState<string | null>(null);

  const allItems = filteredProducts();
  const items = allItems.filter((p) => {
    const matchesStock = stockFilter === 'all'
      ? true
      : stockFilter === 'low'
        ? p.stock > 0 && p.stock <= (p.min_stock || 2)
        : p.stock === 0;
    const matchesAlpha = !alphaFilter || (p.name || '').toUpperCase().startsWith(alphaFilter);
    return matchesStock && matchesAlpha;
  });

  const grouped = useMemo(() => {
    const map = new Map<string, ProductDoc[]>();
    for (const p of items) {
      const key = p.supplier || 'Altro';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    const sorted = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return sorted;
  }, [items]);

  return (
    <div className="pb-28 max-w-[1200px] mx-auto w-full px-4 md:px-8 pt-4 md:pt-8 min-h-screen animate-[fadeIn_0.3s_ease] overflow-x-hidden">
      <div className="mb-6">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-3 tracking-tight font-bold">Prodotti</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per nome, categoria o fornitore..."
              className="w-full bg-surface-container-lowest border border-outline-variant/40 py-2.5 pl-11 pr-4 rounded-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-body-md placeholder:text-outline-variant"
            />
          </div>
        </div>
      </div>

      <ScrollArrows className="mb-4">
        <div className="flex gap-2 w-max pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setAlphaFilter(null); }}
              className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-colors cursor-pointer active:scale-93 ${
                selectedCategory === cat
                  ? 'bg-primary-container text-on-primary shadow-[0_2px_8px_rgba(114,47,55,0.08)] font-semibold'
                  : 'border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </ScrollArrows>

      <ScrollArrows className="mb-4">
        <div className="flex gap-1.5 w-max pb-2">
          <button
            onClick={() => setAlphaFilter(null)}
            className={`w-9 h-9 rounded-full font-label-sm text-label-sm transition-colors cursor-pointer active:scale-90 flex items-center justify-center ${
              alphaFilter === null
                ? 'bg-primary text-on-primary font-semibold shadow-sm'
                : 'border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            *
          </button>
          {ALPHA_LETTERS.map((letter) => {
            const hasProducts = items.some((p) => (p.name || '').toUpperCase().startsWith(letter));
            return (
              <button
                key={letter}
                onClick={() => setAlphaFilter(alphaFilter === letter ? null : letter)}
                disabled={!hasProducts}
                className={`w-9 h-9 rounded-full font-label-sm text-label-sm transition-colors cursor-pointer active:scale-90 flex items-center justify-center ${
                  alphaFilter === letter
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : hasProducts
                      ? 'border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
                      : 'text-outline-variant/40 cursor-default'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </ScrollArrows>

      <div className="flex flex-wrap gap-2 mb-6">
        {STOCK_FILTERS.map((f) => {
          const count = f.key === 'all' ? allItems.length
            : f.key === 'low' ? allItems.filter((p) => p.stock > 0 && p.stock <= (p.min_stock || 2)).length
            : allItems.filter((p) => p.stock === 0).length;
          return (
            <button
              key={f.key}
              onClick={() => setStockFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-colors cursor-pointer active:scale-95 ${
                stockFilter === f.key
                  ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                  : 'border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{f.icon}</span>
              {f.label}
              <span className={`ml-0.5 text-[11px] px-1.5 py-0.5 rounded-full ${
                stockFilter === f.key ? 'bg-on-primary/20' : 'bg-outline-variant/30'
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      <main>
        {items.length === 0 ? (
          <div className="text-center py-12 text-outline">
            <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
            <p>Nessun prodotto trovato con i filtri correnti.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([supplier, products]) => (
              <div key={supplier}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="font-title-md text-title-md text-primary/80 tracking-tight">{supplier}</h2>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-outline-variant/20 text-on-surface-variant font-medium">{products.length}</span>
                  <div className="flex-1 h-px bg-outline-variant/30" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => {
                    const dot = product.stock === 0 ? 'bg-[#494441]' : product.stock <= (product.min_stock || 2) ? 'bg-[#ba1a1a]' : 'bg-[#4a7c59]';
                    return (
                      <div
                        key={product.id}
                        onClick={() => { selectProduct(product.id); navigate(`/prodotti/${product.id}`); }}
                        className="product-card bg-[#FFFDD0] rounded-3xl border border-[#E5E0D6] overflow-hidden flex flex-col relative cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all duration-200 active:scale-[0.97]"
                      >
                        <div className="h-32 md:h-40 bg-surface-variant relative overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : null}
                          <div className={`absolute top-2 right-2 w-3.5 h-3.5 rounded-full ${dot} border-2 border-[#FFFDD0] shadow-sm`} title={`Scorta: ${product.stock}`} />
                        </div>

                        <div className="p-3.5 flex flex-col flex-1">
                          <span className="text-[10px] uppercase tracking-wider text-outline mb-1 font-semibold">{product.category}</span>
                          <h3 className="font-headline-md text-[16px] leading-tight text-primary mb-2 flex-1 line-clamp-2">{product.name}</h3>
                          {product.format && <span className="text-[10px] text-outline mb-1">{product.format}</span>}
                          <div className="font-label-md text-label-md text-primary-container font-bold">€{Number(product.price || 0).toFixed(2)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => navigate('/prodotti/nuovo')}
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-90 hover:bg-primary/90 transition-colors z-30"
        title="Aggiungi prodotto"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </div>
  );
};

export default ProductsPage;
