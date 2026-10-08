// src/components/bookings/BookingCard.jsx
import React from 'react';

export default function BookingCard({ booking, onCancel }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
      <h3>{booking.serviceId?.title || 'Freelance Service Item'}</h3>
      <p>Amount: ${booking.amount}</p>
      <p>Status: <strong style={{ color: booking.status === 'cancelled' ? 'red' : 'orange' }}>
        {booking.status.toUpperCase()}
      </strong></p>
      
      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
        <button 
          onClick={() => onCancel(booking._id, booking.__v)}
          style={{ backgroundColor: '#ff4d4d', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cancel Booking
        </button>
      )}
    </div>
  );
}
