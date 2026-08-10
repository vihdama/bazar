import { supabase } from '../lib/supabase';
import type { CartItem, CashSession, Product, Sale } from '../types';

export const supabaseService = {
  // PRODUTOS
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error) {
      console.error('Erro ao buscar produtos no Supabase:', error);
      throw error;
    }
    return (data || []).map((p) => ({
      id: String(p.id),
      name: p.name,
      price: Number(p.price),
      category: p.category,
      stock: p.stock,
      created_at: p.created_at,
    }));
  },

  async saveProduct(product: { id?: string; name: string; price: number }): Promise<Product> {
    if (product.id) {
      const { data, error } = await supabase
        .from('products')
        .update({ name: product.name, price: product.price })
        .eq('id', product.id)
        .select()
        .single();
      if (error) throw error;
      return { id: String(data.id), name: data.name, price: Number(data.price) };
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([{ name: product.name, price: product.price }])
        .select()
        .single();
      if (error) throw error;
      return { id: String(data.id), name: data.name, price: Number(data.price) };
    }
  },

  async removeProduct(productId: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;
  },

  async bulkSaveProducts(products: Product[]): Promise<void> {
    const records = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
    }));
    const { error } = await supabase.from('products').upsert(records);
    if (error) throw error;
  },

  // VENDAS
  async getSales(): Promise<Sale[]> {
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .order('timestamp', { ascending: false });

    if (salesError) {
      console.error('Erro ao buscar vendas no Supabase:', salesError);
      throw salesError;
    }

    return (salesData || []).map((s) => ({
      id: Number(s.id),
      timestamp: s.timestamp,
      discount: Number(s.discount),
      total: Number(s.total),
      paymentMethod: s.payment_method,
      customer: s.customer,
      items: (s.sale_items || []).map((item: { product_id: string; name: string; price: number; qty: number }) => ({
        productId: item.product_id,
        name: item.name,
        price: Number(item.price),
        qty: Number(item.qty),
      })),
    }));
  },

  async createSale(sale: {
    items: CartItem[];
    discount: number;
    total: number;
    paymentMethod: string;
    customer: string | null;
  }): Promise<Sale> {
    // 1. Criar registro da venda
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([
        {
          total: sale.total,
          discount: sale.discount,
          payment_method: sale.paymentMethod,
          customer: sale.customer,
          timestamp: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (saleError || !saleData) throw saleError || new Error('Falha ao inserir venda');

    const saleId = saleData.id;

    // 2. Criar itens da venda
    const itemsToInsert = sale.items.map((item) => ({
      sale_id: saleId,
      product_id: item.productId,
      name: item.name,
      price: item.price,
      qty: item.qty,
    }));

    const { error: itemsError } = await supabase.from('sale_items').insert(itemsToInsert);
    if (itemsError) throw itemsError;

    return {
      id: Number(saleId),
      timestamp: saleData.timestamp,
      items: [...sale.items],
      discount: sale.discount,
      total: sale.total,
      paymentMethod: sale.paymentMethod as any,
      customer: sale.customer,
    };
  },

  async deleteSale(saleId: number): Promise<void> {
    const { error } = await supabase.from('sales').delete().eq('id', saleId);
    if (error) throw error;
  },

  async clearAllSales(): Promise<void> {
    const { error } = await supabase.from('sales').delete().neq('id', 0);
    if (error) throw error;
  },

  // CAIXA (Sessões de Caixa)
  async getActiveCashSession(): Promise<CashSession | null> {
    const { data, error } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('status', 'open')
      .order('opened_at', { ascending: false })
      .maybeSingle();

    if (error) {
      console.error('Erro ao consultar caixa aberto no Supabase:', error);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      openedAt: data.opened_at,
      closedAt: data.closed_at,
      initialAmount: Number(data.initial_amount),
      finalAmount: data.final_amount ? Number(data.final_amount) : null,
      status: data.status,
      notes: data.notes,
    };
  },

  async openCashSession(initialAmount: number, notes?: string): Promise<CashSession> {
    const { data, error } = await supabase
      .from('cash_sessions')
      .insert([
        {
          initial_amount: initialAmount,
          status: 'open',
          opened_at: new Date().toISOString(),
          notes: notes || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      openedAt: data.opened_at,
      closedAt: null,
      initialAmount: Number(data.initial_amount),
      finalAmount: null,
      status: 'open',
      notes: data.notes,
    };
  },

  async closeCashSession(sessionId: string, finalAmount: number): Promise<CashSession> {
    const { data, error } = await supabase
      .from('cash_sessions')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        final_amount: finalAmount,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      openedAt: data.opened_at,
      closedAt: data.closed_at,
      initialAmount: Number(data.initial_amount),
      finalAmount: Number(data.final_amount),
      status: 'closed',
      notes: data.notes,
    };
  },
};
