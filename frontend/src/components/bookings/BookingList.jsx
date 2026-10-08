// src/components/bookings/BookingList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BookingCard from './BookingCard'; // Importing the child card

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('/api/bookings');
        setBookings(response.data.data);
      } catch (err) {
        setErrorMessage('Failed to fetch bookings.');
      }
    };
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId, currentVersion) => {
    setErrorMessage(''); 
    const previousBookings = [...bookings];

    // Optimistic Update
    const optimisticBookings = bookings.map((booking) => {
      if (booking._id === bookingId) {
        return { ...booking, status: 'cancelled' }; 
      }
      return booking;
    });
    setBookings(optimisticBookings);

    try {
      await axios.patch(`/api/bookings/${bookingId}`, { 
        status: 'cancelled',
        clientVersion: currentVersion 
      });
      console.log('[Sync Success] State synchronized safely.');
    } catch (error) {
      console.error('[Sync Failed] Rolling back...', error);
      setBookings(previousBookings); // Rollback
      
      if (error.response && error.response.status === 409) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to modify booking due to a system error.');
      }
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'left' }}>
      <h2>ConnectHub — Bookings Management</h2>
      
      {errorMessage && (
        <div style={{ color: '#ff4d4d', fontWeight: 'bold', marginBottom: '15px' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {bookings.map((booking) => (
          /* Rendering the child presentation card cleanly */
          <BookingCard 
            key={booking._id} 
            booking={booking} 
            onCancel={handleCancelBooking} 
          />
        ))}
      </div>
    </div>
  );
}
