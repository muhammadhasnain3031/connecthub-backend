import { Link } from 'react-router-dom';

function ServiceCard({ service }) {
  return (
    <div className="card">
      <span className="badge">{service.category || 'General'}</span>
      <h3>{service.title}</h3>
      <p>
        {service.description?.length > 100
          ? service.description.slice(0, 100) + '...'
          : service.description}
      </p>
      <div className="card-foot">
        <span className="price">${service.price}</span>
        <Link to="/dashboard/bookings" className="btn btn-sm">Book Now</Link>
      </div>
    </div>
  );
}

export default ServiceCard;