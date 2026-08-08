import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const CATEGORIES = [
  'Amari', 'Vino', 'Spumante', 'Champagne', 'Grappa',
  'Whisky', 'Rum', 'Cognac', 'Armagnac', 'Vermouth', 'Calvados',
  'Liquori', 'Gin', 'Birra', 'Confezioni',
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const addProduct = useAppStore((s) => s.addProduct);
  const authUser = useAppStore((s) => s.authUser);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [pricePurchase, setPricePurchase] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [format, setFormat] = useState('');
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('');
  const [stock, setStock] = useState('0');
  const [minStock, setMinStock] = useState('2');
  const [active, setActive] = useState(true);
  const [allergens, setAllergens] = useState('');
  const [notes, setNotes] = useState('');
  const [barcode, setBarcode] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ image: 'Immagine troppo grande (max 5MB).' });
      return;
    }
    const base64 = await fileToBase64(file);
    setImage(base64);
    setImagePreview(base64);
    setErrors((prev) => { const { image: _, ...rest } = prev; return rest; });
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Il nome è obbligatorio';
    const p = parseFloat(price);
    if (!price || isNaN(p) || p <= 0) e.price = 'Il prezzo deve essere maggiore di 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const id = await addProduct({
      name: name.trim(),
      price: parseFloat(price),
      price_purchase: pricePurchase ? parseFloat(pricePurchase) : null,
      category,
      format: format || null,
      description,
      supplier: supplier || null,
      stock: parseInt(stock) || 0,
      min_stock: parseInt(minStock) || 2,
      active,
      image_url: image || '',
      barcode: barcode || null,
      allergens,
      notes,
      requires_review: false,
    });

    setSaving(false);
    navigate(`/prodotti/${id}`);
  };

  const inputClass = 'w-full p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-body-md';

  return (
    <div className="max-w-[700px] mx-auto w-full px-4 md:px-8 pt-4 md:pt-8 pb-28 md:pb-12 min-h-screen animate-[fadeIn_0.3s_ease]">
      <button
        onClick={() => navigate('/prodotti')}
        className="flex items-center gap-1 text-primary mb-4 font-label-md cursor-pointer active:scale-95"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Prodotti
      </button>

      <h1 className="font-headline-lg text-headline-lg text-primary mb-6">Nuovo Prodotto</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.name && <p className="text-error text-sm font-label-sm">{errors.name}</p>}
        <div>
          <label className="font-label-md text-label-md text-outline block mb-1">Nome *</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => { const { name: _, ...r } = p; return r; }); }}
            placeholder="Es. Amaro del Capo"
            className={inputClass}
          />
        </div>

        <div>
          <label className="font-label-md text-label-md text-outline block mb-2">Foto Prodotto</label>
          <div className="flex gap-3 items-start">
            {imagePreview ? (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-outline-variant shrink-0">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={handleRemoveImage} className="absolute top-1 right-1 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center text-xs cursor-pointer">✕</button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-outline shrink-0">
                <span className="material-symbols-outlined text-2xl">image</span>
                <span className="text-[10px] mt-0.5">Nessuna</span>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant hover:bg-surface-variant transition-colors font-label-md text-label-md cursor-pointer active:scale-95">
                <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                Carica foto
              </button>
              <button type="button" onClick={() => { if (fileInputRef.current) { fileInputRef.current.setAttribute('capture', 'environment'); fileInputRef.current.click(); setTimeout(() => fileInputRef.current?.removeAttribute('capture'), 100); } }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant hover:bg-surface-variant transition-colors font-label-md text-label-md cursor-pointer active:scale-95">
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                Scatta foto
              </button>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          {errors.image && <p className="text-error text-sm font-label-sm mt-1">{errors.image}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-label-md text-label-md text-outline block mb-1">Prezzo (€) *</label>
            <input type="number" step="0.01" min="0" value={price} onChange={(e) => { setPrice(e.target.value); setErrors((p) => { const { price: _, ...r } = p; return r; }); }} placeholder="0.00" className={inputClass} />
            {errors.price && <p className="text-error text-sm font-label-sm mt-1">{errors.price}</p>}
          </div>
          {authUser?.role === 'admin' && (
            <div>
              <label className="font-label-md text-label-md text-outline block mb-1">Prezzo Acquisto (€)</label>
              <input type="number" step="0.01" min="0" value={pricePurchase} onChange={(e) => setPricePurchase(e.target.value)} placeholder="0.00" className={inputClass} />
            </div>
          )}
          <div>
            <label className="font-label-md text-label-md text-outline block mb-1">Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="font-label-md text-label-md text-outline block mb-1">Formato</label>
            <input value={format} onChange={(e) => setFormat(e.target.value)} placeholder="Es. 0,75L" className={inputClass} />
          </div>
          <div>
            <label className="font-label-md text-label-md text-outline block mb-1">Scorte Iniziali</label>
            <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="font-label-md text-label-md text-outline block mb-1">Scorte Minime</label>
            <input type="number" min="0" value={minStock} onChange={(e) => setMinStock(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="font-label-md text-label-md text-outline block mb-1">Fornitore</label>
            <input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Es. Distilleria XYZ" className={inputClass} />
          </div>
          <div>
            <label className="font-label-md text-label-md text-outline block mb-1">Codice a Barre</label>
            <input value={barcode} onChange={(e) => setBarcode(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="font-label-md text-label-md text-outline block mb-1">Descrizione</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} h-20 resize-none`} placeholder="Descrizione del prodotto..." />
        </div>

        <div>
          <label className="font-label-md text-label-md text-outline block mb-1">Allergeni</label>
          <input value={allergens} onChange={(e) => setAllergens(e.target.value)} placeholder="Es. Solfiti" className={inputClass} />
        </div>

        <div>
          <label className="font-label-md text-label-md text-outline block mb-1">Note Interne</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} h-20 resize-none`} placeholder="Note per il personale..." />
        </div>

        <div className="flex items-center gap-3">
          <label className="font-label-md text-outline">Visibile nel Menu</label>
          <button type="button" onClick={() => setActive(!active)} className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${active ? 'bg-primary' : 'bg-outline-variant'}`}>
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${active ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
          <button type="button" onClick={() => navigate('/prodotti')} className="px-5 py-3 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-variant transition-colors font-label-md border border-outline-variant cursor-pointer active:scale-95">
            Annulla
          </button>
          <button type="submit" disabled={saving} className="bg-primary-container text-on-primary font-label-lg px-6 py-3 rounded-xl hover:bg-primary transition-colors shadow-sm cursor-pointer active:scale-95 disabled:opacity-70">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                Salvataggio...
              </span>
            ) : 'Crea Prodotto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
