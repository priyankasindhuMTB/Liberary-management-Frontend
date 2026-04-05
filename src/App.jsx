
// import React from 'react'
// import Registration from './pages/Registration'
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import UserList from './pages/UserList'

// import CreateShift from './pages/CreateShift'


// import './App.css'
// import CreateSeat from './pages/CreateSeat'

// function App() {
 

//   return (
//    <Router>
//       <Routes>
//         <Route path="/" element={<Registration />} />
//         <Route path="/users" element={<UserList />} />
//         <Route path="/create-seat" element={<CreateSeat />} />
//         <Route path="/create-shifts" element={<CreateShift />} />
//       </Routes>
//     </Router>
//   )
// }

// export default App
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Registration from './pages/Registration'
import UserList from './pages/UserList'
import CreateShift from './pages/CreateShift'
import CreateSeat from './pages/CreateSeat'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  return (
    <Router>
      <Navbar />
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