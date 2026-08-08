import React, { useState } from 'react';
import { Product } from '../types';
import { QR_CODE_URL } from '../data/mockData';

interface MenuQRViewProps {
  products: Product[];
  onToggleVisibility: (productId: string) => void;
  onBulkActivateWines: () => void;
  onBulkDeactivateOut: () => void;
}

export const MenuQRView: React.FC<MenuQRViewProps> = ({
  products,
  onToggleVisibility,
  onBulkActivateWines,
  onBulkDeactivateOut,
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'public' | 'manage'>(
    'manage'
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = QR_CODE_URL;
    link.download = 'caffe_toninho_menu_qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 lg:px-12 max-w-[800px] mx-auto w-full pb-28 min-h-screen">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline-md text-headline-md text-primary font-bold">
          Menu QR
        </h1>
      </div>

      {/* View Switcher Pill Bar */}
      <div className="flex bg-surface-container-highest rounded-full p-1 shadow-sm mb-6 max-w-md mx-auto">
        <button
          onClick={() => setActiveViewMode('public')}
          className={`flex-1 py-2 text-center rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
            activeViewMode === 'public'
              ? 'bg-surface text-primary shadow-sm font-bold'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Vista Pubblica
        </button>
        <button
          onClick={() => setActiveViewMode('manage')}
          className={`flex-1 py-2 text-center rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
            activeViewMode === 'manage'
              ? 'bg-surface text-primary shadow-sm font-bold'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Gestione Visibilità
        </button>
      </div>

      {/* QR Code & Quick Actions Section */}
      <section className="bg-[#FFFDD0] rounded-xl p-6 soft-shadow flex flex-col items-center gap-6 border border-[#E5E0D6] mb-6">
        <h2 className="font-headline-md text-headline-md text-primary text-center">
          Il tuo Menu QR - Caffè Toninho
        </h2>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-outline-variant">
          <img
            src={QR_CODE_URL}
            alt="Caffè Toninho Menu QR Code"
            className="w-48 h-48 object-contain"
          />
        </div>
        <div className="flex gap-4 w-full max-w-sm">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-primary text-primary font-label-md text-label-md hover:bg-primary-fixed-dim transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              content_copy
            </span>
            {copied ? 'Copiato!' : 'Copia Link'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Scarica QR
          </button>
        </div>
      </section>

      {/* Bulk Actions */}
      <section className="flex gap-4 mb-8">
        <button
          onClick={onBulkActivateWines}
          className="flex-1 py-2.5 px-3 rounded-lg bg-surface-container-high text-primary font-label-sm text-label-sm font-bold shadow-sm active:scale-95 transition-transform border border-outline-variant cursor-pointer hover:bg-surface-variant"
        >
          Attiva tutti vini
        </button>
        <button
          onClick={onBulkDeactivateOut}
          className="flex-1 py-2.5 px-3 rounded-lg bg-surface-container-high text-primary font-label-sm text-label-sm font-bold shadow-sm active:scale-95 transition-transform border border-outline-variant cursor-pointer hover:bg-surface-variant"
        >
          Disattiva esauriti
        </button>
      </section>

      {/* Product Visibility Items */}
      <section className="flex flex-col gap-3">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider pl-1 font-bold">
          Catalogo Menu Caffè Toninho
        </h3>

        {products.map((product) => {
          const isOut = product.stock === 0;

          return (
            <div
              key={product.id}
              className={`bg-[#FFFDD0] rounded-lg p-4 flex justify-between items-center soft-shadow transition-all border border-[#E5E0D6] ${
                !product.visibleOnMenu ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-col pr-4">
                <span className="font-headline-md text-headline-md text-on-surface text-lg font-semibold">
                  {product.name}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-body-md text-body-md text-on-surface-variant text-sm">
                    {product.format} • {product.stock} in stock
                  </span>
                  {isOut && (
                    <span className="px-2 py-0.5 rounded-full bg-[#494441] text-white font-label-sm text-[10px]">
                      Esaurito
                    </span>
                  )}
                </div>
              </div>

              {/* Custom Toggle Switch */}
              <button
                type="button"
                onClick={() => onToggleVisibility(product.id)}
                className={`relative inline-flex h-7 w-13 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  product.visibleOnMenu
                    ? 'bg-primary-container'
                    : 'bg-surface-variant'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    product.visibleOnMenu ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </section>
    </div>
  );
};
