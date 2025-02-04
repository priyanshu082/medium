import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Signin } from './pages/Signin'
import { Home } from './pages/Home'
import { RoomDetails } from './pages/Room'
import CreateRoom from './pages/CreateRoom'
import BookingPage from './pages/BookingPage'
import Bookings from './pages/Bookings'
import Footer from './components/Footer'
// Protected Route wrapper component
const ProtectedRoute = ({ children }:any) => {
  // const id = localStorage.getItem('id')
  
  // if (!id) {
  //   return <Navigate to="/signin" replace />
  // }
  
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<Signin />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        } />
        <Route path="/createRoom" element={
          <ProtectedRoute>
            <CreateRoom />
              </ProtectedRoute>
        } />
        <Route path="/booking/:id" element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        } />
        <Route path="/room/:id" element={
          <ProtectedRoute>
            <RoomDetails />
          </ProtectedRoute>
        } />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App