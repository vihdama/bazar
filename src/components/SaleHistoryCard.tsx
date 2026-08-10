import type { Sale } from '../types';
import { formatMoney } from '../utils/format';

interface SaleHistoryCardProps {
  sale: Sale;
  onView: () => void;
  onDelete: () => void;
}

export default function SaleHistoryCard({ sale, onView, onDelete }: SaleHistoryCardProps) {
  const dateObj = new Date(sale.timestamp);
  const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = dateObj.toLocaleDateString('pt-BR');
  const itemNames = sale.items.map((i) => `${i.qty}x ${i.name}`).join(', ');

  return (
    <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
      <div className="space-y-1 flex-1 pr-3">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-gray-800">#{sale.id}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
            {sale.paymentMethod}
          </span>
          {sale.customer && (
            <span className="text-[10px] text-gray-500 font-medium">({sale.customer})</span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate max-w-[200px]">{itemNames}</p>
        <p className="text-[10px] text-gray-400">
          {dateStr} às {timeStr}
        </p>
      </div>

      <div className="text-right flex flex-col items-end gap-1">
        <span className="font-black text-sm text-emerald-700">{formatMoney(sale.total)}</span>
        <div className="flex gap-1">
          <button
            onClick={onView}
            className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center text-xs active:bg-gray-200"
          >
            <i className="fa-solid fa-eye"></i>
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-xs active:bg-red-100"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
