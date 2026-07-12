import { useCallback, useState, useEffect } from 'react';

let globalIsMuted = typeof window !== 'undefined' ? localStorage.getItem('soundMuted') === 'true' : false;
const listeners = new Set<(muted: boolean) => void>();

const setGlobalMuted = (muted: boolean) => {
  globalIsMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('soundMuted', muted.toString());
  }
  listeners.forEach(listener => listener(muted));
};

export const useSound = () => {
  const [isMuted, setIsMuted] = useState(globalIsMuted);

  useEffect(() => {
    setIsMuted(globalIsMuted);
    listeners.add(setIsMuted);
    return () => {
      listeners.delete(setIsMuted);
    };
  }, []);

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
