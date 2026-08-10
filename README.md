# PDV Rápido — versão React

Conversão do PDV em HTML/JS puro para React + TypeScript + React Router + Tailwind CSS.

## Rodar o projeto

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (geralmente http://localhost:5173).

## Build de produção

```bash
npm run build
npm run preview
```

## Estrutura

```
src/
  types/           -> tipos TS (Product, Sale, CartItem...)
  utils/           -> formatMoney, catálogo padrão
  context/
    StoreContext   -> estado global (produtos, vendas, carrinho) + persistência em localStorage
    ToastContext   -> notificações (toast) globais
  components/
    Layout.tsx         -> casca da página (Header + <Outlet/> + BottomNav + Toast + modal de backup)
    Header.tsx
    BottomNav.tsx       -> navegação usando <NavLink> do react-router-dom
    FloatingCartBar.tsx
    ProductCard.tsx
    CartModal.tsx
    ReceiptModal.tsx
    ProductEditModal.tsx
    BackupModal.tsx
    SaleHistoryCard.tsx
    Toast.tsx
  pages/
    POSPage.tsx      -> rota "/"          (Caixa)
    HistoryPage.tsx  -> rota "/historico" (Vendas)
    ReportsPage.tsx  -> rota "/resumo"    (Resumo, gráfico com recharts)
    ProductsPage.tsx -> rota "/produtos"  (Catálogo)
  App.tsx  -> definição das rotas (react-router-dom)
  main.tsx -> ponto de entrada
```

## O que mudou em relação ao HTML original

- Toda a manipulação de DOM (`document.getElementById`, `innerHTML`, etc.) virou estado do React
  (`useState`/`useContext`), então a UI é renderizada declarativamente.
- As 4 "páginas" (Caixa, Vendas, Resumo, Produtos) agora são rotas reais do React Router
  (`/`, `/historico`, `/resumo`, `/produtos`), então dá pra navegar direto por URL e usar
  botão voltar/avançar do navegador.
- O gráfico de "Mais Vendidos" trocou Chart.js por `recharts` (mais natural em React).
- A sincronização com Firebase/Firestore foi removida porque dependia de config específica do
  projeto Firebase do usuário original. O backup continua funcionando via:
  - Exportar/Importar arquivo JSON
  - "Salvar no Google Drive" (usa a Web Share API do celular, com fallback pra download + abrir o Drive)
  - Persistência automática em `localStorage`
  Se quiser reativar sync na nuvem de verdade, dá pra plugar Firebase (ou outro backend) dentro de
  `StoreContext.tsx`, nos mesmos pontos onde hoje ele salva/lê do `localStorage`.
