import BookingAnalytics from '../models/BookingAnalytics.js';

class BookingAnalyticsRepository {
  async trackEvent(dateStr, amount) {
    return await BookingAnalytics.findOneAndUpdate(
      { date: dateStr },
      { 
        $inc: { totalBookings: 1, totalRevenue: amount } 
      },
      { upsert: true, new: true }
    );
  }
}

export default new BookingAnalyticsRepository();
