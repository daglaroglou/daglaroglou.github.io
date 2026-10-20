import { useCallback, useSyncExternalStore } from 'react';

let globalIsMuted = typeof window !== 'undefined' ? localStorage.getItem('soundMuted') === 'true' : false;
const listeners = new Set<() => void>();

const setGlobalMuted = (muted: boolean) => {
  globalIsMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('soundMuted', muted.toString());
  }
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => globalIsMuted;
const getServerSnapshot = () => false;

export const useSound = () => {
  const isMuted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleMute = useCallback(() => {
    setGlobalMuted(!globalIsMuted);
  }, []);

  const playClick = useCallback(() => {
    if (globalIsMuted) return;
    const audio = new Audio('/click.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.error("Error playing sound:", e));
  }, []);

  const playToggle = useCallback(() => {
    playClick();
  }, [playClick]);

  return { playClick, playToggle, isMuted, toggleMute };
};
