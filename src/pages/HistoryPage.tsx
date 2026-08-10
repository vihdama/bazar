import { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import SaleHistoryCard from '../components/SaleHistoryCard';
import ReceiptModal from '../components/ReceiptModal';
import type { HistoryFilter, Sale } from '../types';

const FILTERS: { key: HistoryFilter; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: '7days', label: '7 dias' },
  { key: '30days', label: '30 dias' },
  { key: 'all', label: 'Todas' },
];

export default function HistoryPage() {
  const { sales, deleteSale } = useStore();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<HistoryFilter>('today');
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter((s) => {
      const sDate = new Date(s.timestamp);
      if (filter === 'today') return sDate.toDateString() === now.toDateString();
      if (filter === '7days') return (now.getTime() - sDate.getTime()) / 86400000 <= 7;
      if (filter === '30days') return (now.getTime() - sDate.getTime()) / 86400000 <= 30;
      return true;
    });
  }, [sales, filter]);

  function exportSalesCSV() {
    if (sales.length === 0) {
      showToast('Nenhuma venda para exportar', 'fa-triangle-exclamation text-amber-400');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,ID;Data;Hora;Cliente;Itens;Forma Pagamento;Desconto;Total\n';
    sales.forEach((s) => {
      const dateObj = new Date(s.timestamp);
      const dateStr = dateObj.toLocaleDateString('pt-BR');
      const timeStr = dateObj.toLocaleTimeString('pt-BR');
      const itemsStr = s.items.map((i) => `${i.qty}x ${i.name}`).join(' | ');
      csvContent += `${s.id};${dateStr};${timeStr};"${s.customer || ''}";"${itemsStr}";${s.paymentMethod};${s.discount};${s.total}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_vendas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <section className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Histórico de Vendas</h2>
        <button
          onClick={exportSalesCSV}
          className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 active:scale-95 transition"
        >
          <i className="fa-solid fa-file-excel text-emerald-600"></i> Exportar CSV
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${
              filter === f.key ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filteredSales.length === 0 ? (
          <div className="text-center py-8 text-gray-400 space-y-2">
            <i className="fa-solid fa-receipt text-3xl"></i>
            <p className="text-xs">Nenhuma venda encontrada para este período.</p>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <SaleHistoryCard
              key={sale.id}
              sale={sale}
              onView={() => setViewingSale(sale)}
              onDelete={() => deleteSale(sale.id)}
            />
          ))
        )}
      </div>

      {viewingSale && <ReceiptModal sale={viewingSale} onClose={() => setViewingSale(null)} />}
    </section>
  );
}
