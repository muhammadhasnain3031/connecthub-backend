import { Outlet, Link } from 'react-router-dom';

function DashboardLayout() {
  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: '200px', padding: '10px', background: '#f4f4f4' }}>
        <h4>Dashboard</h4>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="bookings">My Bookings</Link>
          <Link to="profile">My Profile</Link>
        </nav>
      </aside>

      {/* Yahan child route ka content render hoga */}
      <main style={{ padding: '20px', flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;