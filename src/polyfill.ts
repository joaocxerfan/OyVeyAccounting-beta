// Fix for "Cannot set property fetch of #<Window> which has only a getter"
// This happens when libraries like formdata-polyfill (used by node-fetch in @google/genai)
// try to monkey-patch window.fetch in environments where it is read-only.
if (typeof window !== 'undefined') {
  // 1. Try to make fetch writable if it's configurable
  try {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (descriptor && !descriptor.writable && !descriptor.set && descriptor.configurable) {
      const nativeFetch = window.fetch;
      Object.defineProperty(window, 'fetch', {
        value: nativeFetch,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
  } catch (e) {
    console.warn('Failed to make window.fetch writable:', e);
  }

  // 2. Prevent formdata-polyfill from running by satisfying its "is supported" check.
  // The polyfill runs if (typeof FormData === 'undefined' || !FormData.prototype.keys)
  try {
    if (typeof (window as any).FormData === 'undefined') {
      (window as any).FormData = class FormData {
        append() {}
        delete() {}
        get() { return null; }
        getAll() { return []; }
        has() { return false; }
        set() {}
        *keys() {}
        *values() {}
        *entries() {}
        [Symbol.iterator]() { return this.entries(); }
      };
    } else if (!(window as any).FormData.prototype.keys) {
      (window as any).FormData.prototype.keys = function* () {};
      (window as any).FormData.prototype.values = function* () {};
      (window as any).FormData.prototype.entries = function* () {};
      (window as any).FormData.prototype[Symbol.iterator] = function() { return this.entries(); };
    }
  } catch (e) {
    console.warn('Failed to polyfill FormData keys:', e);
  }
}
