/**
 * Tests for contexts/CartContext.tsx
 * Verifies add, remove, update, clear, count, and subtotal logic.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { CartProvider, useCart } from '../../contexts/CartContext';
import type { Medicine } from '../../types';

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

// Factory for a minimal Medicine fixture
const makeMedicine = (overrides: Partial<Medicine> = {}): Medicine => ({
  id: 'med-1',
  name: 'Prenatal Vitamins',
  price: 250,
  category: 'Vitamins',
  image: '/img.jpg',
  ...overrides,
});

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with an empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.cartCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('adds an item to the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeMedicine()));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Prenatal Vitamins');
    expect(result.current.items[0].quantity).toBe(1);
  });

  it('increments quantity when adding the same item again', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const med = makeMedicine();

    act(() => {
      result.current.addItem(med);
      result.current.addItem(med);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('calculates cartCount as total quantity across items', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(makeMedicine({ id: 'a', price: 100 }));
      result.current.addItem(makeMedicine({ id: 'a', price: 100 }));
      result.current.addItem(makeMedicine({ id: 'b', price: 200 }));
    });

    expect(result.current.cartCount).toBe(3); // 2 + 1
  });

  it('calculates subtotal correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(makeMedicine({ id: 'a', price: 100 }));
      result.current.addItem(makeMedicine({ id: 'a', price: 100 })); // qty 2
      result.current.addItem(makeMedicine({ id: 'b', price: 300 }));
    });

    // 100*2 + 300*1 = 500
    expect(result.current.subtotal).toBe(500);
  });

  it('removes an item by id', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(makeMedicine({ id: 'a' }));
      result.current.addItem(makeMedicine({ id: 'b' }));
    });
    expect(result.current.items).toHaveLength(2);

    act(() => result.current.removeItem('a'));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('b');
  });

  it('updates quantity for an item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeMedicine({ id: 'a', price: 50 })));
    act(() => result.current.updateQty('a', 5));

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.subtotal).toBe(250);
  });

  it('removes item when updateQty is called with qty < 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeMedicine({ id: 'a' })));
    act(() => result.current.updateQty('a', 0));

    expect(result.current.items).toHaveLength(0);
  });

  it('clears the entire cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(makeMedicine({ id: 'a' }));
      result.current.addItem(makeMedicine({ id: 'b' }));
    });

    act(() => result.current.clearCart());
    expect(result.current.items).toHaveLength(0);
    expect(result.current.cartCount).toBe(0);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(makeMedicine({ id: 'x', name: 'Folic Acid' })));

    const stored = JSON.parse(localStorage.getItem('ng_cart_items') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Folic Acid');
  });

  it('restores from localStorage on mount', () => {
    localStorage.setItem(
      'ng_cart_items',
      JSON.stringify([{ ...makeMedicine({ id: 'saved' }), quantity: 3 }]),
    );

    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
  });
});
