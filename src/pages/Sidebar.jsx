import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Users, Armchair, Clock, ShieldCheck,
  LogOut, Library, ChevronRight, Menu, X, LayoutGrid, UserCheck
} from "lucide-react";
import { syncNotificationPermission, listenForLiveMessages } from "../firebaseConfig";

const adminNavItems = [
  { path: "/users",         label: "Members",  icon: Users      },
  { path: "/create-seat",   label: "Seats",    icon: Armchair   },
  { path: "/rooms",         label: "Rooms",    icon: LayoutGrid },
  { path: "/create-shifts", label: "Shifts",   icon: Clock      },
];

const superAdminNavItems = [
  { path: "/super-admin",   label: "Pending Requests", icon: ShieldCheck },
  { path: "/all-admins",    label: "Approved Admins",  icon: UserCheck   },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const authPaths = ["/", "/login", "/setup-super", "/request"];

useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("admin");
      const storedToken = localStorage.getItem("token");

      // 1. If viewing a public route, let it pass smoothly
      if (authPaths.includes(location.pathname)) return;

      // 2. Clear stale states and force login if credentials are missing
      if (!storedAdmin || !storedToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
        setAdmin(null);
        navigate("/login");
        return;
      }

      // 3. Parse user session data safely
      const data = JSON.parse(storedAdmin);
      setAdmin(data);

      // ── 🔀 DYNAMIC ROLE GUARD ──
      if (data?.role === "super_admin") {
        const superAdminStructuralPaths = ["/super-admin", "/all-admins"];
        
        // Only redirect if they are trying to access a regular library admin workspace route
        if (!superAdminStructuralPaths.includes(location.pathname)) {
          navigate("/all-admins"); 
        }
      } else if (data?.role === "admin") {
        // If they are a standard admin, keep them within their allowed workspace views
        const adminStructuralPaths = ["/users", "/create-seat", "/create-shifts", "/rooms"];
        if (!adminStructuralPaths.includes(location.pathname)) {
          navigate("/users");
        }
      }
    } catch (err) { 
      console.error("Sidebar Guard Routing Error:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      setAdmin(null); 
      navigate("/login"); // Fallback safely to login on unexpected errors
    }
  }, [location.pathname, navigate]);
 useEffect(() => { 
    setIsOpen(false); 
  }, [location.pathname]);

const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setAdmin(null); 
    navigate("/login");
  };
  const hideSidebar = authPaths.includes(location.pathname);

  if (hideSidebar) return null;

  const isSuperAdmin = admin?.role === "super_admin";
  const activeNavItems = isSuperAdmin ? superAdminNavItems : adminNavItems;

  const NavLinks = ({ onClose }) => (
    <>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-3 mt-2">
        {isSuperAdmin ? "Control Center" : "Library Workspace"}
      </p>

      {activeNavItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 group mb-1
            ${isActive
              ? isSuperAdmin 
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/25"
                : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
          }
        >
          <span className="flex items-center gap-3">
            <item.icon size={18} />
            <span className="font-semibold text-sm">{item.label}</span>
          </span>
          <ChevronRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity" />
        </NavLink>
      ))}
    </>
  );

  const ProfileSection = () => (
    <div className="p-4 border-t border-slate-800 bg-slate-950/40">
      <div className="flex items-center gap-3 px-1 py-2 mb-2">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-black uppercase shrink-0
          ${isSuperAdmin 
            ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
            : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
          }`}
        >
          {admin?.name?.charAt(0) || "A"}
        </div>
        <div className="overflow-hidden">
          <p className="text-white text-sm font-bold truncate">{admin?.name || "User"}</p>
          <p className="text-slate-500 text-[11px] font-medium tracking-wide capitalize truncate">
            {isSuperAdmin ? "Platform Director" : "Library Admin"}
          </p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all text-sm font-semibold"
      >
        <LogOut size={16} className="text-slate-500 group-hover:text-rose-400" />
        Sign Out
      </button>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[240px] bg-slate-900 border-r border-slate-800 flex-col z-50">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3 bg-slate-950/20">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shrink-0
            ${isSuperAdmin ? "bg-amber-600 shadow-amber-600/10" : "bg-indigo-600 shadow-indigo-500/10"}`}
          >
            <Library className="text-white" size={18} />
          </div>
          <span className="text-white font-black text-xl tracking-tight">
            Lib<span className={isSuperAdmin ? "text-amber-400" : "text-indigo-400"}>Sync</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <NavLinks />
        </nav>

        <ProfileSection />
      </aside>

      {/* ── MOBILE MENU BUTTON ── */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center shadow-lg text-slate-300"
      >
        <Menu size={18} />
      </button>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      <div
        onClick={() => setIsOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* ── MOBILE SLIDE-IN DRAWER ── */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-screen w-[260px] bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white
              ${isSuperAdmin ? "bg-amber-600" : "bg-indigo-600"}`}
            >
              <Library size={18} />
            </div>
            <span className="text-white font-black text-lg">
              Lib<span className={isSuperAdmin ? "text-amber-400" : "text-indigo-400"}>Sync</span>
            </span>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 rounded-lg">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <NavLinks onClose={() => setIsOpen(false)} />
        </nav>

        <ProfileSection />
      </aside>
    </>
  );
};

export default Sidebar;