import { useParams, Link } from 'react-router-dom';

function BookingDetail() {
  const { bookingId } = useParams();

  return (
    <div>
      <Link to="/dashboard/bookings" style={{ color: 'var(--primary)', fontWeight: 600 }}>
        ← Back to Bookings
      </Link>

      <h3 style={{ margin: '16px 0 10px' }}>Booking Detail</h3>

      <div className="detail-row"><span>Booking ID</span><b>#{bookingId}</b></div>
      <div className="detail-row"><span>Status</span><span className="badge pending">pending</span></div>
      <div className="detail-row"><span>Payment</span><b>Unpaid</b></div>

      <div className="detail-actions">
        <Link to={`/dashboard/chat/${bookingId}`} className="btn">💬 Open Chat</Link>
        <Link to="/services" className="btn btn-outline">Browse More Services</Link>
      </div>
    </div>
  );
}

export default BookingDetail;