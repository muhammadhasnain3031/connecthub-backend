import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: 'bookings', label: 'My Bookings', icon: '📅' },
  { to: 'chat/general', label: 'Live Chat', icon: '💬' },
  { to: 'profile', label: 'My Profile', icon: '👤' },
];

const pageTitles = {
  bookings: 'My Bookings',
  profile: 'My Profile',
  chat: 'Chat',
};

function DashboardLayout() {
  const location = useLocation();
  const currentSection = location.pathname.split('/')[2];
  const pageTitle = pageTitles[currentSection] || 'Dashboard';

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="dash">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <div className="brand-logo">C</div>
          ConnectHub
        </Link>

        <p className="side-label">Menu</p>
        <nav className="side-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 'side-link' + (isActive ? ' active' : '')}
            >
              <span>{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="side-bottom">
          <Link to="/services" className="side-link"><span>🛍️</span> Browse Services</Link>
          <button className="side-link" onClick={handleLogout}><span>🚪</span> Logout</button>
        </div>
      </aside>

      <div className="dash-main">
        <header className="topbar">
          <h2>{pageTitle}</h2>
          <span>Welcome back 👋</span>
        </header>

        <main className="dash-content">
          <div className="panel">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;