import { describe, it, expect, beforeEach } from 'vitest';
import { CursorManager } from '../CursorManager';
import { EventBus } from '../InputManager';

describe('CursorManager', () => {
  let eventBus: EventBus;
  let cursorManager: CursorManager;
  let mockContainer: HTMLElement;

  beforeEach(() => {
    eventBus = new EventBus();
    cursorManager = new CursorManager(eventBus);
    mockContainer = document.createElement('div');
  });

  it('should initialize empty cache and handle css cursor update', () => {
    cursorManager.attach(mockContainer);
    
    eventBus.emit('cursor-update', {
      id: 'text-cursor',
      cssCursor: 'text',
      hotspotX: 0,
      hotspotY: 0
    });

    expect(mockContainer.style.cursor).toBe('text');
    expect(cursorManager.getCacheSize()).toBe(1);
  });

  it('should handle custom image cursor and correctly format CSS url', () => {
    cursorManager.attach(mockContainer);
    
    eventBus.emit('cursor-update', {
      id: 'custom-id',
      base64Image: 'abcd',
      hotspotX: 10,
      hotspotY: 15
    });

    // Check that it formats the CSS url correctly with hotspots
    expect(mockContainer.style.cursor).toMatch(/url\(['"]data:image\/png;base64,abcd['"]\) 10 15, auto/);
  });

  it('should cache cursors and not recreate the CSS string if already cached', () => {
    cursorManager.attach(mockContainer);
    
    eventBus.emit('cursor-update', {
      id: 'custom-id',
      base64Image: 'abcd',
      hotspotX: 10,
      hotspotY: 15
    });

    const initialSize = cursorManager.getCacheSize();
    
    // Fire the same cursor again
    eventBus.emit('cursor-update', {
      id: 'custom-id',
      base64Image: 'abcd',
      hotspotX: 10,
      hotspotY: 15
    });

    expect(cursorManager.getCacheSize()).toBe(initialSize); // Cache size should not increase
  });

  it('should clear cursor style on stream disconnect', () => {
    cursorManager.attach(mockContainer);
    
    eventBus.emit('cursor-update', {
      id: 'custom-id',
      cssCursor: 'pointer',
      hotspotX: 0,
      hotspotY: 0
    });
    
    expect(mockContainer.style.cursor).toBe('pointer');

    eventBus.emit('stream-disconnected');
    expect(mockContainer.style.cursor).toBe('default');
  });

  it('should reapply the current cursor on stream reconnect', () => {
    cursorManager.attach(mockContainer);
    
    eventBus.emit('cursor-update', {
      id: 'custom-id',
      cssCursor: 'wait',
      hotspotX: 0,
      hotspotY: 0
    });

    eventBus.emit('stream-disconnected');
    eventBus.emit('stream-reconnected');
    
    expect(mockContainer.style.cursor).toBe('wait');
  });
});
