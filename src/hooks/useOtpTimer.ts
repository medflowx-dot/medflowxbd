import { useState, useEffect, useCallback } from 'react';

interface UseOtpTimerOptions {
  otpExpirySeconds?: number;  // OTP validity duration (default: 5 minutes)
  resendCooldownSeconds?: number;  // Cooldown before resend is allowed (default: 60 seconds)
}

interface UseOtpTimerReturn {
  otpTimeRemaining: number;
  resendTimeRemaining: number;
  isOtpExpired: boolean;
  canResend: boolean;
  startTimers: () => void;
  resetTimers: () => void;
  formatTime: (seconds: number) => string;
}

export function useOtpTimer(options: UseOtpTimerOptions = {}): UseOtpTimerReturn {
  const {
    otpExpirySeconds = 5 * 60,  // 5 minutes
    resendCooldownSeconds = 60,  // 60 seconds
  } = options;

  const [otpTimeRemaining, setOtpTimeRemaining] = useState(otpExpirySeconds);
  const [resendTimeRemaining, setResendTimeRemaining] = useState(resendCooldownSeconds);
  const [isRunning, setIsRunning] = useState(false);

  // Start both timers
  const startTimers = useCallback(() => {
    setOtpTimeRemaining(otpExpirySeconds);
    setResendTimeRemaining(resendCooldownSeconds);
    setIsRunning(true);
  }, [otpExpirySeconds, resendCooldownSeconds]);

  // Reset timers (for resend)
  const resetTimers = useCallback(() => {
    setOtpTimeRemaining(otpExpirySeconds);
    setResendTimeRemaining(resendCooldownSeconds);
  }, [otpExpirySeconds, resendCooldownSeconds]);

  // Timer effect
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setOtpTimeRemaining(prev => Math.max(0, prev - 1));
      setResendTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Format seconds to MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    otpTimeRemaining,
    resendTimeRemaining,
    isOtpExpired: otpTimeRemaining <= 0,
    canResend: resendTimeRemaining <= 0,
    startTimers,
    resetTimers,
    formatTime,
  };
}
