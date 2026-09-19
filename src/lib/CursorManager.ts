import { EventBus, globalEventBus } from './InputManager';

export interface CursorData {
  id: string; // unique identifier for cache
  base64Image?: string; // image data for custom cursors
  cssCursor?: string; // standard CSS cursor if applicable
  hotspotX: number;
  hotspotY: number;
  scale?: number; // for HiDPI scaling support
}

export class CursorManager {
  private cache = new Map<string, string>();
  private currentCursorId: string | null = null;
  private containerElement: HTMLElement | null = null;
  private eventBus: EventBus;
  private isConnected = false;

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus || globalEventBus;
    this.setupListeners();
  }

  public attach(element: HTMLElement) {
    this.containerElement = element;
    this.applyCurrentCursor();
  }

  public detach() {
    if (this.containerElement) {
       this.containerElement.style.cursor = 'auto';
    }
    this.containerElement = null;
  }

  private setupListeners() {
    this.eventBus.on('cursor-update', (data: CursorData) => {
      this.handleCursorUpdate(data);
    });

    this.eventBus.on('stream-reconnected', () => {
      this.isConnected = true;
      this.applyCurrentCursor();
    });

    this.eventBus.on('stream-disconnected', () => {
      this.isConnected = false;
      if (this.containerElement) {
        this.containerElement.style.cursor = 'default';
      }
    });
  }

  public handleCursorUpdate(data: CursorData) {
    if (!this.cache.has(data.id)) {
      if (data.cssCursor) {
        this.cache.set(data.id, data.cssCursor);
      } else if (data.base64Image) {
        // Handle HiDPI by adjusting hotspot according to scale, typically CSS handles it smoothly if image is sized correctly.
        // For custom cursors: url('data:image/png;base64,...') x y, default fallback
        const scale = data.scale || 1;
        const cssStr = `url('data:image/png;base64,${data.base64Image}') ${Math.round(data.hotspotX / scale)} ${Math.round(data.hotspotY / scale)}, auto`;
        this.cache.set(data.id, cssStr);
      } else {
        this.cache.set(data.id, 'default');
      }
    }

    this.currentCursorId = data.id;
    this.applyCurrentCursor();
  }

  private applyCurrentCursor() {
    if (this.containerElement && this.currentCursorId && this.cache.has(this.currentCursorId)) {
      this.containerElement.style.cursor = this.cache.get(this.currentCursorId)!;
    }
  }

  public getCacheSize() {
    return this.cache.size;
  }

  public clearCache() {
    this.cache.clear();
    this.currentCursorId = null;
    if (this.containerElement) {
      this.containerElement.style.cursor = 'default';
    }
  }
}

export const globalCursorManager = new CursorManager(globalEventBus);
