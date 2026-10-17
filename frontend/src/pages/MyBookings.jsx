import { Link } from 'react-router-dom';

const sampleBookings = [
  { id: '1', service: 'Website Development', date: '20 Oct 2026', price: 250, status: 'confirmed' },
  { id: '2', service: 'Logo Design', date: '24 Oct 2026', price: 80, status: 'pending' },
  { id: 'abc999', service: 'SEO Content Writing', date: '02 Oct 2026', price: 45, status: 'completed' },
];

function MyBookings() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0 }}>Meri Bookings ({sampleBookings.length})</h3>
        <Link to="/services" className="btn btn-sm">+ New Booking</Link>
      </div>

      <div className="booking-list">
        {sampleBookings.map((b) => (
          <Link key={b.id} to={`/dashboard/bookings/${b.id}`} className="booking-item">
            <div>
              <h4>{b.service}</h4>
              <small>📅 {b.date} &nbsp;•&nbsp; Booking #{b.id}</small>
            </div>
            <div className="booking-right">
              <span className="price">${b.price}</span>
              <span className={`badge ${b.status}`}>{b.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MyBookings;