import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Home } from './pages/Home'
import { RoomDetails } from './pages/Room'

// Protected Route wrapper component
const ProtectedRoute = ({ children }:any) => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return <Navigate to="/signin" replace />
  }
  
  return children
}

// Public Route wrapper component (accessible only if NOT logged in)
const PublicRoute = ({ children }:any) => {
  const token = localStorage.getItem('token')
  
  if (token) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - only accessible if not logged in */}
        <Route path="/signin" element={
          <PublicRoute>
            <Signin />
          </PublicRoute>
        } />

        {/* Protected routes - only accessible if logged in */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/room/:id" element={
          <ProtectedRoute>
            <RoomDetails />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App