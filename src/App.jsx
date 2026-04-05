
import React from 'react'
import Registration from './pages/Registration'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import UserList from './pages/UserList'
// import Navbar from './pages/Navbar'
import CreateShift from './pages/CreateShift'


import './App.css'
import CreateSeat from './pages/CreateSeat'

function App() {
 

  return (
   <Router>
      <Routes>
        
        <Route path="/" element={<Registration />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/create-seat" element={<CreateSeat />} />
        <Route path="/create-shifts" element={<CreateShift />} />

      </Routes>
    </Router>
  )
}

export default App
