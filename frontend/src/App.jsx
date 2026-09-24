import { Routes, Route, Link } from 'react-router-dom';
import { useState, lazy, Suspense } from 'react'; // NAYA: lazy aur Suspense import kiya
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ServicesList from './pages/ServicesList';



// NAYA: Static imports ko hata kar dynamic imports (Code Splitting) mein badla
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const MyProfile = lazy(() => import('./pages/MyProfile'));
const BookingDetail = lazy(() => import('./pages/BookingDetail'));


function App() {
  return (
    <AuthProvider>
      <div>
        {/* 1. Simple Navigation Menu bars bina kisi styling ke */}
        <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px' }}>
          <Link to="/login" style={{ marginRight: '15px' }}>Login Page</Link>
          <Link to="/register" style={{ marginRight: '15px' }}>Register Page</Link>
          <Link to="/services" style={{ marginRight: '15px' }}>Services Page</Link>

        </nav>

        {/* 2. Routing Switchboard Engine Mapping Wrapped in Suspense */}
        {/* NAYA: Suspense component se wrap kiya taake background chunks load hote waqt fallback dikhe */}
        <Suspense fallback={<div style={{ padding: '20px' }}><b>Loading component chunk...</b></div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/services" element={<ServicesList />} />

            <Route path="/" element={<h3>Welcome to ConnectHub! Click above to Navigate.</h3>} />

            {/* Nested routes with Lazy Loaded Components */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="bookings" element={<MyBookings />} />
              <Route path="bookings/:bookingId" element={<BookingDetail />} />  
              <Route path="profile" element={<MyProfile />} />
              
            </Route>
          </Routes>
        </Suspense>
      </div>
    </AuthProvider>
  );
}

export default App;
