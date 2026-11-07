import fs from 'fs';
import path from 'path';
import bookingRepository from '../repositories/bookingRepository.js';
import paymentRepository from '../repositories/paymentRepository.js';
import appEventEmitter from '../utils/eventEmitter.js';
import logger from '../config/logger.js'; // 🔥 Winston Logger Engine Integration
import supabase from '../config/supabase.js'; // ⚡ DAY 40 INTEGRATION: Supabase Client

/**
 * 📊 EXPORT BOOKINGS LOG REPORT
 * Node's fs module and Writable Streams pattern
 */
export const exportBookingsLog = async (req, res, next) => {
  try {
    const mockBookings = [
      { id: 'B101', client: 'Ali Khan', service: 'MERN Stack Development', amount: 150, date: '2026-03-10' },
      { id: 'B102', client: 'Zainab Ahmed', service: 'Graphic Design UI/UX', amount: 80, date: '2026-03-11' },
      { id: 'B103', client: 'Hamza Yusuf', service: 'SEO Optimization', amount: 120, date: '2026-03-12' },
      { id: 'B104', client: 'Ayesha Raza', service: 'Content Writing', amount: 50, date: '2026-03-13' },
    ];
    const exportsDir = path.join(process.cwd(), 'exports');
    const filePath = path.join(exportsDir, 'bookings-log.txt');

    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    const writeStream = fs.createWriteStream(filePath, { flags: 'w', encoding: 'utf-8' });
    writeStream.write('=========================================\n');
    writeStream.write(`CONNECTHUB BOOKINGS LOG REPORT - GENERATED AT: ${new Date().toISOString()}\n`);
    writeStream.write('=========================================\n\n');

    mockBookings.forEach((booking, index) => {
      const logLine = `[LOG #${index + 1}] ID: ${booking.id} | Client: ${booking.client} | Service: ${booking.service} | Amount: $${booking.amount} | Date: ${booking.date}\n`;
      writeStream.write(logLine);
    });

    writeStream.write('\n=========================================\n');
    writeStream.write('END OF LOG REPORT\n');
    writeStream.write('=========================================\n');
    writeStream.end();

    writeStream.on('finish', () => {
      logger.info(`[Streams Success] Logs safely written to: ${filePath}`);
    });

    res.status(200).json({
      success: true,
      message: 'Bookings log report exported successfully using Writable Streams!',
      fileName: 'bookings-log.txt',
      savedLocation: filePath,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ➕ CREATE NEW BOOKING
 * MongoDB persistence + Hybrid Multi-channel Realtime Broadcast
 */
export const createBooking = async (req, res, next) => {
  try {
    const { providerId, serviceId, amount } = req.body;
    const clientId = req.user._id;

    const booking = await bookingRepository.create({
      clientId,
      providerId,
      serviceId,
      amount,
    });

    const providerTargetId = providerId.toString();

    // 1. 🔥 DAY 39: Socket Room Push (Alternative Pipeline)
    if (req.io && booking) {
      req.io.to(providerTargetId).emit('new_booking_alert', {
        success: true,
        message: `🎉 Nayi Booking Alert! Ek client ne aapki service book ki hai.`,
        bookingId: booking._id,
        amount: booking.amount,
        status: booking.status || 'pending'
      });
      logger.info(`🔔 [Socket Pipeline]: Broadcasted 'new_booking_alert' to Provider Room: ${providerTargetId}`);
    }

    // 2. ⚡ DAY 40: Supabase Decoupled Serverless Broadcast (Production Engine)
    if (booking) {
      await supabase.channel('live-booking-updates').send({
        type: 'broadcast',
        event: 'new-booking',
        payload: {
          bookingId: booking._id,
          amount: booking.amount,
          status: booking.status || 'pending',
          receiverId: providerTargetId,
          message: `🎉 Nayi Booking Alert! Ek client ne aapki service book ki hai.`
        }
      });
      logger.info(`⚡ [Supabase Pipeline]: Broadcasted 'new-booking' event for Provider: ${providerTargetId}`);
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🔍 FETCH USER SPECIFIC BOOKINGS
 */
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
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🔄 UPDATE BOOKING STATUS SECURELY
 * ACID Transactions, Optimistic Locks validation, and Dual Realtime Notification Triggers
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { status, clientVersion } = req.body;
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

    const clientTargetId = booking.clientId._id.toString();
    const providerTargetId = booking.providerId._id.toString();

    if (status === 'accepted' && !isProvider) {
      return res.status(403).json({ success: false, message: 'Only providers can accept bookings' });
    }

    // ========================================================
    // 💼 TRANSACTION FLOW: STATUS === 'COMPLETED' (Day-24 ACID Core)
    // ========================================================
    if (status === 'completed') {
      if (!isProvider) {
        return res.status(403).json({ success: false, message: 'Only providers can mark bookings as completed' });
      }

      // MongoDB ACID Session Wallet Payment
      const transaction = await paymentRepository.processWalletPayment({
        bookingId: booking._id,
        providerId: booking.providerId._id,
        payerId: booking.clientId._id,
        payeeId: booking.providerId._id,
        amount: booking.amount,
      });

      appEventEmitter.emit('payment_received', {
        payeeId: booking.providerId._id,
        amount: booking.amount,
        bookingId: booking._id,
      });

      // 🔥 DAY 39: Socket Alert Trigger
      if (req.io) {
        req.io.to(clientTargetId).emit('booking_completed_alert', {
          success: true,
          message: `✅ Aapki booking mukammal ho gayi hai aur payment securely transfer ho chuki hai.`,
          bookingId: booking._id
        });
      }

      // ⚡ DAY 40: Supabase Realtime Event Stream Dispatch (Serverless Node Connection)
      await supabase.channel('live-booking-updates').send({
        type: 'broadcast',
        event: 'booking-completed',
        payload: {
          bookingId: booking._id,
          status: 'completed',
          receiverId: clientTargetId,
          message: `✅ Aapki booking mukammal ho gayi hai aur payment securely transfer ho chuki hai.`
        }
      });
      logger.info(`⚡ [Supabase Pipeline]: Broadcasted 'booking-completed' to Client: ${clientTargetId}`);

      return res.status(200).json({
        success: true,
        message: 'Booking completed and payment transferred securely via wallet.',
        transaction,
      });
    }

    // ========================================================
    // 🔒 SECURE OPTIMISTIC CONCURRENCY CONTROL MIGRATION
    // ========================================================
    const updatedBooking = await bookingRepository.updateStatusSecurely(bookingId, status, clientVersion);

    if (!updatedBooking) {
      return res.status(409).json({
        success: false,
        errorType: 'CONFLICT_ERROR',
        message: 'This booking has already been modified by another action. Please refresh the page.',
      });
    }

    // ========================================================
    // 🔥 DAY 39: HYBRID LOCAL PUSH (SOCKET PIPELINE ROUTING)
    // ========================================================
    if (req.io) {
      if (status === 'accepted') {
        req.io.to(clientTargetId).emit('booking_status_changed', {
          success: true,
          message: `💼 Freelancer ne aapki booking request accept kar li hai!`,
          bookingId: booking._id,
          status: 'accepted'
        });
        logger.info(`🔔 [Socket Pipeline]: Broadcasted 'booking_status_changed' (accepted) to Client Room: ${clientTargetId}`);
      }

      if (status === 'cancelled') {
        appEventEmitter.emit('booking_cancelled', {
          clientId: booking.clientId._id,
          providerId: booking.providerId._id,
          serviceTitle: booking.serviceId?.title || 'Freelance Service Item',
        });

        req.io.to(clientTargetId).emit('booking_status_changed', { success: true, message: `❌ Booking cancel ho chuki hai.`, bookingId: booking._id, status: 'cancelled' });
        req.io.to(providerTargetId).emit('booking_status_changed', { success: true, message: `❌ Booking cancel ho chuki hai.`, bookingId: booking._id, status: 'cancelled' });
        logger.info(`🔔 [Socket Pipeline]: Dynamic dual cancel push executed for Client & Provider.`);
      }
    }

    // ========================================================
    // ⚡ DAY 40: DYNAMIC DECOUPLED DEPLOYMENT MESH (SUPABASE REALTIME)
    // ========================================================

    if (status === 'accepted') {
      await supabase.channel('live-booking-updates').send({
        type: 'broadcast',
        event: 'status-change',
        payload: {
          bookingId: booking._id,
          status: 'accepted',
          receiverId: clientTargetId,
          message: `💼 Freelancer ne aapki booking request accept kar li hai!`
        }
      });
      logger.info(`⚡ [Supabase Pipeline]: Broadcasted 'status-change' (accepted) to Client: ${clientTargetId}`);
    }

    if (status === 'cancelled') {
      // Dono user channels ko broadcast notify karna serverless stack par
      await supabase.channel('live-booking-updates').send({
        type: 'broadcast',
        event: 'status-change',
        payload: {
          bookingId: booking._id,
          status: 'cancelled',
          receiverId: clientTargetId,
          message: `❌ Booking cancel ho chuki hai.`
        }
      });
      
      await supabase.channel('live-booking-updates').send({
        type: 'broadcast',
        event: 'status-change',
        payload: {
          bookingId: booking._id,
          status: 'cancelled',
          receiverId: providerTargetId,
          message: `❌ Booking cancel ho chuki hai.`
        }
      });
      logger.info(`⚡ [Supabase Pipeline]: Dual serverless status cancellation broadcast dispatched.`);
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

