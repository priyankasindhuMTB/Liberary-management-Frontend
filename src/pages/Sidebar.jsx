import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Armchair,
  Clock,
  ShieldCheck,
  LogOut,
  Library,
  ChevronRight
} from "lucide-react";

const navItems = [
  { path: "/users", label: "Members", icon: Users },
  { path: "/create-seat", label: "Seats", icon: Armchair },
  { path: "/create-shifts", label: "Shifts", icon: Clock },
  { path: "/all-admins", label: "All-Admin", icon: Clock },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);

  // Sync admin state with LocalStorage whenever the route changes
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("admin"));
      setAdmin(data);
    } catch (err) {
      setAdmin(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/login");
  };

  // Don't show sidebar on login, setup, or request pages
  const hideSidebar = ["/login", "/", "/super-admin/login", "/setup-super", "/request"].includes(location.pathname);

  if (hideSidebar) return null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
      {/* Brand Section */}
      <div className="p-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Library className="text-white" size={22} />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Lib<span className="text-indigo-400">Sync</span>
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest px-2 mb-2">Main Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}

        {/* Super Admin Section - Only shows if role is super_admin */}
        {admin?.role === "super_admin" && (
          <>
            <div className="pt-6 pb-2 border-t border-slate-800 mt-4">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest px-2 mb-2">Administration</p>
            </div>
            <NavLink
              to="/super-admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${isActive
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                  : "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                }`
              }
            >
              <ShieldCheck size={20} />
              <span className="font-medium text-sm">Pending Requests</span>
            </NavLink>
            <NavLink
              to="/all-admins"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive 
                  ? "bg-indigo-600 text-white shadow-lg" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Users size={20} />
              <span className="font-medium text-sm">Approved Admins</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Bottom Profile/Logout Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-bold border border-slate-600 uppercase">
            {admin?.name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-white text-xs font-bold truncate">{admin?.name || "Admin"}</p>
            <p className="text-slate-500 text-[10px] truncate capitalize">{admin?.role?.replace('_', ' ')}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-200"
        >
          <LogOut size={20} className="text-red-500" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;