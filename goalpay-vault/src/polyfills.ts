// Polyfills for Node.js modules in browser environment
import { Buffer } from 'buffer';

// Make Buffer available globally
if (typeof window !== 'undefined') {
  window.global = window.global || window;
  window.Buffer = window.Buffer || Buffer;
  (window as any).process = (window as any).process || { env: {} };
}

export {};
