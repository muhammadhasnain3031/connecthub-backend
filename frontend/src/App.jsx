import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ServicesList from './pages/ServicesList';
import Home from './pages/Home';

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const MyProfile = lazy(() => import('./pages/MyProfile'));
const BookingDetail = lazy(() => import('./pages/BookingDetail'));
const Chat = lazy(() => import('./pages/Chat'));

const navClass = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '');

function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <AuthProvider>
      <ChatProvider>
        <div>
          {!isDashboard && (
            <nav className="navbar">
              <Link to="/" className="brand">
                <div className="brand-logo">C</div>
                ConnectHub
              </Link>
              <div className="nav-links">
                <NavLink to="/services" className={navClass}>Services</NavLink>
                <NavLink to="/dashboard/bookings" className={navClass}>My Bookings</NavLink>
                <NavLink to="/dashboard/chat/general" className={navClass}>Live Chat</NavLink>
                <NavLink to="/login" className={navClass}>Login</NavLink>
                <Link to="/register" className="btn btn-sm">Register</Link>
              </div>
            </nav>
          )}

          <Suspense fallback={<div className="empty"><b>Loading...</b></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<ServicesList />} />

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