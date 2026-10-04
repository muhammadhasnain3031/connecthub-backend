import fs from 'fs';
import path from 'path';
import bookingRepository from '../repositories/bookingRepository.js';

// =========================================================================
// DAY-16: GET /api/bookings/export (Streams & File System System)
// =========================================================================
export const exportBookingsLog = async (req, res, next) => {
  try {
    // 1. Mock Data (Dummy Bookings)
    const mockBookings = [
      { id: 'B101', client: 'Ali Khan', service: 'MERN Stack Development', amount: 150, date: '2026-03-10' },
      { id: 'B102', client: 'Zainab Ahmed', service: 'Graphic Design UI/UX', amount: 80, date: '2026-03-11' },
      { id: 'B103', client: 'Hamza Yusuf', service: 'SEO Optimization', amount: 120, date: '2026-03-12' },
      { id: 'B104', client: 'Ayesha Raza', service: 'Content Writing', amount: 50, date: '2026-03-13' },
    ];

    // 2. Platform-Independent Path Setup 
    const exportsDir = path.join(process.cwd(), 'exports');
    const filePath = path.join(exportsDir, 'bookings-log.txt');

    // 3. Folder Directory Check (Edge Case Control)
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    // 4. Initialize Writable Stream (The Core Streams Pattern)
    const writeStream = fs.createWriteStream(filePath, { flags: 'w', encoding: 'utf-8' });

    // Header line write karein log file ke top par
    writeStream.write("=========================================\n");
    writeStream.write(`CONNECTHUB BOOKINGS LOG REPORT - GENERATED AT: ${new Date().toISOString()}\n`);
    writeStream.write("=========================================\n\n");

    // 5. Streaming Data Chunks Loop
    mockBookings.forEach((booking, index) => {
      const logLine = `[LOG #${index + 1}] ID: ${booking.id} | Client: ${booking.client} | Service: ${booking.service} | Amount: $${booking.amount} | Date: ${booking.date}\n`;
      
      // Her line ko chunk ki surat mein write stream me bhej rahe hain
      writeStream.write(logLine);
    });

    writeStream.write("\n=========================================\n");
    writeStream.write("END OF LOG REPORT\n");
    writeStream.write("=========================================\n");

    // 6. Stream Closing & Callback Event
    writeStream.end();

    // Event checking hook 
    writeStream.on('finish', () => {
      console.log(`[Streams Success] Logs safely written to: ${filePath}`);
    });

    // 7. Success Response sending back to front-end
    res.status(200).json({
      success: true,
      message: 'Bookings log report exported successfully using Writable Streams!',
      fileName: 'bookings-log.txt',
      savedLocation: filePath
    });

  } catch (error) {
    next(error);
  }
};

// =========================================================================
// DAY-23: CORE BOOKING FLOW LOGIC
// =========================================================================

// 1. Naye Booking Create Karna
export const createBooking = async (req, res, next) => {
  try {
    const { providerId, serviceId, amount } = req.body;
    const clientId = req.user._id; 

    const booking = await bookingRepository.create({
      clientId,
      providerId,
      serviceId,
      amount
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// 2. Logged-in User (Client/Provider) ki Bookings Fetch Karna
export const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const role = req.user.role; 

    let bookings;
    if (role === 'provider') {
      bookings = await bookingRepository.findByProvider(userId);
    } else {
      bookings = await bookingRepository.findByClient(userId);
    }

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// 3. Booking Status Cycle Change Karna (State Machine Architecture)
export const updateBookingStatus = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;
    const userId = req.user._id;

    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isClient = booking.clientId._id.toString() === userId.toString();
    const isProvider = booking.providerId._id.toString() === userId.toString();

    if (!isClient && !isProvider) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    if (status === 'accepted' && !isProvider) {
      return res.status(403).json({ success: false, message: 'Only providers can accept bookings' });
    }

    const updatedBooking = await bookingRepository.updateStatus(bookingId, status);

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};
