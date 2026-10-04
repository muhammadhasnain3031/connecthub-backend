import Booking from '../models/Booking.js';

class BookingRepository {
  // 1. Naye booking create karne ke liye
  async create(bookingData) {
    const booking = new Booking(bookingData);
    return await booking.save();
  }

  // 2. ID ke zariye booking dhoondne aur data populate karne ke liye
  async findById(bookingId) {
    return await Booking.findById(bookingId)
      .populate('clientId', 'name email')
      .populate('providerId', 'name email')
      .populate('serviceId', 'title price');
  }

  // 3. Client ki saari bookings dekhne ke liye
  async findByClient(clientId) {
    return await Booking.find({ clientId })
      .populate('providerId', 'name email')
      .populate('serviceId', 'title price')
      .sort({ createdAt: -1 }); // Naye bookings pehle aayengi
  }

  // 4. Provider ki saari bookings dekhne ke liye
  async findByProvider(providerId) {
    return await Booking.find({ providerId })
      .populate('clientId', 'name email')
      .populate('serviceId', 'title price')
      .sort({ createdAt: -1 });
  }

  // 5. Booking status update karne ke liye (State Machine transition)
  async updateStatus(bookingId, status) {
    return await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true, runValidators: true }
    );
  }
}

export default new BookingRepository();
