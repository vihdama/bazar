import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatMoney } from '../utils/format';
import type { PaymentMethod, Sale } from '../types';

interface CartModalProps {
  onClose: () => void;
  onSaleFinished: (sale: Sale) => void;
}

const PAYMENT_OPTIONS: { key: PaymentMethod; icon: string; label: string }[] = [
  { key: 'PIX', icon: 'fa-brands fa-pix', label: 'PIX' },
  { key: 'Dinheiro', icon: 'fa-solid fa-money-bill-wave', label: 'Dinheiro' },
  { key: 'Cartão', icon: 'fa-solid fa-credit-card', label: 'Cartão' },
  { key: 'Fiado', icon: 'fa-solid fa-handshake', label: 'Fiado' },
];

export default function CartModal({ onClose, onSaleFinished }: CartModalProps) {
  const { cart, updateCartQty, getCartTotal, selectedPayment, setSelectedPayment, finishSale } =
    useStore();
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFinishSale() {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const sale = await finishSale({ customer: customerName.trim(), discount });
      if (sale) {
        setCustomerName('');
        setDiscount(0);
        onSaleFinished(sale);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end transition-opacity duration-300">
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-basket-shopping text-emerald-600"></i>
            <h3 className="font-bold text-gray-800 text-base">Carrinho de Venda</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
          {cart.map((item) => (
            <div key={item.productId} className="flex items-center justify-between py-2">
              <div className="flex-1 pr-2">
                <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                <span className="text-xs text-emerald-600 font-semibold">
                  {formatMoney(item.price)} cada
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateCartQty(item.productId, -1)}
                  className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 font-bold flex items-center justify-center active:bg-gray-200"
                >
                  <i className="fa-solid fa-minus text-xs"></i>
                </button>
                <span className="font-extrabold text-sm w-5 text-center">{item.qty}</span>
                <button
                  onClick={() => updateCartQty(item.productId, 1)}
                  className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center active:bg-emerald-200"
                >
                  <i className="fa-solid fa-plus text-xs"></i>
                </button>
              </div>

              <div className="w-20 text-right font-extrabold text-gray-800 text-sm">
                {formatMoney(item.price * item.qty)}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Cliente (Opcional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ex: Maria Santos"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSelectedPayment(opt.key)}
                  className={`py-2 px-1 rounded-xl border font-bold text-xs flex flex-col items-center gap-1 ${
                    selectedPayment === opt.key
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 font-semibold'
                  }`}
                >
                  <i className={`${opt.icon} text-base`}></i> {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
            <span>Desconto (R$):</span>
            <input
              type="number"
              value={discount}
              min={0}
              step={1}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-lg text-right font-bold text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-gray-600">Total a Pagar</span>
            <span className="text-2xl font-black text-emerald-700">
              {formatMoney(getCartTotal(discount))}
            </span>
          </div>

          <button
            onClick={handleFinishSale}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold rounded-2xl shadow-lg active:scale-[0.98] transition flex items-center justify-center gap-2 text-base"
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i> Salvando...
              </>
            ) : (
              <>
                <i className="fa-solid fa-circle-check"></i> Finalizar Venda
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
