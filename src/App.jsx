import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import UserList from './pages/UserList';
import CreateShift from './pages/CreateShift';
import CreateSeat from './pages/CreateSeat';
import Sidebar from './pages/Sidebar';
import Login from './pages/Login';
import AdminRegister from './pages/AdminRegister';
import SetupFirstSuper from './pages/SetupFirstSuper';
import AdminList from './pages/AdminList';
import CreateRoom from './pages/CreateRoom';
import CreateAdminDirectly from './pages/CreateAdminDirectly';
import { syncNotificationPermission, listenForLiveMessages } from './firebaseConfig';
import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle2, XCircle, Info, Loader2, X } from 'lucide-react';
import './App.css';

/* ============================================
   PROFESSIONAL CUSTOM TOASTER
   ============================================ */
function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      containerStyle={{
        top: 24,
        right: 24,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          margin: 0,
          maxWidth: '420px',
        },
      }}
    >
      {(t) => {
        const type = t.type;
        const config = {
          success: {
            accent: 'bg-gradient-to-b from-emerald-400 to-emerald-600',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            progressBar: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
            title: 'Success',
            icon: <CheckCircle2 size={20} strokeWidth={2.5} />,
          },
          error: {
            accent: 'bg-gradient-to-b from-red-400 to-red-600',
            iconBg: 'bg-red-50',
            iconColor: 'text-red-600',
            progressBar: 'bg-gradient-to-r from-red-400 to-red-600',
            title: 'Error',
            icon: <XCircle size={20} strokeWidth={2.5} />,
          },
          loading: {
            accent: 'bg-gradient-to-b from-indigo-400 to-indigo-600',
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            progressBar: 'bg-gradient-to-r from-indigo-400 to-indigo-600',
            title: 'Processing',
            icon: <Loader2 size={20} strokeWidth={2.5} className="animate-spin" />,
          },
          blank: {
            accent: 'bg-gradient-to-b from-slate-400 to-slate-600',
            iconBg: 'bg-slate-50',
            iconColor: 'text-slate-600',
            progressBar: 'bg-gradient-to-r from-slate-400 to-slate-600',
            title: 'Notification',
            icon: <Info size={20} strokeWidth={2.5} />,
          },
        };

        const c = config[type] || config.blank;

        return (
          <div
            className={`
              pointer-events-auto relative flex w-full max-w-md overflow-hidden 
              rounded-2xl bg-white shadow-2xl border border-slate-200/60
              ${t.visible ? 'animate-toastIn' : 'animate-toastOut'}
            `}
          >
            {/* Left Accent Bar */}
            <div className={`w-1.5 flex-shrink-0 ${c.accent}`} />

            <div className="flex-1 p-4 flex items-start gap-3">
              {/* Icon */}
              <div
                className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl ${c.iconBg} ${c.iconColor}`}
              >
                {c.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  {c.title}
                </p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">
                  {typeof t.message === 'function' ? t.message(t) : t.message}
                </p>
              </div>

              {/* Close Button */}
              {type !== 'loading' && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {type !== 'loading' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 overflow-hidden">
                <div
                  className={`h-full ${c.progressBar}`}
                  style={{
                    animation: `toastProgress ${t.duration || 4000}ms linear forwards`,
                  }}
                />
              </div>
            )}
          </div>
        );
      }}
    </Toaster>
  );
}

function AppLayout() {
  const location = useLocation();

  const hideSidebarRoutes = ['/', '/login', '/setup-super', '/register'];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      syncNotificationPermission();
      const unsubscribe = listenForLiveMessages();
      return () => unsubscribe();
    }
  }, []);

  return (
    <div className="flex">
      {/* ✨ Professional Custom Toaster */}
      <CustomToaster />

      {!shouldHideSidebar && <Sidebar />}

      <main
        className={`flex-1 min-h-screen bg-slate-50 pb-16 md:pb-0 ${
          shouldHideSidebar ? 'ml-0' : 'ml-0 md:ml-[240px]'
        }`}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<AdminRegister />} />
          <Route path="/setup-super" element={<SetupFirstSuper />} />
          <Route path="/all-admins" element={<AdminList />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/create-seat" element={<CreateSeat />} />
          <Route path="/create-shifts" element={<CreateShift />} />
          <Route path="/rooms" element={<CreateRoom />} />
          <Route path="/create-admin-direct" element={<CreateAdminDirectly />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;