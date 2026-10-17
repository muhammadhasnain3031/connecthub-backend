import { Link } from 'react-router-dom';

function Home() {
  return (
    <>
      <section className="hero">
        <h1>Find & Book Trusted Services</h1>
        <p>ConnectHub par web developers, designers aur writers se connect karo, book karo aur seedha chat karo.</p>
        <div className="hero-actions">
          <Link to="/services" className="btn">Browse Services</Link>
          <Link to="/dashboard/bookings" className="btn btn-outline">My Bookings</Link>
        </div>
      </section>

      <div className="page">
        <div className="features">
          <Link to="/services" className="feature">
            <div className="emoji">🔍</div>
            <h3>Search Easily</h3>
            <p>Category aur price filter se apni pasand ki service dhoondo.</p>
          </Link>

          <Link to="/dashboard/bookings" className="feature">
            <div className="emoji">📅</div>
            <h3>Quick Booking</h3>
            <p>Ek click mein service book karo aur status track karo.</p>
          </Link>

          <Link to="/dashboard/chat/general" className="feature">
            <div className="emoji">💬</div>
            <h3>Live Chat</h3>
            <p>Service provider se real-time chat karo.</p>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Home;