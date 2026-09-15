import { Link } from 'react-router-dom';

function MyBookings() {
  return (
    <div>
      <h3>My Bookings Page</h3>
      <ul>
        <li><Link to="1">Booking #1</Link></li>
        <li><Link to="2">Booking #2</Link></li>
        <li><Link to="abc999">Booking #abc999</Link></li>
      </ul>
    </div>
  );
}

export default MyBookings;