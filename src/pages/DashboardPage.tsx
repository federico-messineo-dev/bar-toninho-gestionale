import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import ScrollArrows from '../components/ScrollArrows';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const products = useAppStore((s) => s.products);
  const lowStockProducts = useAppStore((s) => s.lowStockProducts);
  const restockProduct = useAppStore((s) => s.restockProduct);
  const selectProduct = useAppStore((s) => s.selectProduct);
  const todaySalesAmount = useAppStore((s) => s.todaySalesAmount);
  const todaySalesCount = useAppStore((s) => s.todaySalesCount);
  const resetTodaySales = useAppStore((s) => s.resetTodaySales);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const low = lowStockProducts();
  const activeQRCount = products.filter((p) => p.active).length > 0 ? 1 : 0;
  const salesAmount = todaySalesAmount();
  const salesCount = todaySalesCount();

  return (
    <div className="p-4 md:p-8 lg:px-12 max-w-[1440px] mx-auto w-full pb-28 md:pb-12 animate-[fadeIn_0.3s_ease]">
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6">
        Panoramica Caffè Toninho
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <button onClick={() => navigate('/prodotti')} className="bg-[#FFFDD0] p-6 rounded-3xl soft-shadow border border-[#E5E0D6] flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200 active:scale-[0.97] text-left">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-md text-label-md text-outline">Prodotti Totali</span>
              <span className="material-symbols-outlined text-primary/70">inventory_2</span>
            </div>
            <span className="font-display-lg text-display-lg text-primary">{products.length}</span>
          </div>
        </button>

        <button onClick={() => navigate('/prodotti')} className="bg-[#FFFDD0] p-6 rounded-3xl soft-shadow border border-[#E5E0D6] flex flex-col justify-between relative overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200 active:scale-[0.97] text-left">
          <div className="flex flex-col h-full relative z-10">
            <div className="absolute top-0 right-0 w-16 h-16 bg-error-container rounded-bl-full -z-0 opacity-50" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="font-label-md text-label-md text-outline">Scorte in Esaurimento</span>
              <span className={`material-symbols-outlined text-error ${low.length > 0 ? 'animate-pulse' : ''}`}>
                warning
              </span>
            </div>
            <span className="font-display-lg text-display-lg text-error relative z-10">{low.length}</span>
          </div>
        </button>

        <button onClick={() => navigate('/qr-menu')} className="bg-[#FFFDD0] p-6 rounded-3xl soft-shadow border border-[#E5E0D6] flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200 active:scale-[0.97] text-left">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-md text-label-md text-outline">Menu QR Attivi</span>
              <span className="material-symbols-outlined text-primary/70">qr_code_2</span>
            </div>
            <span className="font-display-lg text-display-lg text-primary">{activeQRCount}</span>
          </div>
        </button>

        <div className="bg-[#FFFDD0] p-6 rounded-3xl soft-shadow border border-[#E5E0D6] flex flex-col justify-between cursor-default">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-md text-label-md text-outline">Vendite Oggi</span>
              <span className="material-symbols-outlined text-primary/70">euro_symbol</span>
            </div>
            <span className="font-display-lg text-display-lg text-primary">€{salesAmount.toFixed(2)}</span>
            <span className="font-label-sm text-label-sm text-outline mt-1">{salesCount} vendit{salesCount === 1 ? 'a' : 'e'}</span>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="mt-3 w-full text-xs text-outline hover:text-error transition-colors cursor-pointer py-1"
            >
              Azzerare vendite
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-end border-b border-outline-variant pb-2">
        <h3 className="font-headline-md text-headline-md text-on-surface">Prodotti in esaurimento</h3>
        <button
          onClick={() => navigate('/prodotti')}
          className="font-label-md text-label-md text-primary hover:text-secondary transition-colors cursor-pointer"
        >
          Vedi tutti
        </button>
      </div>

      <ScrollArrows>
        <div className="flex flex-nowrap pb-4 gap-4 snap-x">
          {low.map((item) => (
          <div
            key={item.id}
            className="min-w-[280px] w-[280px] flex-shrink-0 bg-[#FFFDD0] rounded-3xl soft-shadow p-4 border border-[#E5E0D6] flex flex-col snap-start cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all duration-200 active:scale-[0.97]"
          >
            <div
              onClick={() => { selectProduct(item.id); navigate(`/prodotti/${item.id}`); }}
              className="h-32 mb-4 rounded-xl overflow-hidden bg-surface-container-low relative group"
            >
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              )}
              <span className="absolute top-2 left-2 px-2 py-1 bg-error-container text-on-error-container font-label-sm text-label-sm rounded-full font-semibold shadow-sm animate-pulse">
                Scorta: {item.stock}
              </span>
            </div>

            <h4
              onClick={() => { selectProduct(item.id); navigate(`/prodotti/${item.id}`); }}
              className="font-headline-md text-[18px] text-on-surface mb-1 truncate cursor-pointer hover:text-primary transition-colors"
            >
              {item.name}
            </h4>
            <p className="font-body-md text-sm text-outline mb-4">{item.category}</p>

            <button
              onClick={() => restockProduct(item.id)}
              className="mt-auto w-full bg-primary-container text-on-primary font-label-md py-2.5 rounded-full hover:bg-primary transition-colors soft-shadow flex justify-center items-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              Rifornisci
            </button>
          </div>
        ))}
        </div>
      </ScrollArrows>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface rounded-3xl p-6 max-w-sm w-full soft-shadow border border-outline-variant animate-[fadeIn_0.15s_ease]">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Azzerare vendite di oggi?</h3>
            <p className="font-body-md text-body-md text-outline mb-6">
              Il totale di €{salesAmount.toFixed(2)} ({salesCount} vendit{salesCount === 1 ? 'a' : 'e'}) verrà azzerato. Questa azione non può essere annullata.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-full border border-outline-variant font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                onClick={() => { resetTodaySales(); setShowResetConfirm(false); }}
                className="flex-1 py-3 rounded-full bg-error text-on-error font-label-md text-label-md hover:bg-error/80 transition-colors cursor-pointer"
              >
                Azzerare
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
