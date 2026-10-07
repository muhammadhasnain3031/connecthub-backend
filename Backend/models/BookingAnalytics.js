import mongoose from 'mongoose';

const bookingAnalyticsSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true, 
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

bookingAnalyticsSchema.index({ date: 1 });

const BookingAnalytics = mongoose.model('BookingAnalytics', bookingAnalyticsSchema);
export default BookingAnalytics;
