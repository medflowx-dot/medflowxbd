import { useState, useEffect, useCallback } from 'react';

const NOTIFICATION_SOUND_KEY = 'notification-sound-enabled';

export function useNotificationSettings() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(NOTIFICATION_SOUND_KEY);
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(NOTIFICATION_SOUND_KEY, String(soundEnabled));
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return {
    soundEnabled,
    setSoundEnabled,
    toggleSound,
  };
}
