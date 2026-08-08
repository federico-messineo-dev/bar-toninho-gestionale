import React from 'react';
import { Product, ActiveTab } from '../types';
import ScrollArrows from './ScrollArrows';

interface DashboardViewProps {
  products: Product[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectProduct: (product: Product) => void;
  onRestock: (productId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  setActiveTab,
  onSelectProduct,
  onRestock,
}) => {
  const lowStockItems = products.filter((p) => p.stock <= 2 || p.statusDot === 'low');
  const activeQRCount = products.filter((p) => p.visibleOnMenu).length > 0 ? 1 : 0;

  return (
    <div className="p-4 md:p-8 lg:px-12 max-w-[1440px] mx-auto w-full pb-28 md:pb-12">
      {/* Page Title */}
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6">
        Panoramica Caffè Toninho
      </h2>

      {/* Bento Grid Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-[#FFFDD0] p-6 rounded-lg soft-shadow hover-lift transition-all border border-[#E5E0D6] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-label-md text-outline">
              Prodotti Totali
            </span>
            <span className="material-symbols-outlined text-primary/70">
              inventory_2
            </span>
          </div>
          <span className="font-display-lg text-display-lg text-primary">
            {products.length}
          </span>
        </div>

        {/* Card 2 */}
        <div className="bg-[#FFFDD0] p-6 rounded-lg soft-shadow hover-lift transition-all border border-[#E5E0D6] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-error-container rounded-bl-full -z-0 opacity-50"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="font-label-md text-label-md text-outline">
              Scorte in Esaurimento
            </span>
            <span className="material-symbols-outlined text-error">
              warning
            </span>
          </div>
          <span className="font-display-lg text-display-lg text-error relative z-10">
            {lowStockItems.length}
          </span>
        </div>

        {/* Card 3 */}
        <div className="bg-[#FFFDD0] p-6 rounded-lg soft-shadow hover-lift transition-all border border-[#E5E0D6] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-label-md text-outline">
              Menu QR Attivi
            </span>
            <span className="material-symbols-outlined text-primary/70">
              qr_code_2
            </span>
          </div>
          <span className="font-display-lg text-display-lg text-primary">
            {activeQRCount}
          </span>
        </div>

        {/* Card 4 */}
        <div className="bg-[#FFFDD0] p-6 rounded-lg soft-shadow hover-lift transition-all border border-[#E5E0D6] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-label-md text-outline">
              Vendite Oggi
            </span>
            <span className="material-symbols-outlined text-primary/70">
              euro_symbol
            </span>
          </div>
          <span className="font-display-lg text-display-lg text-primary">
            €420
          </span>
        </div>
      </div>

      {/* Low Stock Section Header */}
      <div className="mb-4 flex justify-between items-end border-b border-outline-variant pb-2">
        <h3 className="font-headline-md text-headline-md text-on-surface">
          Prodotti in esaurimento
        </h3>
        <button
          onClick={() => setActiveTab('prodotti')}
          className="font-label-md text-label-md text-primary hover:text-secondary transition-colors cursor-pointer"
        >
          Vedi tutti
        </button>
      </div>

      {/* Low Stock Horizontal Carousel / Grid */}
      <ScrollArrows>
        <div className="flex pb-4 gap-4 snap-x">
          {lowStockItems.map((item) => (
          <div
            key={item.id}
            className="min-w-[280px] w-[280px] flex-shrink-0 bg-[#FFFDD0] rounded-lg soft-shadow p-4 border border-[#E5E0D6] flex flex-col snap-start hover-lift transition-all"
          >
            <div
              onClick={() => onSelectProduct(item)}
              className="h-32 mb-4 rounded-md overflow-hidden bg-surface-container-low relative cursor-pointer group"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 px-2 py-1 bg-error-container text-on-error-container font-label-sm text-label-sm rounded-full font-semibold shadow-sm">
                Scorta: {item.stock}{item.stockUnit === 'kg' ? 'kg' : ''}
              </span>
            </div>

            <h4
              onClick={() => onSelectProduct(item)}
              className="font-headline-md text-[18px] text-on-surface mb-1 truncate cursor-pointer hover:text-primary transition-colors"
            >
              {item.name}
            </h4>
            <p className="font-body-md text-sm text-outline mb-4">
              {item.category} • {item.subcategory}
            </p>

            <button
              onClick={() => onRestock(item.id)}
              className="mt-auto w-full bg-primary-container text-on-primary font-label-md py-2.5 rounded-md hover:bg-primary transition-colors soft-shadow flex justify-center items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">
                add_shopping_cart
              </span>
              Rifornisci
            </button>
          </div>
        ))}
        </div>
      </ScrollArrows>
    </div>
  );
};
