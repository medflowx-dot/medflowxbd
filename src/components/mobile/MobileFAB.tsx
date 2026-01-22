import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  color?: string;
}

interface MobileFABProps {
  actions: FABAction[];
}

export function MobileFAB({ actions }: MobileFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkScrollPosition = useCallback(() => {
    // Find the scroll container
    const container = document.querySelector('[data-pull-to-refresh="true"]') as HTMLElement;
    
    if (!container) {
      setIsVisible(true);
      return;
    }
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const maxScroll = scrollHeight - clientHeight;
    
    // Only hide if there's actually scrollable content and we're near the bottom
    if (maxScroll > 100) {
      const isNearBottom = (maxScroll - scrollTop) < 80;
      setIsVisible(!isNearBottom);
    } else {
      // Not enough content to scroll, always show FAB
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    // Check scroll position periodically for reliability
    const startChecking = () => {
      // Initial check
      checkScrollPosition();
      
      // Set up scroll listener
      const container = document.querySelector('[data-pull-to-refresh="true"]');
      if (container) {
        container.addEventListener('scroll', checkScrollPosition, { passive: true });
      }
      
      // Also check periodically as backup (every 500ms)
      checkIntervalRef.current = setInterval(checkScrollPosition, 500);
    };

    // Delay start to ensure DOM is ready
    const timeoutId = setTimeout(startChecking, 300);

    return () => {
      clearTimeout(timeoutId);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      const container = document.querySelector('[data-pull-to-refresh="true"]');
      if (container) {
        container.removeEventListener('scroll', checkScrollPosition);
      }
    };
  }, [checkScrollPosition]);

  // Re-check when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      // Reset visibility and recheck after route change
      setIsVisible(true);
      setTimeout(checkScrollPosition, 100);
    };

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [checkScrollPosition]);

  const handleActionClick = (action: FABAction) => {
    setIsExpanded(false);
    action.onClick();
  };

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-100"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Vertical Actions Menu - slides up from FAB */}
      {isExpanded && (
        <div className="fixed bottom-40 right-4 z-[60] md:hidden">
          <div className="flex flex-col gap-3">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className={cn(
                    "flex items-center gap-3 pr-4 pl-2 py-2 rounded-full",
                    "bg-card border border-border shadow-xl",
                    "active:scale-95 touch-manipulation",
                    "transition-all duration-150",
                    "fab-menu-item"
                  )}
                  style={{
                    animationDelay: `${(actions.length - 1 - index) * 60}ms`
                  }}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shadow-md",
                    action.color || "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap pr-2">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main FAB Button */}
      <div 
        className={cn(
          "fixed bottom-28 right-4 z-50 md:hidden",
          isVisible 
            ? "fab-bounce-in" 
            : "fab-bounce-out pointer-events-none"
        )}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "h-14 w-14 rounded-full flex items-center justify-center",
            "transition-all duration-150 ease-out",
            "active:scale-95 touch-manipulation shadow-lg",
            isExpanded 
              ? "bg-destructive rotate-45 shadow-destructive/30" 
              : "fab-gradient shadow-primary/30"
          )}
        >
          {isExpanded ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Plus className="h-6 w-6 text-white" />
          )}
        </button>
      </div>
    </>
  );
}
