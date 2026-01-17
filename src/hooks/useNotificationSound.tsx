import { useEffect, useRef, useCallback } from 'react';
import { useNotificationSettings } from './useNotificationSettings';

export function useNotificationSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastNotificationCount = useRef<number>(0);
  const hasPlayedInitial = useRef<boolean>(false);
  const { soundEnabled } = useNotificationSettings();

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      // Create audio context on demand (required for browsers)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create oscillator for notification sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Pleasant notification tone (two-tone chime)
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
      
      oscillator.type = 'sine';

      // Gentle volume envelope
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.15);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, [soundEnabled]);

  const checkAndPlaySound = useCallback((currentCount: number) => {
    // Skip initial load to avoid sound on page load
    if (!hasPlayedInitial.current) {
      hasPlayedInitial.current = true;
      lastNotificationCount.current = currentCount;
      return;
    }

    // Play sound only when count increases
    if (currentCount > lastNotificationCount.current) {
      playNotificationSound();
    }

    lastNotificationCount.current = currentCount;
  }, [playNotificationSound]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playNotificationSound,
    checkAndPlaySound,
  };
}
