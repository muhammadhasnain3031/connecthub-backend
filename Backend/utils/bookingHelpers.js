// Isko 'Pure Functions' kehte hain kyunki yeh database ya network pe depend nahi karte, bas input lete hain aur output dete hain.

export const calculateFinalAmount = (price, discountPercent = 0, platformFee = 0) => {
    // Edge case checking: Agar values negative hain to unhe 0 handle karein
    const securePrice = price < 0 ? 0 : price;
    const secureDiscount = discountPercent < 0 ? 0 : discountPercent;
    const secureFee = platformFee < 0 ? 0 : platformFee;

    // Discount calculate karne ka logic
    const discountAmount = securePrice * (secureDiscount / 100);
    
    // Final bill formula
    const finalAmount = (securePrice - discountAmount) + secureFee;
    
    return Math.round(finalAmount * 100) / 100; // Decimal values rounding logic
};

export const validateStatusTransition = (currentStatus, nextStatus) => {
    // Isko 'State Machine Validation' pattern kehte hain
    const allowedTransitions = {
        'pending': ['accepted', 'cancelled'],
        'accepted': ['completed', 'cancelled'],
        'completed': [], // Final state, iske baad tabdeeli nahi ho sakti
        'cancelled': []  // Final state
    };

    // Check karo kya currentStatus allowed list mein exist karta hai aur nextStatus usme included hai ya nahi
    const validNextStates = allowedTransitions[currentStatus];
    
    if (!validNextStates) return false;
    
    return validNextStates.includes(nextStatus);
};
