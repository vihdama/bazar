import { useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';

interface BackupModalProps {
  onClose: () => void;
}

export default function BackupModal({ onClose }: BackupModalProps) {
  const {
    exportBackupData,
    importBackupData,
    restoreDefaultProducts,
    clearAllSalesHistory,
    isSupabaseConnected,
    refreshData,
  } = useStore();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function downloadJSON(fileName: string) {
    const dataToExport = exportBackupData();
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', fileName);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  function exportJSONBackup() {
    const dateFileName = new Date().toISOString().slice(0, 10);
    downloadJSON(`backup_vendas_${dateFileName}.json`);
    showToast('Backup JSON baixado com sucesso!');
  }

  async function saveToGoogleDrive() {
    const dataToExport = exportBackupData();
    const dateFileName = new Date().toISOString().slice(0, 10);
    const fileName = `backup_vendas_${dateFileName}.json`;
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const file = new File([jsonString], fileName, { type: 'application/json' });

    const nav = navigator as Navigator & { canShare?: (data?: { files?: File[] }) => boolean };
    if (nav.canShare && nav.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Backup Controle de Vendas',
          text: 'Arquivo de backup das vendas e produtos.',
        });
        showToast('Backup enviado!', 'fa-brands fa-google-drive text-amber-400');
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        console.warn('Share error:', err);
      }
    }

    downloadJSON(fileName);
    showToast('Backup gerado! Redirecionando para o Google Drive...', 'fa-brands fa-google-drive text-amber-400');
    setTimeout(() => {
      window.open('https://drive.google.com/drive/u/0/my-drive', '_blank');
    }, 1200);
  }

  function importJSONBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        await importBackupData(importedData);
        showToast('Backup restaurado com sucesso!');
        onClose();
      } catch {
        showToast('Erro ao ler arquivo de backup', 'fa-circle-xmark text-red-400');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function handleRestoreDefaults() {
    restoreDefaultProducts();
    onClose();
  }

  function handleClearSales() {
    clearAllSalesHistory();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-hard-drive text-emerald-600"></i>
            <h3 className="font-bold text-gray-800 text-base">Salvar e Restaurar</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="space-y-3">
          {/* SUPABASE STATUS CARD */}
          <div className={`p-3.5 rounded-2xl border ${isSupabaseConnected ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'} space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <i className="fa-solid fa-cloud text-emerald-600 text-sm"></i> Supabase Nuvem
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                {isSupabaseConnected ? 'Conectado' : 'Modo Offline (Local)'}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-snug">
              {isSupabaseConnected
                ? 'Seus dados de vendas, produtos e caixa estão sendo sincronizados automaticamente no Supabase.'
                : 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env para ativar a nuvem.'}
            </p>
            {isSupabaseConnected && (
              <button
                onClick={() => {
                  refreshData();
                  showToast('Dados recarregados da Nuvem!');
                }}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <i className="fa-solid fa-rotate"></i> Sincronizar Agora
              </button>
            )}
          </div>

          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <i className="fa-brands fa-google-drive text-amber-600 text-sm"></i> Google Drive
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Backup Manual
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-snug">
              Guarde o backup diretamente na sua conta do Google Drive pelo celular.
            </p>
            <button
              onClick={saveToGoogleDrive}
              className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition"
            >
              <i className="fa-brands fa-google-drive text-sm"></i> Salvar no Google Drive
            </button>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <i className="fa-solid fa-file-export text-blue-600"></i> Arquivo de Backup (JSON)
            </span>
            <p className="text-[11px] text-gray-500 leading-snug">
              Gere um arquivo de segurança no celular ou restaure de um arquivo anterior.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={exportJSONBackup}
                className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <i className="fa-solid fa-download"></i> Baixar Backup
              </button>
              <label className="py-2 px-3 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition">
                <i className="fa-solid fa-upload"></i> Restaurar
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={importJSONBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-1 flex justify-between items-center text-xs">
            <button
              onClick={handleRestoreDefaults}
              className="text-gray-500 hover:text-emerald-700 underline font-semibold"
            >
              Restaurar Tabela Padrão
            </button>
            <button
              onClick={handleClearSales}
              className="text-red-500 hover:text-red-700 underline font-semibold"
            >
              Zerar Vendas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
