import React, { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import useAppStore from '../store/useAppStore';

const MenuQRPage: React.FC = () => {
  const [showList, setShowList] = useState(false);
  const products = useAppStore((s) => s.products);
  const menuUrl = useMemo(() => window.location.origin + '/menu', []);

  return (
    <div className="p-4 md:p-8 lg:px-12 max-w-[1440px] mx-auto w-full pb-28 md:pb-12 min-h-screen animate-[fadeIn_0.3s_ease]">
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6">
        Menu QR Pubblico
      </h2>

      <div className="bg-[#FFFDD0] p-6 md:p-8 rounded-3xl soft-shadow border border-[#E5E0D6] flex flex-col items-center justify-center text-center">
        <div className="bg-white p-5 rounded-3xl inline-block shadow-md mb-4">
          <QRCodeSVG
            value={menuUrl}
            size={192}
            bgColor="#ffffff"
            fgColor="#722F37"
            level="M"
            includeMargin={false}
            className="w-48 h-48 md:w-56 md:h-56"
          />
        </div>
        <h3 className="font-headline-md text-headline-md text-primary mb-2">Scansiona per il Menu Completo</h3>
        <p className="font-body-md text-outline max-w-sm mb-4">Mostra questo codice al cliente per accedere al menu interattivo e aggiornato in tempo reale.</p>

        <button
          onClick={() => window.open('/menu', '_blank')}
          className="bg-primary-container text-on-primary font-label-lg px-6 py-3 rounded-xl hover:bg-primary transition-colors shadow-sm cursor-pointer active:scale-95 mb-6"
        >
          Apri Menu Anteprima
        </button>

        <button
          onClick={() => setShowList(!showList)}
          className="flex items-center gap-2 font-label-md text-outline hover:text-primary transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] transition-transform duration-200" style={{ transform: showList ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            expand_more
          </span>
          {showList ? 'Nascondi Dettagli' : 'Mostra Dettagli'}
        </button>
      </div>

      {showList && (
        <div className="mt-6 bg-surface-container-lowest rounded-3xl p-4 border border-outline-variant/20 shadow-sm animate-[slideDown_0.2s_ease]">
          <div className="max-h-64 overflow-y-auto space-y-2">
            {products.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 px-3 bg-[#FFFDD0] rounded-xl border border-[#E5E0D6]/50 hover:bg-primary-container/30 transition-colors"
              >
                <span className="font-body-md text-on-surface truncate pr-4">{item.name}</span>
                <span className="font-label-md text-outline shrink-0">Scorta: {item.stock}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuQRPage;
