import React, { useState } from 'react';
import { Product } from '../types';
import ScrollArrows from './ScrollArrows';

interface ProductsViewProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddProduct: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  searchQuery,
  setSearchQuery,
  onSelectProduct,
  onAddProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tutti');

  const categories = ['Tutti', 'Vino', 'Caffè', 'Amari', 'Grappa', 'Whisky'];

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'Tutti' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-28 max-w-[1200px] mx-auto w-full px-4 md:px-8 pt-4 md:pt-8 min-h-screen">
      {/* Search & Camera Header (Mobile/Tablet helper) */}
      <div className="mb-6">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-3 tracking-tight font-bold">
          Prodotti
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca prodotto..."
              className="w-full bg-surface-container-lowest border-b border-on-surface-variant py-2 pl-10 pr-4 rounded-t-lg focus:outline-none focus:border-b-2 focus:border-focus transition-colors font-body-md placeholder:text-outline-variant"
            />
          </div>
          <button
            onClick={() => alert('Scanner fotocamera avviato')}
            className="w-10 h-10 bg-primary-container text-on-primary rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors shadow-[0_4px_12px_rgba(15,10,8,0.4)] cursor-pointer"
            title="Scansiona Barcode"
          >
            <span className="material-symbols-outlined">photo_camera</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <ScrollArrows className="mb-6">
        <div className="flex gap-2 w-max pb-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary shadow-[0_2px_8px_rgba(15,10,8,0.4)] font-semibold'
                    : 'border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </ScrollArrows>

      {/* Product Grid */}
      <main>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-outline">
            <span className="material-symbols-outlined text-4xl mb-2">
              inventory_2
            </span>
            <p>Nessun prodotto trovato con i filtri correnti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const dotColor =
                product.statusDot === 'low' || product.stock <= 2
                  ? 'bg-error'
                  : product.statusDot === 'out' || product.stock === 0
                  ? 'bg-tertiary'
                  : 'bg-success';

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="product-card bg-card rounded-lg border border-outline-variant overflow-hidden flex flex-col relative cursor-pointer hover:border-primary transition-all hover-lift"
                >
                  <div className="h-32 md:h-40 bg-surface-variant relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Stock Status Dot */}
                    <div
                      className={`absolute top-2 right-2 w-3.5 h-3.5 rounded-full ${dotColor} border-2 border-card shadow-sm`}
                      title={`Scorta: ${product.stock}`}
                    ></div>
                  </div>

                  <div className="p-3.5 flex flex-col flex-1">
                    <span className="text-[10px] uppercase tracking-wider text-outline mb-1 font-semibold">
                      {product.category} • {product.subcategory}
                    </span>
                    <h3 className="font-headline-md text-[16px] leading-tight text-primary mb-2 flex-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="font-label-md text-label-md text-primary font-bold">
                      €{product.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={onAddProduct}
        className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 bg-primary-container text-on-primary rounded-full shadow-[0_4px_12px_rgba(15,10,8,0.45)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50 cursor-pointer hover:bg-primary/90"
        title="Aggiungi Prodotto"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </div>
  );
};
