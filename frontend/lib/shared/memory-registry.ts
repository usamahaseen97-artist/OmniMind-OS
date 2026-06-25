/** Registry for timers, listeners, and observers — enables leak-safe cleanup on unmount. */

type CleanupFn = () => void;

export class DisposableRegistry {
  private cleanups = new Set<CleanupFn>();

  register(fn: CleanupFn) {
    this.cleanups.add(fn);
    return () => this.cleanups.delete(fn);
  }

  setInterval(fn: () => void, ms: number) {
    const id = window.setInterval(fn, ms);
    const unregister = this.register(() => window.clearInterval(id));
    return { id, unregister };
  }

  setTimeout(fn: () => void, ms: number) {
    const id = window.setTimeout(() => {
      fn();
      this.cleanups.delete(clear);
    }, ms);
    const clear = () => window.clearTimeout(id);
    this.register(clear);
    return { id, unregister: clear };
  }

  addEventListener<K extends keyof WindowEventMap>(
    target: EventTarget,
    type: K,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions,
  ) {
    target.addEventListener(type, listener, options);
    return this.register(() => target.removeEventListener(type, listener, options));
  }

  dispose() {
    this.cleanups.forEach((fn) => {
      try {
        fn();
      } catch {
        /* ignore cleanup errors */
      }
    });
    this.cleanups.clear();
  }
}

/** React hook helper — dispose all registered cleanups on unmount. */
export function createScopedRegistry() {
  const registry = new DisposableRegistry();
  return registry;
}
