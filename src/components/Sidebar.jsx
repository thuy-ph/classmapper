import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Class Roster', icon: '🏫' },
  { to: '/map', label: 'Weekly Map', icon: '🗺️' },
  { to: '/rules', label: 'Seating Rules', icon: '📐' },
  { to: '/history', label: 'History', icon: '📋' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  return (
    <nav className="flex md:flex-col gap-1 md:gap-2 bg-white/70 backdrop-blur md:w-60 w-full md:h-screen md:sticky md:top-0 p-3 md:p-4 border-b md:border-b-0 md:border-r border-brand-100 shrink-0 overflow-x-auto md:overflow-visible">
      <div className="hidden md:flex items-center gap-2 px-2 pb-4">
        <span className="text-3xl">🧸</span>
        <div>
          <h1 className="text-xl font-extrabold text-brand-700 leading-tight">ClassMapper</h1>
          <p className="text-xs text-brand-400">Seating made simple</p>
        </div>
      </div>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-brand-400 text-white shadow-md shadow-brand-200'
                : 'text-brand-700 hover:bg-brand-100'
            }`
          }
        >
          <span className="text-lg">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
