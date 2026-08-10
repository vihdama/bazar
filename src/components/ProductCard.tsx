import type { Product } from '../types';
import { formatMoney } from '../utils/format';

interface ProductCardProps {
  product: Product;
  qty: number;
  onClick: () => void;
}

export default function ProductCard({ product, qty, onClick }: ProductCardProps) {
  return (
    <div
      onClick={onClick}
      className={`product-pill bg-white p-4 flex flex-col items-center justify-center text-center cursor-pointer relative shadow-sm hover:shadow-md transition ${
        qty > 0 ? 'bg-emerald-50/60 ring-2 ring-emerald-500' : ''
      }`}
    >
      {qty > 0 && (
        <div className="absolute -top-1 -right-1 bg-emerald-600 text-white font-extrabold text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-md">
          {qty}
        </div>
      )}
      <h3 className="font-bold text-gray-800 text-sm leading-snug">{product.name}</h3>
      <p className="text-emerald-600 font-extrabold text-base mt-1">{formatMoney(product.price)}</p>
    </div>
  );
}
