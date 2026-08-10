import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Caixa', icon: 'fa-border-all', end: true },
  { to: '/historico', label: 'Vendas', icon: 'fa-clock-rotate-left', end: false },
  { to: '/resumo', label: 'Resumo', icon: 'fa-chart-pie', end: false },
  { to: '/produtos', label: 'Produtos', icon: 'fa-tags', end: false },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center transition ${
                isActive ? 'text-emerald-600 font-bold' : 'text-gray-400 font-medium'
              }`
            }
          >
            <i className={`fa-solid ${tab.icon} text-lg`}></i>
            <span className="text-[11px] mt-0.5">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
