import type { Sale } from '../types';
import { formatMoney } from '../utils/format';

interface ReceiptModalProps {
  sale: Sale;
  onClose: () => void;
}

export default function ReceiptModal({ sale, onClose }: ReceiptModalProps) {
  const dateObj = new Date(sale.timestamp);

  function shareWhatsApp() {
    const dateStr = dateObj.toLocaleString('pt-BR');
    let text = `*COMPROVANTE DE COMPRA*\n`;
    text += `Venda #${sale.id} - ${dateStr}\n`;
    if (sale.customer) text += `Cliente: ${sale.customer}\n`;
    text += `------------------------------\n`;
    sale.items.forEach((item) => {
      text += `${item.qty}x ${item.name} - ${formatMoney(item.price * item.qty)}\n`;
    });
    if (sale.discount > 0) text += `Desconto: -${formatMoney(sale.discount)}\n`;
    text += `------------------------------\n`;
    text += `*TOTAL: ${formatMoney(sale.total)}*\n`;
    text += `Pagamento: ${sale.paymentMethod}\n\n`;
    text += `Obrigado pela preferência!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl mb-2">
            <i className="fa-solid fa-check"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-800">Venda Realizada!</h3>
          <p className="text-xs text-gray-400">{dateObj.toLocaleString('pt-BR')}</p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 border border-dashed border-gray-300 space-y-3 text-xs">
          <div className="flex justify-between font-bold border-b border-gray-200 pb-2">
            <span>COMPROVANTE DE VENDEDOR</span>
            <span className="text-gray-400">#{sale.id}</span>
          </div>

          <div className="space-y-1.5 text-gray-600">
            {sale.items.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <span>
                  {item.qty}x {item.name}
                </span>
                <span className="font-semibold">{formatMoney(item.price * item.qty)}</span>
              </div>
            ))}
            {sale.discount > 0 && (
              <div className="flex justify-between text-red-500 font-medium">
                <span>Desconto</span>
                <span>-{formatMoney(sale.discount)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-2 space-y-1">
            <div className="flex justify-between text-gray-500">
              <span>Forma de Pagamento:</span>
              <span className="font-bold text-gray-800">{sale.paymentMethod}</span>
            </div>
            {sale.customer && (
              <div className="flex justify-between text-gray-500">
                <span>Cliente:</span>
                <span className="font-bold text-gray-800">{sale.customer}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-emerald-700 pt-1">
              <span>TOTAL PAGO:</span>
              <span>{formatMoney(sale.total)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={shareWhatsApp}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-md active:scale-95 transition"
          >
            <i className="fa-brands fa-whatsapp text-lg"></i> Enviar Comprovante
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm active:scale-95 transition"
          >
            Nova Venda
          </button>
        </div>
      </div>
    </div>
  );
}
