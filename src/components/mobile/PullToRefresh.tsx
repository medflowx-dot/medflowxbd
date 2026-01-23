import { useState, useRef, useCallback, ReactNode } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  threshold?: number;
  pullText?: string;
  releaseText?: string;
  refreshingText?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  pullText = 'টানুন রিফ্রেশ করতে',
  releaseText = 'ছেড়ে দিন',
  refreshingText = 'রিফ্রেশ হচ্ছে...',
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);
    
    // Apply resistance - diminishing returns as you pull further
    const resistedDistance = Math.min(distance * 0.5, threshold * 1.5);
    setPullDistance(resistedDistance);
    
    // Prevent default scroll when pulling down from top
    if (distance > 0 && containerRef.current?.scrollTop === 0) {
      e.preventDefault();
    }
  }, [isPulling, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || isRefreshing) return;
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold * 0.6); // Keep indicator visible
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    
    setIsPulling(false);
    startY.current = 0;
    currentY.current = 0;
  }, [isPulling, isRefreshing, pullDistance, threshold, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldRelease = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      data-pull-to-refresh="true"
      className={cn("relative overflow-visible", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-0 right-0 flex flex-col items-center justify-center transition-all duration-200 z-10 pointer-events-none",
          (pullDistance > 0 || isRefreshing) ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? threshold * 0.6 : 0)}px`,
          top: 0,
        }}
      >
        <div className={cn(
          "flex flex-col items-center gap-1 transition-transform duration-200",
          shouldRelease && !isRefreshing ? "scale-110" : "scale-100"
        )}>
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <ArrowDown 
              className={cn(
                "h-5 w-5 text-primary transition-transform duration-200",
                shouldRelease ? "rotate-180" : ""
              )}
              style={{
                transform: `rotate(${progress * 180}deg)`,
              }}
            />
          )}
          <span className="text-[10px] text-muted-foreground font-medium">
            {isRefreshing ? refreshingText : shouldRelease ? releaseText : pullText}
          </span>
        </div>
      </div>

      {/* Content with transform */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance > 0 || isRefreshing ? Math.max(pullDistance, isRefreshing ? threshold * 0.6 : 0) : 0}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
