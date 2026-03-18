import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SpotDetail from './pages/SpotDetail'
import AddSpot from './pages/AddSpot'
import EditSpot from './pages/EditSpot'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'

function App() {
  return (
    <div>
      <Navbar />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '12px',
            padding: '12px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
          success: {
            style: {
              backgroundColor: '#f0fff4',
              color: '#166534',
              border: '1px solid #86efac',
            },
            iconTheme: {
              primary: '#166534',
              secondary: '#f0fff4',
            },
          },
          error: {
            style: {
              backgroundColor: '#fff0f0',
              color: '#cc0000',
              border: '1px solid #ffcccc',
            },
            iconTheme: {
              primary: '#cc0000',
              secondary: '#fff0f0',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/spots/:id" element={<SpotDetail />} />
        <Route path="/add-spot" element={<AddSpot />} />
        <Route path="/edit-spot/:id" element={<EditSpot />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;