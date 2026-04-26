import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Users, Armchair, Clock, ShieldCheck,
  LogOut, Library, ChevronRight, Menu, X, MoreHorizontal,LayoutGrid 
} from "lucide-react";

const navItems = [
  { path: "/users",         label: "Members",  icon: Users    },
  { path: "/create-seat",   label: "Seats",    icon: Armchair },
   { path: "/rooms",         label: "Rooms",   icon: LayoutGrid }, // ← ADD
  { path: "/create-shifts", label: "Shifts",   icon: Clock    },
  { path: "/all-admins",    label: "All-Admin", icon: Users   },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("admin"));
      setAdmin(data);
    } catch { setAdmin(null); }
  }, [location]);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/login");
  };

  const hideSidebar = ["/login", "/", "/super-admin/login",
    "/setup-super", "/request"].includes(location.pathname);
  if (hideSidebar) return null;

  const isSuperAdmin = admin?.role === "super_admin";

  // Bottom nav items — super_admin ko extra tabs dikhenge
  const bottomNavItems = [
    { path: "/users",         label: "Members", icon: Users    },
    { path: "/create-seat",   label: "Seats",   icon: Armchair },
    { path: "/create-shifts", label: "Shifts",  icon: Clock    },
    { path: "/all-admins",    label: "Admins",  icon: Users    },
    ...(isSuperAdmin ? [
      { path: "/super-admin", label: "Pending", icon: ShieldCheck },
    ] : []),
  ];

  // Shared nav links used in both desktop sidebar & mobile drawer
  const NavLinks = ({ onClose }) => (
    <>
      {/* ── Main Menu ── */}
      <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2 mt-1">
        Main Menu
      </p>

      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group mb-0.5
            ${isActive
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
          }
        >
          <span className="flex items-center gap-2.5">
            <item.icon size={17} />
            <span className="font-semibold text-[13px]">{item.label}</span>
          </span>
          <ChevronRight size={13} className="opacity-0 group-hover:opacity-60 transition-opacity" />
        </NavLink>
      ))}

      {/* ── Administration (super_admin only) ── */}
      {isSuperAdmin && (
        <>
          <hr className="border-slate-800 my-3" />
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">
            Administration
          </p>

          <NavLink
            to="/super-admin"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group mb-0.5
              ${isActive
                ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                : "text-red-400 hover:bg-red-500/10 hover:text-red-300"}`
            }
          >
            <span className="flex items-center gap-2.5">
              <ShieldCheck size={17} />
              <span className="font-semibold text-[13px]">Pending Requests</span>
            </span>
            <ChevronRight size={13} className="opacity-0 group-hover:opacity-60 transition-opacity" />
          </NavLink>

          <NavLink
            to="/all-admins"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group mb-0.5
              ${isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
            }
          >
            <span className="flex items-center gap-2.5">
              <Users size={17} />
              <span className="font-semibold text-[13px]">Approved Admins</span>
            </span>
            <ChevronRight size={13} className="opacity-0 group-hover:opacity-60 transition-opacity" />
          </NavLink>
        </>
      )}
    </>
  );

  // Shared profile + logout used in both sidebar & drawer
  const ProfileSection = () => (
    <div className="p-3 border-t border-slate-800">
      <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600
          flex items-center justify-center text-xs font-bold text-indigo-400 uppercase flex-shrink-0">
          {admin?.name?.charAt(0) || "A"}
        </div>
        <div className="overflow-hidden">
          <p className="text-white text-xs font-bold truncate">{admin?.name || "Admin"}</p>
          <p className="text-slate-500 text-[10px] capitalize truncate">
            {admin?.role?.replace("_", " ")}
          </p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-slate-400
          hover:text-white hover:bg-red-500/10 rounded-xl transition-all text-[13px] font-semibold"
      >
        <LogOut size={16} className="text-red-500" />
        Sign Out
      </button>
    </div>
  );

  return (
    <>
      {/* ═══════════════════════════════════════
          DESKTOP SIDEBAR (md and above)
      ═══════════════════════════════════════ */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[220px] lg:w-[240px]
        bg-slate-900 border-r border-slate-800 flex-col z-50">

        {/* Brand */}
        <div className="p-4 lg:p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center
            shadow-lg shadow-indigo-500/20 flex-shrink-0">
            <Library className="text-white" size={18} />
          </div>
          <span className="text-white font-black text-lg tracking-tight">
            Lib<span className="text-indigo-400">Sync</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          <NavLinks />
        </nav>

        <ProfileSection />
      </aside>

      {/* ═══════════════════════════════════════
          MOBILE — HAMBURGER BUTTON
      ═══════════════════════════════════════ */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 bg-slate-900
          border border-slate-700 rounded-xl flex items-center justify-center
          shadow-lg transition-all active:scale-95"
        aria-label="Open menu"
      >
        <Menu size={18} className="text-slate-300" />
      </button>

      {/* ═══════════════════════════════════════
          MOBILE — OVERLAY
      ═══════════════════════════════════════ */}
      <div
        onClick={() => setIsOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40
          transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* ═══════════════════════════════════════
          MOBILE — SLIDE-IN DRAWER
      ═══════════════════════════════════════ */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-screen w-[265px] bg-slate-900
          border-r border-slate-800 flex flex-col z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Library className="text-white" size={18} />
            </div>
            <span className="text-white font-black text-lg">
              Lib<span className="text-indigo-400">Sync</span>
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-slate-400
              hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer nav — includes Administration section */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          <NavLinks onClose={() => setIsOpen(false)} />
        </nav>

        <ProfileSection />
      </aside>

      {/* ═══════════════════════════════════════
          MOBILE — BOTTOM NAV BAR
      ═══════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900
        border-t border-slate-800 z-40 flex items-center justify-around px-1">

        {bottomNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-0
              ${isActive ? "text-indigo-400" : "text-slate-600 hover:text-slate-400"}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={19}
                  style={isActive
                    ? { filter: "drop-shadow(0 0 5px rgba(129,140,248,0.8))" }
                    : {}}
                />
                <span className="text-[9px] font-bold tracking-wide truncate">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* "More" button opens drawer for profile/logout */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl
            text-slate-600 hover:text-slate-400 transition-all"
        >
          <MoreHorizontal size={19} />
          <span className="text-[9px] font-bold tracking-wide">More</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;