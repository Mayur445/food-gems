import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SpotDetail from './pages/SpotDetail'
import AddSpot from './pages/AddSpot'
import Navbar from './components/Navbar'

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/spots/:id" element={<SpotDetail />} />
        <Route path="/add-spot" element={<AddSpot />} />
      </Routes>
    </div>
  );
}

export default App;