import { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { formatMoney } from '../utils/format';

interface HeaderProps {
  onOpenBackup: () => void;
}

export default function Header({ onOpenBackup }: HeaderProps) {
  const { sales, isSupabaseConnected, isLoading } = useStore();

  const todayTotal = useMemo(() => {
    const today = new Date().toDateString();
    return sales
      .filter((s) => new Date(s.timestamp).toDateString() === today)
      .reduce((acc, s) => acc + s.total, 0);
  }, [sales]);

  return (
    <header className="sticky top-0 z-30 bg-emerald-700 text-white shadow-md">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-white text-lg font-bold">
            <i className="fa-solid fa-cash-register"></i>
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">PDV Rápido</h1>
            <div className="flex items-center gap-1.5 text-xs text-emerald-100 mt-0.5">
              {isLoading ? (
                <span className="inline-flex items-center gap-1 bg-amber-800/80 px-2 py-0.5 rounded-full text-[10px] font-semibold text-amber-200">
                  <i className="fa-solid fa-spinner animate-spin text-[10px]"></i> Conectando...
                </span>
              ) : isSupabaseConnected ? (
                <span className="inline-flex items-center gap-1 bg-emerald-900/80 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-200" title="Conectado ao Supabase (Nuvem)">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Supabase Nuvem
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-300" title="Usando armazenamento local. Configure o .env para conectar ao Supabase">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Local (Offline)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBackup}
            title="Salvar e Backup de Dados"
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
          >
            <i className="fa-solid fa-database text-sm"></i>
            <span className="hidden sm:inline">Dados</span>
          </button>
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-emerald-200 block">Hoje</span>
            <span className="font-extrabold text-sm text-emerald-50">{formatMoney(todayTotal)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
