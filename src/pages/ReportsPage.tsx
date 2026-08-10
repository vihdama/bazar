import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { useStore } from '../context/StoreContext';
import { formatMoney } from '../utils/format';
import type { PaymentMethod } from '../types';

const PAYMENT_METHODS: PaymentMethod[] = ['PIX', 'Dinheiro', 'Cartão', 'Fiado'];

const METRIC_ICON_STYLES = [
  { icon: 'fa-sack-dollar', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { icon: 'fa-shopping-bag', bg: 'bg-blue-100', text: 'text-blue-700' },
  { icon: 'fa-receipt', bg: 'bg-purple-100', text: 'text-purple-700' },
  { icon: 'fa-trophy', bg: 'bg-amber-100', text: 'text-amber-700' },
];

export default function ReportsPage() {
  const { sales } = useStore();

  const totalRevenue = useMemo(() => sales.reduce((acc, s) => acc + s.total, 0), [sales]);
  const totalCount = sales.length;
  const avgTicket = totalCount > 0 ? totalRevenue / totalCount : 0;

  const productQtyMap = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((s) => {
      s.items.forEach((i) => {
        map[i.name] = (map[i.name] || 0) + i.qty;
      });
    });
    return map;
  }, [sales]);

  const topEntry = useMemo(() => {
    let topName = '-';
    let topQty = 0;
    Object.entries(productQtyMap).forEach(([name, qty]) => {
      if (qty > topQty) {
        topQty = qty;
        topName = name;
      }
    });
    return topName !== '-' ? `${topName} (${topQty})` : '-';
  }, [productQtyMap]);

  const chartData = useMemo(
    () =>
      Object.entries(productQtyMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, qty]) => ({ name, qty })),
    [productQtyMap]
  );

  const paymentMap = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((s) => {
      map[s.paymentMethod] = (map[s.paymentMethod] || 0) + s.total;
    });
    return map;
  }, [sales]);

  const metrics = [
    { label: 'Total Faturado', value: formatMoney(totalRevenue) },
    { label: 'Qtd. Vendas', value: String(totalCount) },
    { label: 'Ticket Médio', value: formatMoney(avgTicket) },
    { label: 'Mais Vendido', value: topEntry },
  ];

  return (
    <section className="space-y-4 pb-24">
      <h2 className="text-lg font-bold text-gray-800">Desempenho de Vendas</h2>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m, idx) => {
          const style = METRIC_ICON_STYLES[idx];
          return (
            <div key={m.label} className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
              <div
                className={`w-8 h-8 rounded-xl ${style.bg} ${style.text} flex items-center justify-center mb-2`}
              >
                <i className={`fa-solid ${style.icon} text-sm`}></i>
              </div>
              <span className="text-xs text-gray-500 font-medium block">{m.label}</span>
              <span
                className={
                  idx === 3
                    ? 'text-sm font-bold text-gray-900 truncate block'
                    : 'text-lg font-extrabold text-gray-900'
                }
              >
                {m.value}
              </span>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Mais Vendidos por Quantidade
        </h3>
        <div className="h-56">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              Sem dados suficientes ainda.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#ecfdf5' }} />
                <Bar dataKey="qty" fill="#10b981" radius={[8, 8, 0, 0]} name="Unidades Vendidas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Por Forma de Pagamento
        </h3>
        <div className="space-y-2 pt-1">
          {PAYMENT_METHODS.map((m) => {
            const amount = paymentMap[m] || 0;
            const percentage = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
            return (
              <div key={m} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700">{m}</span>
                  <span className="text-gray-900">
                    {formatMoney(amount)} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
