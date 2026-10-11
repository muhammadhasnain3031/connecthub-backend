import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import ServiceCard from './ServiceCard.jsx';

describe('ServiceCard Frontend Unit Tests', () => {

    test('Should correctly render all nested service props in the UI DOM', () => {
        // Variable State Configuration: Mocking the exact prop schema expected by component
        const dummyServiceData = {
            title: 'Full Stack MERN Website Development',
            description: 'Professional high performance optimization and clean architecture code deployment.',
            category: 'Web Development',
            price: 500
        };

        // Execution Phase: Component memory tracking setup
        render(<ServiceCard service={dummyServiceData} />);

        // DOM Queries Extraction Layer (Using Screen Abstraction API)
        const titleElement = screen.getByText('Full Stack MERN Website Development');
        const descriptionElement = screen.getByText('Professional high performance optimization and clean architecture code deployment.');
        const categoryElement = screen.getByText(/Web Development/i); // Using regex case insensitive pattern match
        const priceElement = screen.getByText(/\$500/);

        // Assertion Verification Matrix
        expect(titleElement).toBeInTheDocument(); // Check structural visibility status
        expect(descriptionElement).toBeInTheDocument();
        expect(categoryElement).toBeInTheDocument();
        expect(priceElement).toBeInTheDocument();
    });
});
