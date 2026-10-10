// src/listeners/notificationListener.js
import appEventEmitter from '../utils/eventEmitter.js';
import Notification from '../models/Notification.js';

// Handler functions for distinct system processes
const handleBookingCancelled = async (data) => {
  const { clientId, providerId, serviceTitle } = data;
  
  try {
    /*
      Step-by-Step Example State Tracking:
      - Trigger Input: data = { clientId: "id1", providerId: "id2", serviceTitle: "Logo Design" }
      - Action: Create database record mapping for both client and provider dynamically
    */
    
    // 1. Notify the Client
    await Notification.create({
      userId: clientId,
      type: 'booking_cancelled',
      message: `Your booking for "${serviceTitle}" has been cancelled successfully.`
    });

    // 2. Notify the Provider
    await Notification.create({
      userId: providerId,
      type: 'booking_cancelled',
      message: `The client has cancelled the booking for "${serviceTitle}".`
    });

    console.log('[Listener Success] Notification records injected securely into DB.');

  } catch (error) {
    console.error('[Listener Error] Failed to persist booking_cancelled notification:', error.message);
  }
};

const handlePaymentReceived = async (data) => {
  const { payeeId, amount, bookingId } = data;
  try {
    await Notification.create({
      userId: payeeId,
      type: 'payment_received',
      message: `Payment of \$${amount} received successfully for Booking ID: ${bookingId}.`
    });
    console.log('[Listener Success] Payment notification saved.');
  } catch (error) {
    console.error('[Listener Error] Failed to save payment notification:', error.message);
  }
};

// ==========================================
// REGISTERING SUBSCRIPTIONS (Pub/Sub Wire-up)
// ==========================================
export const initNotificationListeners = () => {
  appEventEmitter.on('booking_cancelled', handleBookingCancelled);
  appEventEmitter.on('payment_received', handlePaymentReceived);
  
  console.log('[Listeners Active] Notification event channels successfully mapped.');
};
