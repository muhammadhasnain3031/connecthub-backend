import { Routes, Route, Link } from 'react-router-dom';
import { useState, lazy, Suspense } from 'react'; 
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext'; // Context layer input import
import Login from './pages/Login';
import Register from './pages/Register';
import ServicesList from './pages/ServicesList';

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const MyProfile = lazy(() => import('./pages/MyProfile'));
const BookingDetail = lazy(() => import('./pages/BookingDetail'));
const Chat = lazy(() => import('./pages/Chat')); 

function App() {
  return (
    <AuthProvider>
      <ChatProvider> {/* ⚡ Perfect contextual nesting placement */}
        <div>
          <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px' }}>
            <Link to="/login" style={{ marginRight: '15px' }}>Login Page</Link>
            <Link to="/register" style={{ marginRight: '15px' }}>Register Page</Link>
            <Link to="/services" style={{ marginRight: '15px' }}>Services Page</Link>
          </nav>

          <Suspense fallback={<div style={{ padding: '20px' }}><b>Loading component chunk...</b></div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<ServicesList />} />
              <Route path="/" element={<h3>Welcome to ConnectHub! Click above to Navigate.</h3>} />

              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route path="bookings" element={<MyBookings />} />
                <Route path="bookings/:bookingId" element={<BookingDetail />} />  
                <Route path="profile" element={<MyProfile />} />
                <Route path="chat/:conversationId" element={<Chat />} />
              </Route>
            </Routes>
          </Suspense>
        </div>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
