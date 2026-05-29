import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Registration from './pages/Registration'
import UserList from './pages/UserList'
import CreateShift from './pages/CreateShift'
import CreateSeat from './pages/CreateSeat'
import Sidebar from './pages/Sidebar' 
import Login from './pages/Login'
import AdminRequest from './pages/AdminRequest'
import SuperAdmin from './pages/SuperAdmin'
import SetupFirstSuper from './pages/SetupFirstSuper'
import AdminList from './pages/AdminList';
import CreateRoom from './pages/CreateRoom'
import './App.css'
import CreateAdminDirectly from './pages/CreateAdminDirectly';

// ── Conditional Layout Component ──
function AppLayout() {
  const location = useLocation();
  
  // Is list mein jo routes honge unpar Sidebar nahi dikhega (Jaise Login, Request wagera)
  const hideSidebarRoutes = [
    '/', 
    '/login', 
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
          {/* Common Login Route for both Admin & Super Admin */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path='/request' element={<AdminRequest/>}/>
          
          {/* Initial System Setup Route */}
          <Route path="/setup-super" element={<SetupFirstSuper />} />
          
          {/* Core System Portals (Super Admin Screens) */}
          <Route path="/all-admins" element={<AdminList />} /> 
          <Route path='/super-admin' element={<SuperAdmin/>}/> 

          {/* Standard Library Dashboard Core Routes (Regular Admin Screens) */}
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
      {/* AppLayout ko Router ke andar rakhna zaroori hai taaki useLocation() kaam kare */}
      <AppLayout />
    </Router>
  )
}

export default App;