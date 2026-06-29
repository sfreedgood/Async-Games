import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// Provide browser polyfills that jsdom doesn't define by default.
if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
}

if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}
