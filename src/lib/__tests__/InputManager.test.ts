import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InputManager, EventBus } from '../InputManager';

describe('InputManager', () => {
  let eventBus: EventBus;
  let inputManager: InputManager;

  beforeEach(() => {
    eventBus = new EventBus();
    inputManager = new InputManager(eventBus);
  });

  it('should capture inputs initially', () => {
    expect(inputManager.isInputCapturing()).toBe(true);
    inputManager.simulateKeyDown('a');
    expect(inputManager.getPressedKeys()).toContain('a');
  });

  it('should clear inputs, reset modifiers, and notify backend on focus loss', () => {
    const emitSpy = vi.spyOn(eventBus, 'emit');
    
    inputManager.simulateKeyDown('Shift');
    inputManager.simulateMouseDown(0);
    // @ts-expect-error test
    inputManager.inputQueue.push({ type: 'mousemove' });

    inputManager.handleFocusLoss();

    expect(inputManager.isInputCapturing()).toBe(false);
    expect(inputManager.getPressedKeys()).toHaveLength(0);
    expect(inputManager.getPressedMouseButtons()).toHaveLength(0);
    // @ts-expect-error test
    expect(inputManager.modifiers).toEqual({ ctrl: false, shift: false, alt: false, meta: false });
    expect(inputManager.getPendingQueueSize()).toBe(0);
    
    expect(emitSpy).toHaveBeenCalledWith('input-reset', { reason: 'focus-loss' });
  });

  it('should resume capture and restore pointer lock on focus regain', () => {
    const emitSpy = vi.spyOn(eventBus, 'emit');
    
    inputManager.setPointerLocked(true);
    inputManager.handleFocusLoss();
    expect(inputManager.isInputCapturing()).toBe(false);

    inputManager.handleFocusRegain();
    expect(inputManager.isInputCapturing()).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith('pointer-lock-restore');
  });
});
