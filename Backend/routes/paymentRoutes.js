import express from 'express';
import Stripe from 'stripe';
// Note: Apne exact models ke path ke mutabiq in imports ko update kar lena
import Booking  from '../models/Booking.js'; 
import Transaction  from '../models/Transaction.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- 1. CREATE CHECKOUT SESSION ENDPOINT ---
router.post('/create-checkout-session', express.json(), async (req, res) => {
    try {
        const { bookingId, amount, serviceTitle } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({ success: false, message: "Booking ID and Amount are required" });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: serviceTitle || "ConnectHub Service Booking",
                        },
                        unit_amount: amount * 100, // Cents me convert kiya
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
            metadata: {
                bookingId: bookingId, // ID ko save rakha state preservation ke liye
            },
        });

        res.status(200).json({ success: true, url: session.url });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- 2. STRIPE WEBHOOK ENDPOINT (CRITICAL PATH) ---
// express.raw() zaroori hai taake signature validation sahi se ho sakay
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Stripe SDK request payload aur signature ko verify karega
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`❌ Webhook Signature Verification Failed:`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Event handle karne ka logic
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const bookingId = session.metadata.bookingId;
        const totalAmount = session.amount_total / 100; // Cents ko wapas standard amount me badla

        try {
            console.log(`⏳ Processing database updates for Booking ID: ${bookingId}`);

            // A. Update Booking Status (State Machine Change)
            const updatedBooking = await Booking.findByIdAndUpdate(
                bookingId,
                { status: 'accepted' }, // Ya 'paid' jo bhi aapka schema standard ho
                { new: true }
            );

            if (updatedBooking) {
                // B. Create Transaction Log for Audit Trail
                await Transaction.create({
                    bookingId: bookingId,
                    payerId: updatedBooking.clientId,
                    payeeId: updatedBooking.providerId,
                    amount: totalAmount,
                    type: 'credit',
                    status: 'completed',
                    gateway: 'stripe'
                });
                
                console.log(`✅ Database successfully updated via Stripe Webhook!`);
            }
        } catch (dbError) {
            console.error(`❌ Database Update Error inside Webhook:`, dbError);
            // 500 status bhej sakte hain taake Stripe retry kare
            return res.status(500).json({ received: false, error: dbError.message });
        }
    }

    // Stripe ko batana zaroori hai ke event safely receive ho gaya hai
    res.json({ received: true });
});

export default router;
