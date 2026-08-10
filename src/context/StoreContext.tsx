import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, CashSession, PaymentMethod, Product, Sale } from '../types';
import { DEFAULT_PRODUCTS } from '../utils/defaultProducts';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';
import { useToast } from './ToastContext';

const PRODUCTS_KEY = 'vendas_express_products';
const SALES_KEY = 'vendas_express_sales';

function loadFromStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface StoreContextValue {
  products: Product[];
  sales: Sale[];
  cart: CartItem[];
  selectedPayment: PaymentMethod;
  setSelectedPayment: (m: PaymentMethod) => void;
  isSupabaseConnected: boolean;
  isLoading: boolean;
  activeCashSession: CashSession | null;

  addToCart: (productId: string) => void;
  updateCartQty: (productId: string, change: number) => void;
  clearCart: () => void;
  getCartTotal: (discount: number) => number;
  getCartTotalItems: () => number;

  finishSale: (opts: { customer: string | null; discount: number }) => Promise<Sale | null>;
  deleteSale: (saleId: number) => Promise<void>;

  saveProduct: (product: { id?: string; name: string; price: number }) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  restoreDefaultProducts: () => Promise<void>;

  clearAllSalesHistory: () => Promise<void>;
  openCashSession: (initialAmount: number, notes?: string) => Promise<void>;
  closeCashSession: (finalAmount: number) => Promise<void>;

  exportBackupData: () => { version: string; exportedAt: string; products: Product[]; sales: Sale[] };
  importBackupData: (data: { products?: Product[]; sales?: Sale[] }) => Promise<void>;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage(PRODUCTS_KEY, DEFAULT_PRODUCTS)
  );
  const [sales, setSales] = useState<Sale[]>(() => loadFromStorage(SALES_KEY, [] as Sale[]));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('PIX');
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [activeCashSession, setActiveCashSession] = useState<CashSession | null>(null);

  // Sincronização inicial com o Supabase
  const refreshData = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      setIsSupabaseConnected(false);
      return;
    }

    setIsLoading(true);
    try {
      const [fetchedProducts, fetchedSales, fetchedSession] = await Promise.all([
        supabaseService.getProducts(),
        supabaseService.getSales(),
        supabaseService.getActiveCashSession(),
      ]);

      // Se a tabela de produtos do Supabase estiver vazia, insere os produtos padrão
      if (fetchedProducts.length === 0) {
        await supabaseService.bulkSaveProducts(DEFAULT_PRODUCTS);
        const reFetched = await supabaseService.getProducts();
        setProducts(reFetched);
      } else {
        setProducts(fetchedProducts);
      }

      setSales(fetchedSales);
      setActiveCashSession(fetchedSession);
      setIsSupabaseConnected(true);
    } catch (err) {
      console.error('Falha ao conectar no Supabase, usando armazenamento local fallback:', err);
      setIsSupabaseConnected(false);
      showToast('Modo Offline: usando dados locais', 'fa-triangle-exclamation text-amber-400');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Inscrição Realtime no Supabase para sincronização instantânea entre múltiplos dispositivos
  useEffect(() => {
    if (!isSupabaseConfigured || !isSupabaseConnected) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          try {
            const fetched = await supabaseService.getProducts();
            setProducts(fetched);
          } catch (err) {
            console.error('Erro ao atualizar produtos via realtime:', err);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        async () => {
          try {
            const fetched = await supabaseService.getSales();
            setSales(fetched);
          } catch (err) {
            console.error('Erro ao atualizar vendas via realtime:', err);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cash_sessions' },
        async () => {
          try {
            const fetched = await supabaseService.getActiveCashSession();
            setActiveCashSession(fetched);
          } catch (err) {
            console.error('Erro ao atualizar caixa via realtime:', err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSupabaseConnected]);

  // Persistência local como backup
  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  }, [sales]);

  function addToCart(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prev) => {
      const idx = prev.findIndex((i) => i.productId === productId);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1 }];
    });
    showToast(`${product.name} adicionado!`);
  }

  function updateCartQty(productId: string, change: number) {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.productId === productId);
      if (idx === -1) return prev;
      const next = [...prev];
      const newQty = next[idx].qty + change;
      if (newQty <= 0) {
        next.splice(idx, 1);
      } else {
        next[idx] = { ...next[idx], qty: newQty };
      }
      return next;
    });
  }

  function clearCart() {
    setCart([]);
  }

  function getCartTotal(discount: number) {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    return Math.max(0, subtotal - (discount || 0));
  }

  function getCartTotalItems() {
    return cart.reduce((acc, item) => acc + item.qty, 0);
  }

  async function finishSale({ customer, discount }: { customer: string | null; discount: number }) {
    if (cart.length === 0) return null;

    const total = getCartTotal(discount);

    if (isSupabaseConnected) {
      try {
        const createdSale = await supabaseService.createSale({
          items: cart,
          discount,
          total,
          paymentMethod: selectedPayment,
          customer: customer || null,
        });

        setSales((prev) => [createdSale, ...prev]);
        setCart([]);
        showToast('Venda gravada no Supabase!');
        return createdSale;
      } catch (err) {
        console.error('Erro ao salvar venda no Supabase:', err);
        showToast('Erro ao salvar venda no Supabase', 'fa-triangle-exclamation text-red-500');
      }
    }

    // Fallback LocalStorage
    const saleId = Math.floor(1000 + Math.random() * 9000);
    const newSale: Sale = {
      id: saleId,
      timestamp: new Date().toISOString(),
      items: [...cart],
      discount,
      total,
      paymentMethod: selectedPayment,
      customer: customer || null,
    };

    setSales((prev) => [newSale, ...prev]);
    setCart([]);
    showToast('Venda gravada localmente!');
    return newSale;
  }

  async function deleteSale(saleId: number) {
    if (isSupabaseConnected) {
      try {
        await supabaseService.deleteSale(saleId);
      } catch (err) {
        console.error('Erro ao deletar venda no Supabase:', err);
      }
    }
    setSales((prev) => prev.filter((s) => s.id !== saleId));
    showToast('Venda cancelada', 'fa-trash text-red-400');
  }

  async function saveProduct(product: { id?: string; name: string; price: number }) {
    if (isSupabaseConnected) {
      try {
        const saved = await supabaseService.saveProduct(product);
        if (product.id) {
          setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
        } else {
          setProducts((prev) => [...prev, saved]);
        }
        showToast('Produto salvo no Supabase!');
        return;
      } catch (err) {
        console.error('Erro ao salvar produto no Supabase:', err);
      }
    }

    // Local fallback
    if (product.id) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, name: product.name, price: product.price } : p))
      );
    } else {
      const newId = String(Date.now());
      setProducts((prev) => [...prev, { id: newId, name: product.name, price: product.price }]);
    }
    showToast('Produto salvo com sucesso!');
  }

  async function removeProduct(productId: string) {
    if (isSupabaseConnected) {
      try {
        await supabaseService.removeProduct(productId);
      } catch (err) {
        console.error('Erro ao remover produto do Supabase:', err);
      }
    }
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('Produto removido', 'fa-trash text-red-400');
  }

  async function restoreDefaultProducts() {
    if (isSupabaseConnected) {
      try {
        await supabaseService.bulkSaveProducts(DEFAULT_PRODUCTS);
        const refreshed = await supabaseService.getProducts();
        setProducts(refreshed);
        showToast('Produtos sincronizados com o Supabase!');
        return;
      } catch (err) {
        console.error('Erro ao restaurar no Supabase:', err);
      }
    }
    setProducts([...DEFAULT_PRODUCTS]);
    showToast('Produtos redefinidos para o padrão!');
  }

  async function clearAllSalesHistory() {
    if (sales.length === 0) {
      showToast('Nenhuma venda gravada.');
      return;
    }
    if (isSupabaseConnected) {
      try {
        await supabaseService.clearAllSales();
      } catch (err) {
        console.error('Erro ao limpar histórico no Supabase:', err);
      }
    }
    setSales([]);
    showToast('Histórico de vendas zerado!', 'fa-trash text-red-400');
  }

  async function openCashSession(initialAmount: number, notes?: string) {
    if (isSupabaseConnected) {
      try {
        const session = await supabaseService.openCashSession(initialAmount, notes);
        setActiveCashSession(session);
        showToast('Caixa aberto no Supabase!');
        return;
      } catch (err) {
        console.error('Erro ao abrir caixa no Supabase:', err);
      }
    }
    const localSession: CashSession = {
      id: String(Date.now()),
      openedAt: new Date().toISOString(),
      closedAt: null,
      initialAmount,
      finalAmount: null,
      status: 'open',
      notes,
    };
    setActiveCashSession(localSession);
    showToast('Caixa aberto com sucesso!');
  }

  async function closeCashSession(finalAmount: number) {
    if (!activeCashSession) return;
    if (isSupabaseConnected) {
      try {
        await supabaseService.closeCashSession(activeCashSession.id, finalAmount);
        setActiveCashSession(null);
        showToast('Caixa fechado no Supabase!');
        return;
      } catch (err) {
        console.error('Erro ao fechar caixa no Supabase:', err);
      }
    }
    setActiveCashSession(null);
    showToast('Caixa fechado!');
  }

  function exportBackupData() {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products,
      sales,
    };
  }

  async function importBackupData(data: { products?: Product[]; sales?: Sale[] }) {
    if (data.products && Array.isArray(data.products)) {
      setProducts(data.products);
      if (isSupabaseConnected) {
        await supabaseService.bulkSaveProducts(data.products);
      }
    }
    if (data.sales && Array.isArray(data.sales)) {
      setSales(data.sales);
    }
    showToast('Dados importados com sucesso!');
  }

  return (
    <StoreContext.Provider
      value={{
        products,
        sales,
        cart,
        selectedPayment,
        setSelectedPayment,
        isSupabaseConnected,
        isLoading,
        activeCashSession,
        addToCart,
        updateCartQty,
        clearCart,
        getCartTotal,
        getCartTotalItems,
        finishSale,
        deleteSale,
        saveProduct,
        removeProduct,
        restoreDefaultProducts,
        clearAllSalesHistory,
        openCashSession,
        closeCashSession,
        exportBackupData,
        importBackupData,
        refreshData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
