/// <reference types="vite/client" />

// @ts-nocheck to skip lib checks similar to skipLibCheck
// Override problematic Node.js types
declare module 'fs' {
  interface FSWatcher extends NodeJS.EventEmitter {
    ref?(): this;
    unref?(): this;
    close(): void;
  }
}

export {};
