import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { StoreProvider } from './context/StoreContext';
import Layout from './components/Layout';
import POSPage from './pages/POSPage';
import HistoryPage from './pages/HistoryPage';
import ReportsPage from './pages/ReportsPage';
import ProductsPage from './pages/ProductsPage';

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<POSPage />} />
              <Route path="historico" element={<HistoryPage />} />
              <Route path="resumo" element={<ReportsPage />} />
              <Route path="produtos" element={<ProductsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </ToastProvider>
  );
}
