import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VehicleDetail from './pages/VehicleDetail';
import Dashboard from './pages/Dashboard';
import HostDashboard from './pages/HostDashboard';
import Success from './pages/Success';
import './index.css';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Explore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/vehicle/:id" element={<VehicleDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/host" element={<HostDashboard />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col font-sans">
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: 'rgba(15, 15, 20, 0.9)',
              color: '#fff',
              border: '1px solid rgba(255, 0, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              fontFamily: '"Barlow Condensed", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            },
            success: {
              iconTheme: {
                primary: '#00FFFF',
                secondary: '#000'
              }
            }
          }} />
          <Navbar />
          <main className="flex-grow">
            <AnimatedRoutes />
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
