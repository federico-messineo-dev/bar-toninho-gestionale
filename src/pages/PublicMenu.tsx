import React, { useMemo } from 'react';
import useAppStore from '../store/useAppStore';

const PublicMenu: React.FC = () => {
  const products = useAppStore((s) => s.products);

  const grouped = useMemo(() => {
    const map: Record<string, typeof products> = {};
    products.forEach((p) => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return map as Record<string, typeof products>;
  }, [products]);

  return (
    <div className="min-h-screen bg-[#F5F0E6] font-sans pb-8">
      <div className="bg-[#722F37] text-white p-6 shadow-lg">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight">Caffè Toninho</h1>
          <p className="font-body-md text-white/80 mt-1">Il nostro menu completo</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-8">
        {Object.entries(grouped).map(([category, items]: [string, typeof products]) => (
          <section key={category} className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E0D6]">
            <h2 className="font-headline-md text-headline-md text-[#722F37] mb-4 border-b border-[#E5E0D6] pb-2">{category}</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b border-[#E5E0D6]/50 last:border-0 transition-colors hover:pl-2"
                >
                  <span className="font-body-lg text-on-surface pr-4">{item.name}</span>
                  <span className="font-label-lg text-[#722F37] font-semibold shrink-0">€{Number(item.price || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default PublicMenu;
