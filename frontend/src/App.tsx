import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Blog } from './pages/Blog'
import { Blogs } from './pages/Blogs'
import { Publish } from './pages/Publish'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'

// Protected Route wrapper component
const ProtectedRoute = ({ children }:any) => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return <Navigate to="/" replace />
  }
  
  return children
}

// Public Route wrapper component (accessible only if NOT logged in)
const PublicRoute = ({ children }:any) => {
  const token = localStorage.getItem('token')
  
  if (token) {
    return <Navigate to="/blogs" replace />
  }
  
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - only accessible if not logged in */}
        <Route path="/" element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        <Route path="/signin" element={
          <PublicRoute>
            <Signin />
          </PublicRoute>
        } />

        {/* Protected routes - only accessible if logged in */}
        <Route path="/blog/:id" element={
          <ProtectedRoute>
            <Blog />
          </ProtectedRoute>
        } />
        <Route path="/blogs" element={
          <ProtectedRoute>
            <Blogs />
          </ProtectedRoute>
        } />
        <Route path="/publish" element={
          <ProtectedRoute>
            <Publish />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App