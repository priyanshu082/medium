import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Home } from './pages/Home'
import { RoomDetails } from './pages/Room'

// Protected Route wrapper component
// const ProtectedRoute = ({ children }:any) => {
//   const token = localStorage.getItem('token')
  
//   if (!token) {
//     return <Navigate to="/" replace />
//   }
  
//   return children
// }

// Public Route wrapper component (accessible only if NOT logged in)

// const PublicRoute = ({ children }:any) => {
//   const token = localStorage.getItem('token')
  
//   if (token) {
//     return <Navigate to="/signin" replace />
//   }
  
//   return children
// }

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - only accessible if not logged in */}
        <Route path="/" element={
          
            <Home />
          
        } />
        <Route path="/room/:id" element={
          
            <RoomDetails />
          
        } />
        <Route path="/signin" element={
          
            <Signin />
          
        } />

        {/* Protected routes - only accessible if logged in */}
        
  
      </Routes>
    </BrowserRouter>
  )
}

export default App