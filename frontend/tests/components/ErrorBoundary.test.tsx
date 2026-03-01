/**
 * Tests for components/ErrorBoundary.tsx
 * Verifies the error boundary catches rendering errors and displays fallback UI.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// A component that always throws
const ThrowingChild: React.FC = () => {
  throw new Error('Test rendering error');
};

// A component that renders normally
const GoodChild: React.FC = () => <div>Everything is fine</div>;

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress React's noisy error boundary console output during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Everything is fine')).toBeInTheDocument();
  });

  it('renders the fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('displays the error message in diagnostic info', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Test rendering error')).toBeInTheDocument();
  });

  it('shows navigation buttons in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Refresh Application/i)).toBeInTheDocument();
  });

  it('renders reassuring message in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(
      screen.getByText(/don't worry, your data is safe/i),
    ).toBeInTheDocument();
  });
});
