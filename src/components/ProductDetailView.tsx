import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import useAppStore from '../store/useAppStore';
import ScrollRightArrow from './ScrollRightArrow';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const tabs = ['Dettagli', 'Movimenti', 'QR Code'];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ProductDetailView: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedProductId = useAppStore((s) => s.selectedProductId);
  const products = useAppStore((s) => s.products);
  const updateProduct = useAppStore((s) => s.updateProduct);
  const restockProduct = useAppStore((s) => s.restockProduct);
  const sellProduct = useAppStore((s) => s.sellProduct);
  const deleteProduct = useAppStore((s) => s.deleteProduct);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const [activeTab, setActiveTab] = useState('Dettagli');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editMinStock, setEditMinStock] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSupplier, setEditSupplier] = useState('');
  const [editBarcode, setEditBarcode] = useState('');
  const [editImage, setEditImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Immagine troppo grande (max 5MB).');
      return;
    }
    const base64 = await fileToBase64(file);
    setEditImage(base64);
    setImagePreview(base64);
  };

  const handleRemoveImage = () => {
    setEditImage('');
    setImagePreview(null);
  };

  const handleSaveEdits = () => {
    if (!selectedProduct) return;
    updateProduct({
      id: selectedProduct.id,
      ...(editName !== '' ? { name: editName } : {}),
      ...(editPrice !== '' ? { price: parseFloat(editPrice) } : {}),
      ...(editStock !== '' ? { stock: parseInt(editStock) } : {}),
      ...(editMinStock !== '' ? { min_stock: parseInt(editMinStock) } : {}),
      ...(editNotes !== '' ? { notes: editNotes } : {}),
      ...(editSupplier !== '' ? { supplier: editSupplier } : {}),
      ...(editBarcode !== '' ? { barcode: editBarcode } : {}),
      ...(editImage !== null ? { image_url: editImage } : {}),
    });
    setIsEditing(false);
    setEditImage(null);
    setImagePreview(null);
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    deleteProduct(selectedProduct.id);
    navigate('/prodotti');
  };

  const startEditing = () => {
    if (!selectedProduct) return;
    setEditName(selectedProduct.name);
    setEditPrice(String(selectedProduct.price || 0));
    setEditStock(String(selectedProduct.stock));
    setEditMinStock(String(selectedProduct.min_stock || 2));
    setEditNotes(selectedProduct.notes || '');
    setEditSupplier(selectedProduct.supplier || '');
    setEditBarcode(selectedProduct.barcode || '');
    setEditImage(null);
    setImagePreview(selectedProduct.image_url || null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditImage(null);
    setImagePreview(null);
  };

  if (!selectedProduct) {
    return (
      <div className="p-8 text-center max-w-[800px] mx-auto pt-12 animate-[fadeIn_0.3s_ease]">
        <span className="material-symbols-outlined text-6xl text-outline mb-4 block">search_off</span>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Nessun prodotto selezionato</h2>
        <p className="font-body-md text-body-md text-outline mb-6">
          Vai alla sezione Prodotti e seleziona un prodotto per visualizzarne i dettagli.
        </p>
        <button
          onClick={() => navigate('/prodotti')}
          className="bg-primary-container text-on-primary font-label-lg px-6 py-3 rounded-xl hover:bg-primary transition-colors shadow-sm cursor-pointer active:scale-95"
        >
          Vai a Prodotti
        </button>
      </div>
    );
  }

  const displayImage = isEditing ? imagePreview : selectedProduct.image_url;

  return (
    <div className="max-w-[900px] mx-auto w-full px-4 md:px-8 pt-4 md:pt-8 pb-28 md:pb-12 min-h-screen animate-[fadeIn_0.3s_ease]">
      <button
        onClick={() => navigate('/prodotti')}
        className="flex items-center gap-1 text-primary mb-4 font-label-md cursor-pointer active:scale-95"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Prodotti
      </button>

      <div className="bg-[#FFFDD0] rounded-3xl soft-shadow border border-[#E5E0D6] overflow-hidden mb-6">
        {displayImage ? (
          <div className="h-40 md:h-52 bg-surface-variant relative overflow-hidden">
            <img src={displayImage} alt={selectedProduct.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-40 md:h-52 bg-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-outline/40">image</span>
          </div>
        )}

        <div className="p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              {isEditing ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="font-headline-md text-headline-md text-primary border-b-2 border-primary w-full focus:outline-none bg-transparent pb-1 mb-1"
                />
              ) : (
                <h1 className="font-headline-md text-headline-md text-primary mb-1">{selectedProduct.name}</h1>
              )}
              <span className="font-label-lg text-label-lg text-outline">{selectedProduct.category}</span>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={isEditing ? cancelEditing : startEditing}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-colors cursor-pointer active:scale-95 ${
                  isEditing
                    ? 'bg-primary-container text-on-primary border-transparent'
                    : 'bg-surface-container-lowest text-outline border-outline-variant hover:text-primary hover:border-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{isEditing ? 'close' : 'edit'}</span>
                {!isEditing && <span className="font-label-sm text-label-sm">Modifica</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ScrollRightArrow className="mb-6">
        <div className="flex gap-2 border-b border-outline-variant/30 pb-1 w-max">
          {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative px-4 py-2.5 font-label-lg rounded-xl transition-colors cursor-pointer active:scale-95"
          >
            {activeTab === tab && (
              <div className="absolute inset-0 bg-primary-container rounded-xl -z-10" />
            )}
            <span className={activeTab === tab ? 'text-on-primary font-semibold' : 'text-on-surface-variant'}>{tab}</span>
          </button>
        ))}
        </div>
      </ScrollRightArrow>

      {activeTab === 'Dettagli' && (
        <div>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="font-label-md text-label-md text-outline block mb-1">Nome</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-body-md"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-outline block mb-2">Foto Prodotto</label>
                <div className="flex gap-3 items-start">
                  {imagePreview ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-outline-variant shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-outline shrink-0">
                      <span className="material-symbols-outlined text-2xl">image</span>
                      <span className="text-[10px] mt-0.5">Nessuna</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant hover:bg-surface-variant transition-colors font-label-md text-label-md cursor-pointer active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                      Carica foto
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.setAttribute('capture', 'environment');
                          fileInputRef.current.click();
                          setTimeout(() => fileInputRef.current?.removeAttribute('capture'), 100);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant hover:bg-surface-variant transition-colors font-label-md text-label-md cursor-pointer active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                      Scatta foto
                    </button>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-outline block mb-1">Prezzo (€)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-body-md"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-outline block mb-1">Scorte Attuali</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-body-md"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-outline block mb-1">Scorte Minime</label>
                  <input
                    type="number"
                    value={editMinStock}
                    onChange={(e) => setEditMinStock(e.target.value)}
                    className="w-full p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-body-md"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-outline block mb-1">Fornitore</label>
                  <input
                    value={editSupplier}
                    onChange={(e) => setEditSupplier(e.target.value)}
                    className="w-full p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-body-md"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-outline block mb-1">Codice a Barre</label>
                  <input
                    value={editBarcode}
                    onChange={(e) => setEditBarcode(e.target.value)}
                    className="w-full p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-body-md"
                  />
                </div>
              </div>
              <div>
                <label className="font-label-md text-label-md text-outline block mb-1">Note Interne</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-body-md h-24 resize-none"
                />
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveEdits}
                  className="bg-primary-container text-on-primary font-label-lg px-6 py-3 rounded-xl hover:bg-primary transition-colors shadow-sm cursor-pointer active:scale-95"
                >
                  Salva Modifiche
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low rounded-3xl p-4 border border-outline-variant/20">
                  <span className="font-label-md text-label-md text-outline block mb-1">Prezzo</span>
                  <span className="font-headline-md text-headline-md text-primary">€{Number(selectedProduct.price || 0).toFixed(2)}</span>
                </div>
                <div className="bg-surface-container-low rounded-3xl p-4 border border-outline-variant/20">
                  <span className="font-label-md text-label-md text-outline block mb-1">Scorte Attuali</span>
                  <span className="font-headline-md text-headline-md text-primary">{selectedProduct.stock}</span>
                </div>
                <div className="bg-surface-container-low rounded-3xl p-4 border border-outline-variant/20">
                  <span className="font-label-md text-label-md text-outline block mb-1">Scorte Minime</span>
                  <span className="font-headline-md text-headline-md text-primary">{selectedProduct.min_stock || 2}</span>
                </div>
                {selectedProduct.supplier && (
                  <div className="bg-surface-container-low rounded-3xl p-4 border border-outline-variant/20">
                    <span className="font-label-md text-label-md text-outline block mb-1">Fornitore</span>
                    <span className="font-body-lg text-body-lg text-on-surface">{selectedProduct.supplier}</span>
                  </div>
                )}
                {selectedProduct.barcode && (
                  <div className="bg-surface-container-low rounded-3xl p-4 border border-outline-variant/20">
                    <span className="font-label-md text-label-md text-outline block mb-1">Codice a Barre</span>
                    <span className="font-body-lg text-body-lg text-on-surface font-mono tracking-wider">{selectedProduct.barcode}</span>
                  </div>
                )}
              </div>

              {selectedProduct.notes && (
                <div className="bg-surface-container-low rounded-3xl p-4 border border-outline-variant/20">
                  <span className="font-label-md text-label-md text-outline block mb-1">Note Interne</span>
                  <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap leading-relaxed">{selectedProduct.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  onClick={() => restockProduct(selectedProduct.id)}
                  className="flex-1 py-3.5 bg-[#3d6b4f] text-white rounded-xl hover:bg-[#2f543f] transition-colors font-label-md flex justify-center items-center gap-2 shadow-sm cursor-pointer active:scale-[0.97]"
                >
                  <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span> Rifornisci (+1)
                </button>
                <button
                  onClick={() => sellProduct(selectedProduct.id)}
                  disabled={selectedProduct.stock <= 0}
                  className="flex-1 py-3.5 bg-[#ba1a1a] text-white rounded-xl hover:bg-[#941515] transition-colors font-label-md flex justify-center items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer active:scale-[0.97]"
                >
                  <span className="material-symbols-outlined text-[18px]">remove_shopping_cart</span> Vendi (-1)
                </button>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3 mt-2 bg-surface-container-lowest text-on-error rounded-xl hover:bg-error-container transition-colors font-label-md flex justify-center items-center gap-2 border border-outline-variant/40 cursor-pointer active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span> Elimina Prodotto
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Movimenti' && (
        <div className="bg-[#FFFDD0] rounded-3xl p-5 border border-[#E5E0D6] text-center text-outline font-body-md shadow-sm">
          Cronologia movimenti (placeholder per la registrazione).
        </div>
      )}

      {activeTab === 'QR Code' && (
        <div className="bg-[#FFFDD0] rounded-3xl p-6 border border-[#E5E0D6] text-center shadow-sm">
          <h3 className="font-headline-md text-headline-md text-primary mb-4">QR Menu Pubblico</h3>
          <p className="font-body-md text-outline mb-6">Mostra questo codice al cliente per il menu.</p>
          <div className="bg-white p-4 rounded-3xl inline-block shadow-inner">
            <QRCodeSVG
              value={typeof window !== 'undefined' ? window.location.origin + '/menu' : ''}
              size={192}
              bgColor="#ffffff"
              fgColor="#722F37"
              level="M"
              includeMargin={false}
              className="w-48 h-48"
            />
          </div>
          <div className="mt-6">
            <button
              onClick={() => window.open('/menu', '_blank')}
              className="bg-primary-container text-on-primary font-label-md px-6 py-2.5 rounded-xl hover:bg-primary transition-colors shadow-sm cursor-pointer active:scale-95"
            >
              Apri Menu in una Nuova Scheda
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-[#FFFDD0] rounded-3xl p-6 w-full max-w-md border border-[#E5E0D6] shadow-xl animate-[scaleIn_0.2s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Conferma Eliminazione</h3>
            <p className="font-body-md text-outline mb-6">
              Stai per eliminare <span className="font-semibold text-on-surface">{selectedProduct.name}</span>. Questa azione è irreversibile.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-variant transition-colors font-label-md border border-outline-variant cursor-pointer active:scale-95"
              >
                Annulla
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 rounded-xl bg-error text-on-error hover:bg-error/90 transition-colors font-label-md cursor-pointer active:scale-95"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailView;
