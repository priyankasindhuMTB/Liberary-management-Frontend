  import React from 'react'
  import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
  import Registration from './pages/Registration'
  import UserList from './pages/UserList'
  import CreateShift from './pages/CreateShift'
  import CreateSeat from './pages/CreateSeat'
  import Sidebar from './pages/Sidebar' // Changed from Navbar
  import Login from './pages/Login'
  import SuperAdminLogin from './pages/SuperAdminLogin'
  import AdminRequest from './pages/AdminRequest'
  import SuperAdmin from './pages/SuperAdmin'
  import SetupFirstSuper from './pages/SetupFirstSuper'
  import AdminList from './pages/AdminList';
  import './App.css'
import CreateRoom from './pages/CreateRoom'

  function App() {
    return (
      <Router>
        <div className="flex">
          {/* Sidebar is fixed, so it doesn't push the content down */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 min-h-screen bg-slate-50 ml-0 sm:ml-64 md:ml-[240px] pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/super-admin/login" element={<SuperAdminLogin />} />
              <Route path="/setup-super" element={<SetupFirstSuper />} />
              <Route path='/request' element={<AdminRequest/>}/>
              <Route path='/super-admin' element={<SuperAdmin/>}/>
              <Route path="/users" element={<UserList />} />
              <Route path="/create-seat" element={<CreateSeat />} />
              <Route path="/create-shifts" element={<CreateShift />} />
              <Route path="/all-admins" element={<AdminList />} />
              <Route path="/rooms" element={<CreateRoom />} />
            </Routes>
          </main>
        </div>
      </Router>
    )
  }

  export default App