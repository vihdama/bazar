import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types';

interface ProductEditModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductEditModal({ product, onClose }: ProductEditModalProps) {
  const { saveProduct } = useStore();
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product?.price ?? 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await saveProduct({ id: product?.id, name: name.trim(), price });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-base">
            {product ? 'Editar Produto' : 'Adicionar Produto'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Nome do Produto
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Calça Jeans"
              required
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Preço (R$)
            </label>
            <input
              type="number"
              value={price}
              min={0}
              step={0.01}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              required
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold rounded-2xl shadow-lg active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i> Salvando...
              </>
            ) : (
              'Salvar Produto'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
