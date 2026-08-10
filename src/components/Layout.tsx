import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import BackupModal from './BackupModal';
import Toast from './Toast';

export default function Layout() {
  const [backupOpen, setBackupOpen] = useState(false);

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white">
      <Header onOpenBackup={() => setBackupOpen(true)} />

      <main className="max-w-md mx-auto w-full flex-1 px-4 pt-3">
        <Outlet context={{ onOpenBackup: () => setBackupOpen(true) }} />
      </main>

      <BottomNav />
      <Toast />

      {backupOpen && <BackupModal onClose={() => setBackupOpen(false)} />}
    </div>
  );
}
