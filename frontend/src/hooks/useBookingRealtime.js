import { useEffect, useState } from 'react';
import supabaseClient from '../config/supabaseClient.js';

/**
 * Custom Hook: useBookingRealtime
 * Yeh component lifecycle ke sath attach ho kar Supabase Change Data Capture (CDC) 
 * broadcast pipeline ko listen karta hai.
 */
export const useBookingRealtime = (userId) => {
  const [liveNotification, setLiveNotification] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const userTargetId = userId.toString();

    // 1. Ek unique realtime connection channel initialize karna
    const bookingChannel = supabaseClient.channel('live-booking-updates')
      .on(
        'broadcast', // Serverless engine se triggered global event capture method
        { event: '*' }, // Sary booking related custom events (* wildcard) ko listen karein
        (response) => {
          const { payload } = response;
          
          // Security Guard: Check karein ke yeh alert isi logged-in user ke liye hai ya nahi
          if (payload && payload.receiverId === userTargetId) {
            console.log('⚡ [Supabase Realtime Alert]:', payload);
            setLiveNotification(payload);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🚀 Connected securely to Supabase Serverless Realtime Channel');
        }
      });

    // Cleanup Pipeline: Jab user screen badle ya component unmount ho, to listener clear karo
    return () => {
      supabaseClient.removeChannel(bookingChannel);
    };
  }, [userId]);

  return { liveNotification, setLiveNotification };
};
