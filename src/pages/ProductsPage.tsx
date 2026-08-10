import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductEditModal from '../components/ProductEditModal';
import { formatMoney } from '../utils/format';
import type { Product } from '../types';

interface LayoutContext {
  onOpenBackup: () => void;
}

export default function ProductsPage() {
  const { onOpenBackup } = useOutletContext<LayoutContext>();
  const { products, removeProduct } = useStore();
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);

  return (
    <section className="space-y-4 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Gerenciar Tabela de Preços</h2>
        <button
          onClick={() => setEditingProduct(null)}
          className="text-xs bg-emerald-600 text-white font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition"
        >
          <i className="fa-solid fa-plus"></i> Novo Item
        </button>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <i className="fa-solid fa-floppy-disk text-base"></i>
          </div>
          <div>
            <h4 className="font-bold text-xs text-emerald-900">Segurança de Dados</h4>
            <p className="text-[11px] text-emerald-700">Backup em arquivo & Nuvem</p>
          </div>
        </div>
        <button
          onClick={onOpenBackup}
          className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-2 rounded-xl active:scale-95 transition shadow-sm"
        >
          Opções
        </button>
      </div>

      <div className="space-y-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-gray-800 text-sm">{p.name}</h4>
              <span className="text-xs text-emerald-600 font-extrabold">{formatMoney(p.price)}</span>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setEditingProduct(p)}
                className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 font-bold flex items-center justify-center active:bg-gray-200"
              >
                <i className="fa-solid fa-pen text-xs"></i>
              </button>
              <button
                onClick={() => removeProduct(p.id)}
                className="w-8 h-8 rounded-xl bg-red-50 text-red-500 font-bold flex items-center justify-center active:bg-red-100"
              >
                <i className="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingProduct !== undefined && (
        <ProductEditModal product={editingProduct} onClose={() => setEditingProduct(undefined)} />
      )}
    </section>
  );
}
