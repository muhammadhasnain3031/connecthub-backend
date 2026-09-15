import { useParams } from 'react-router-dom';

function BookingDetail() {
  const { bookingId } = useParams();

  return (
    <div>
      <h3>Booking Detail</h3>
      <p>Ye hai booking ID: {bookingId}</p>
    </div>
  );
}

export default BookingDetail;