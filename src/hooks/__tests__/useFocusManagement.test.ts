import { renderHook } from '@testing-library/react';
import { useFocusManagement } from '../useFocusManagement';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useFocusManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true
    });
  });

  it('should call onFocusLoss when window loses focus', () => {
    const onFocusLoss = vi.fn();
    renderHook(() => useFocusManagement({ onFocusLoss }));

    window.dispatchEvent(new Event('blur'));

    expect(onFocusLoss).toHaveBeenCalledTimes(1);
  });

  it('should call onFocusRegain when window regains focus', () => {
    const onFocusRegain = vi.fn();
    renderHook(() => useFocusManagement({ onFocusRegain }));

    // First trigger a blur so that isFocused becomes false
    window.dispatchEvent(new Event('blur'));
    window.dispatchEvent(new Event('focus'));

    expect(onFocusRegain).toHaveBeenCalledTimes(1);
  });

  it('should call onFocusLoss when visibility changes to hidden', () => {
    const onFocusLoss = vi.fn();
    renderHook(() => useFocusManagement({ onFocusLoss }));

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true
    });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(onFocusLoss).toHaveBeenCalledTimes(1);
  });

  it('should call onFocusLoss when pagehide fires', () => {
    const onFocusLoss = vi.fn();
    renderHook(() => useFocusManagement({ onFocusLoss }));

    window.dispatchEvent(new Event('pagehide'));

    expect(onFocusLoss).toHaveBeenCalledTimes(1);
  });

  it('should not emit duplicate events', () => {
    const onFocusLoss = vi.fn();
    const onFocusRegain = vi.fn();
    renderHook(() => useFocusManagement({ onFocusLoss, onFocusRegain }));

    // Blur twice
    window.dispatchEvent(new Event('blur'));
    window.dispatchEvent(new Event('blur'));

    expect(onFocusLoss).toHaveBeenCalledTimes(1);

    // Focus twice
    window.dispatchEvent(new Event('focus'));
    window.dispatchEvent(new Event('focus'));

    expect(onFocusRegain).toHaveBeenCalledTimes(1);
  });
});
