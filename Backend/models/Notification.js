// src/models/Notification.js
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['booking_created', 'booking_accepted', 'booking_cancelled', 'payment_received', 'message_received'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true // Auto creates createdAt and updatedAt flags
  }
);

// ==========================================
// DAY 29 INDEXING: Performance Optimization
// ==========================================
// Yeh index query execution plan ko fast karega jab hum specific user ki list dhoondein ge.
NotificationSchema.index({ userId: 1 });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
