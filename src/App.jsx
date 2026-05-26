import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Registration from './pages/Registration'
import UserList from './pages/UserList'
import CreateShift from './pages/CreateShift'
import CreateSeat from './pages/CreateSeat'
import Sidebar from './pages/Sidebar' 
import Login from './pages/Login'
import SuperAdminLogin from './pages/SuperAdminLogin'
import AdminRequest from './pages/AdminRequest'
import SuperAdmin from './pages/SuperAdmin'
import SetupFirstSuper from './pages/SetupFirstSuper'
import AdminList from './pages/AdminList';
import CreateRoom from './pages/CreateRoom'
import './App.css'
import CreateAdminDirectly from './pages/CreateAdminDirectly'; // 👈 Import new component

// ── Conditional Layout Component ──
function AppLayout() {
  const location = useLocation();
  
  // 1. Removed '/all-admins' from here so the sidebar stays visible!
  const hideSidebarRoutes = [
    '/', 
    '/login', 
    '/super-admin/login', 
    '/setup-super', 
    '/request'
  ];
  
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex">
      {/* Render sidebar for authorized roles */}
      {!shouldHideSidebar && <Sidebar />}

      {/* Dynamic margin layouts handling sidebar space transitions */}
      <main className={`flex-1 min-h-screen bg-slate-50 pb-16 md:pb-0 ${
        shouldHideSidebar ? 'ml-0' : 'ml-0 md:ml-[240px]'
      }`}>
        <Routes>
          {/* Library Admin Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path='/request' element={<AdminRequest/>}/>
          
          {/* Super Admin Auth & Setup */}
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route path="/setup-super" element={<SetupFirstSuper />} />
          
          {/* Core System Portals */}
          <Route path="/all-admins" element={<AdminList />} /> 
          <Route path='/super-admin' element={<SuperAdmin/>}/> 

          {/* Standard Library Dashboard Core Routes */}
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
  )
}

export default App;