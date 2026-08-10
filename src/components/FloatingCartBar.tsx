import { useStore } from '../context/StoreContext';
import { formatMoney } from '../utils/format';

interface FloatingCartBarProps {
  onOpenCart: () => void;
}

export default function FloatingCartBar({ onOpenCart }: FloatingCartBarProps) {
  const { getCartTotalItems, getCartTotal } = useStore();
  const totalItems = getCartTotalItems();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-20 transition-all duration-300">
      <button
        onClick={onOpenCart}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3.5 rounded-2xl shadow-xl flex items-center justify-between active:scale-[0.98] transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-white text-emerald-700 font-extrabold text-xs flex items-center justify-center">
            {totalItems}
          </div>
          <span className="text-sm font-semibold">Ver Carrinho</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold">{formatMoney(getCartTotal(0))}</span>
          <i className="fa-solid fa-chevron-right text-xs"></i>
        </div>
      </button>
    </div>
  );
}
