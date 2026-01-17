import { useState, useEffect, useCallback } from 'react';

const NOTIFICATION_SOUND_KEY = 'notification-sound-enabled';

function getStoredSoundSetting(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const stored = localStorage.getItem(NOTIFICATION_SOUND_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

export function useNotificationSettings() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setSoundEnabled(getStoredSoundSetting());
    setIsInitialized(true);
  }, []);

  // Save to localStorage when changed (after initialization)
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(NOTIFICATION_SOUND_KEY, String(soundEnabled));
      } catch {
        // localStorage might not be available
      }
    }
  }, [soundEnabled, isInitialized]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return {
    soundEnabled,
    setSoundEnabled,
    toggleSound,
  };
}
