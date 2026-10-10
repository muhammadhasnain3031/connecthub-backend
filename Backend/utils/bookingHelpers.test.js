import { calculateFinalAmount, validateStatusTransition } from './bookingHelpers.js';

// 'describe' block pure test suite ko group karne ke liye use hota hai
describe('Booking Helpers - Unit Tests', () => {

    // 1. Tests for calculateFinalAmount
    describe('calculateFinalAmount Routine', () => {
        
        test('Should correctly calculate amount with discount and fee', () => {
            // Price = 1000, 10% discount = 100 (Remaining = 900), Fee = 50 -> Total = 950
            const result = calculateFinalAmount(1000, 10, 50);
            expect(result).toBe(950); // 'expect' aur 'toBe' ko Unit Assertion kehte hain
        });

        test('Should handle 0% discount correctly', () => {
            const result = calculateFinalAmount(500, 0, 20);
            expect(result).toBe(520);
        });

        test('Should return 0 or correct boundary amounts if negative values are passed', () => {
            const result = calculateFinalAmount(-100, -5, 10);
            expect(result).toBe(10); // Price 0 ho jayegi, discount 0, sirf fee add hogi
        });
    });

    // 2. Tests for validateStatusTransition
    describe('validateStatusTransition Routine', () => {

        test('Should allow transition from pending to accepted', () => {
            const isValid = validateStatusTransition('pending', 'accepted');
            expect(isValid).toBe(true);
        });

        test('Should allow transition from pending to cancelled', () => {
            const isValid = validateStatusTransition('pending', 'cancelled');
            expect(isValid).toBe(true);
        });

        test('Should NOT allow direct transition from pending to completed', () => {
            const isValid = validateStatusTransition('pending', 'completed');
            expect(isValid).toBe(false); // Yeh test ensure karega ke flow break na ho
        });

        test('Should NOT allow transition once booking is already completed', () => {
            const isValid = validateStatusTransition('completed', 'cancelled');
            expect(isValid).toBe(false);
        });
    });
});
