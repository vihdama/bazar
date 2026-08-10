export interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  stock?: number;
  created_at?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export type PaymentMethod = 'PIX' | 'Dinheiro' | 'Cartão' | 'Fiado';

export interface Sale {
  id: number;
  timestamp: string;
  items: CartItem[];
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  customer: string | null;
}

export type HistoryFilter = 'today' | '7days' | '30days' | 'all';

export interface CashSession {
  id: string;
  openedAt: string;
  closedAt: string | null;
  initialAmount: number;
  finalAmount: number | null;
  status: 'open' | 'closed';
  notes?: string | null;
}

export interface CashMovement {
  id: string;
  sessionId: string;
  type: 'suprimento' | 'sangria';
  amount: number;
  description: string;
  timestamp: string;
}
