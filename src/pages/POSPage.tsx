import { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import FloatingCartBar from '../components/FloatingCartBar';
import CartModal from '../components/CartModal';
import ReceiptModal from '../components/ReceiptModal';
import type { Sale } from '../types';

export default function POSPage() {
  const { products, cart, addToCart } = useStore();
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  function qtyFor(productId: string) {
    return cart.find((i) => i.productId === productId)?.qty ?? 0;
  }

  function handleOpenCart() {
    if (cart.length === 0) return;
    setCartOpen(true);
  }

  function handleSaleFinished(sale: Sale) {
    setCartOpen(false);
    setReceiptSale(sale);
  }

  return (
    <section className="space-y-4">
      <div className="relative">
        <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
      </div>

      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Selecione para Adicionar
        </span>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          {filtered.length} produtos
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-24">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            qty={qtyFor(product.id)}
            onClick={() => addToCart(product.id)}
          />
        ))}
      </div>

      <FloatingCartBar onOpenCart={handleOpenCart} />

      {cartOpen && (
        <CartModal onClose={() => setCartOpen(false)} onSaleFinished={handleSaleFinished} />
      )}

      {receiptSale && <ReceiptModal sale={receiptSale} onClose={() => setReceiptSale(null)} />}
    </section>
  );
}
