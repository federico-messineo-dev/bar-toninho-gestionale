import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const CATEGORIES = [
  'Tutti', 'Amari', 'Vino', 'Spumante', 'Champagne', 'Grappa',
  'Whisky', 'Rum', 'Cognac', 'Armagnac', 'Vermouth', 'Liquori',
  'Gin', 'Birra', 'Confezioni',
];

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);
  const filteredProducts = useAppStore((s) => s.filteredProducts);
  const selectProduct = useAppStore((s) => s.selectProduct);

  const items = filteredProducts();

  return (
    <div className="pb-28 max-w-[1200px] mx-auto w-full px-4 md:px-8 pt-4 md:pt-8 min-h-screen animate-[fadeIn_0.3s_ease]">
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

      <div className="mb-6 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 w-max pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
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
      </div>

      <main>
        {items.length === 0 ? (
          <div className="text-center py-12 text-outline">
            <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
            <p>Nessun prodotto trovato con i filtri correnti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((product) => {
              const dot = product.stock === 0 ? 'bg-[#494441]' : product.stock <= (product.min_stock || 2) ? 'bg-[#ba1a1a]' : 'bg-[#4a7c59]';
              return (
                <div
                  key={product.id}
                  onClick={() => { selectProduct(product.id); navigate(`/prodotti/${product.id}`); }}
                  className="product-card bg-[#FFFDD0] rounded-2xl border border-[#E5E0D6] overflow-hidden flex flex-col relative cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all duration-200 active:scale-[0.97]"
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
                    <div className="font-label-md text-label-md text-primary-container font-bold">€{Number(product.price || 0).toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <button
        onClick={() => navigate('/prodotti/nuovo')}
        className="fixed bottom-20 right-5 lg:bottom-8 lg:right-8 w-14 h-14 bg-primary text-white rounded-2xl shadow-lg flex items-center justify-center cursor-pointer active:scale-90 hover:bg-primary/90 transition-colors z-30"
        title="Aggiungi prodotto"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </div>
  );
};

export default ProductsPage;
