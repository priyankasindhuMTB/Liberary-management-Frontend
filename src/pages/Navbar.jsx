import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  {
    path: '/', label: 'Register', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    )
  },
  {
    path: '/users', label: 'Members', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  {
    path: '/create-seat', label: 'Seats', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  },
  {
    path: '/create-shifts', label: 'Shifts', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span className="text-white font-extrabold text-lg tracking-tight">
            Library<span className="text-indigo-400">MS</span>
          </span>
        </NavLink>

        {/* Desktop Links */}
        <ul className="hidden sm:flex items-center gap-1 list-none m-0 p-0">
          {navItems.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all no-underline
                  ${isActive
                    ? 'bg-indigo-500/20 text-white border border-indigo-500/30'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Hamburger */}
        <button
          className="sm:hidden flex flex-col gap-1.5 p-1 bg-transparent border-none cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="block w-5 h-0.5 bg-white/70 rounded" />
          <span className="block w-5 h-0.5 bg-white/70 rounded" />
          <span className="block w-5 h-0.5 bg-white/70 rounded" />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden bg-slate-900 border-t border-white/5 px-6 pb-4 pt-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-1 transition-all no-underline
                ${isActive
                  ? 'bg-indigo-500/20 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'}`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;