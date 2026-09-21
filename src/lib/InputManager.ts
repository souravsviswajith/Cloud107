// Simulated Event Bus for frontend-backend communication
export class EventBus {
  private listeners: Record<string, ((data: unknown) => void)[]> = {};

  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event: string, data?: unknown) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(data));
    }
  }
}

export const globalEventBus = new EventBus();

export class InputManager {
  private pressedKeys = new Set<string>();
  private pressedMouseButtons = new Set<number>();
  private modifiers = { ctrl: false, shift: false, alt: false, meta: false };
  private inputQueue: unknown[] = [];
  private isCapturing = true;
  private pointerLocked = false;
  private eventBus: EventBus;

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus || globalEventBus;
  }

  public setPointerLocked(locked: boolean) {
    this.pointerLocked = locked;
  }

  public simulateKeyDown(key: string) {
    if (!this.isCapturing) return;
    this.pressedKeys.add(key);
  }

  public simulateMouseDown(button: number) {
    if (!this.isCapturing) return;
    this.pressedMouseButtons.add(button);
  }

  public getPressedKeys() {
    return Array.from(this.pressedKeys);
  }

  public getPressedMouseButtons() {
    return Array.from(this.pressedMouseButtons);
  }

  public getPendingQueueSize() {
    return this.inputQueue.length;
  }

  public handleFocusLoss() {
    this.isCapturing = false;

    // Release all pressed keyboard keys
    this.pressedKeys.clear();

    // Release all pressed mouse buttons
    this.pressedMouseButtons.clear();

    // Reset modifier key state
    this.modifiers = { ctrl: false, shift: false, alt: false, meta: false };

    // Clear pending input queues
    this.inputQueue = [];

    // Notify the backend if an input-reset message exists
    this.eventBus.emit('input-reset', { reason: 'focus-loss' });
    console.log(
      '[InputManager] Focus lost: Released inputs, reset modifiers, cleared queues, notified backend.',
    );
  }

  public handleFocusRegain() {
    // Resume input capture
    this.isCapturing = true;
    console.log('[InputManager] Focus regained: Resumed input capture.');

    // Restore pointer lock if used
    if (this.pointerLocked) {
      console.log('[InputManager] Restoring pointer lock...');
      // Logic to actually requestPointerLock on the canvas would go here
      this.eventBus.emit('pointer-lock-restore');
    }
  }

  public isInputCapturing() {
    return this.isCapturing;
  }
}

export const globalInputManager = new InputManager(globalEventBus);
