import mongoose from 'mongoose';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Booking from '../models/Booking.js';

class PaymentRepository {
  async processWalletPayment({ bookingId, payerId, payeeId, amount }) {
    // 1. Session Start karein
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 2. Payer (Client) ka wallet fetch aur update karein (Session block ke andar)
      const payerWallet = await Wallet.findOne({ userId: payerId }).session(session);
      if (!payerWallet || payerWallet.balance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      // Deduct balance
      payerWallet.balance -= amount;
      await payerWallet.save({ session });

      // 3. Payee (Provider) ka wallet fetch aur update karein
      let payeeWallet = await Wallet.findOne({ userId: payeeId }).session(session);
      if (!payeeWallet) {
        // Agar wallet nahi bana hua to dynamically create karein
        payeeWallet = new Wallet({ userId: payeeId, balance: 0 });
      }
      payeeWallet.balance += amount;
      await payeeWallet.save({ session });

      // 4. Transaction log produce karein
      const transaction = new Transaction({
        bookingId,
        payerId,
        payeeId,
        amount,
        type: 'payment',
        status: 'success',
        gateway: 'wallet',
      });
      await transaction.save({ session });

      // 5. Booking status update karein ko automatically secure safe state me bhej de
      await Booking.findByIdAndUpdate(bookingId, { status: 'completed' }, { session });

      // Agar sab theek rha to Commit changes
      await session.commitTransaction();
      session.endSession();

      return transaction;
    } catch (error) {
      // Kisi aik step me error aya to Rollback everything!
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}

export default new PaymentRepository();
