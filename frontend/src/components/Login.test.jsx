import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Login from '../pages/Login.jsx'
// 1. GLOBAL MODULE MOCKING HOOKS INTERCEPTIONS
// React Redux aur React Router Dom dependencies hooks validation matrix control mock
const mockNavigate = vi.fn();
const mockDispatch = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

vi.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (callback) => callback({
        auth: { loading: false, error: null } // Base tracking initial mock state
    })
}));

describe('Login Frontend Integration Component Unit Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks(); // Har test boundary trigger se pehle functions call record counts zero clean wash out
    });

    test('Should capture keystroke simulations and fire redux actions dispatch parameters on submission', async () => {
        // Setup mock handling unwrap execution patterns chaining simulator configuration
        const mockUnwrap = vi.fn().mockImplementation(() => Promise.resolve());
        mockDispatch.mockReturnValue({ unwrap: mockUnwrap });

        // Execution Render Trigger
        render(<Login />);

        // DOM Input Query Extractions Layer
        const emailInput = screen.getByLabelText(/Email ID:/i);
        const passwordInput = screen.getByLabelText(/Password:/i);
        const submitButton = screen.getByRole('button', { name: /Login/i });

        // User Typing Event Simulation Sequence Layer
        await userEvent.type(emailInput, 'hasnain@example.com');
        await userEvent.type(passwordInput, 'SecretCode3031');

        // Verify Variable Internal Input States Tracking Update Changes
        expect(emailInput.value).toBe('hasnain@example.com');
        expect(passwordInput.value).toBe('SecretCode3031');

        // Action Trigger Phase: Submit form action simulator
        await userEvent.click(submitButton);

        // Verification Matrix Assertions Chain
        expect(mockDispatch).toHaveBeenCalledTimes(1); // Ensure redux intercept layer trigger exact once
    });
});
