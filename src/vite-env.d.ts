/// <reference types="vite/client" />

declare const __BUILD_INFO__: {
  commitShort: string;
  commitFull: string;
  builtAt: string;
  repository: string;
};

// View Transitions API types
interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
}

interface Document {
  startViewTransition?(callback: () => void | Promise<void>): ViewTransition;
}
