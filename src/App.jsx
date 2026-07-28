import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import UserList from './pages/UserList'
import CreateShift from './pages/CreateShift'
import CreateSeat from './pages/CreateSeat'
import Sidebar from './pages/Sidebar' 
import Login from './pages/Login'
import AdminRegister from './pages/AdminRegister'
import SetupFirstSuper from './pages/SetupFirstSuper'
import AdminList from './pages/AdminList';
import CreateRoom from './pages/CreateRoom'
import './App.css'
import CreateAdminDirectly from './pages/CreateAdminDirectly';
import {syncNotificationPermission,listenForLiveMessages} from './firebaseConfig';
import { Toaster } from 'react-hot-toast';

function AppLayout() {
  const location = useLocation();
  
  const hideSidebarRoutes = [
    '/', 
    '/login', 
    '/setup-super', 
    '/register'
  ];
  
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
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      {!shouldHideSidebar && <Sidebar />}

      <main className={`flex-1 min-h-screen bg-slate-50 pb-16 md:pb-0 ${
        shouldHideSidebar ? 'ml-0' : 'ml-0 md:ml-[240px]'
      }`}>
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
  )
}

export default App;
