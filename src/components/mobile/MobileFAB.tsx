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
  const sentinelRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

  // Use scroll event on the pull-to-refresh container
  useEffect(() => {
    let scrollContainer: HTMLElement | null = null;
    
    const findScrollContainer = () => {
      // Try to find the pull-to-refresh container
      const container = document.querySelector('[data-pull-to-refresh="true"]') as HTMLElement;
      return container;
    };

    const handleScroll = () => {
      if (!scrollContainer) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
      
      // Hide when at bottom, show when scrolling up or not at bottom
      if (isAtBottom) {
        setIsVisible(false);
      } else if (scrollTop < lastScrollTop.current || scrollTop < 50) {
        setIsVisible(true);
      }
      
      lastScrollTop.current = scrollTop;
    };

    // Delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      scrollContainer = findScrollContainer();
      
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Fallback: Use IntersectionObserver for bottom detection
  useEffect(() => {
    // Create a sentinel element at the bottom of the page
    const createSentinel = () => {
      const existingSentinel = document.getElementById('fab-bottom-sentinel');
      if (existingSentinel) return existingSentinel;
      
      const sentinel = document.createElement('div');
      sentinel.id = 'fab-bottom-sentinel';
      sentinel.style.cssText = 'height: 1px; width: 100%; pointer-events: none;';
      
      // Find the outlet content and append sentinel
      const outlet = document.querySelector('[data-pull-to-refresh="true"] > div');
      if (outlet) {
        outlet.appendChild(sentinel);
      }
      
      return sentinel;
    };

    const timeoutId = setTimeout(() => {
      const sentinel = createSentinel();
      
      if (sentinel) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              // When sentinel is visible (bottom of page reached), hide FAB
              if (entry.isIntersecting) {
                setIsVisible(false);
              } else {
                setIsVisible(true);
              }
            });
          },
          {
            root: document.querySelector('[data-pull-to-refresh="true"]'),
            rootMargin: '0px',
            threshold: 0.1,
          }
        );

        observer.observe(sentinel);

        return () => {
          observer.disconnect();
          sentinel.remove();
        };
      }
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      const sentinel = document.getElementById('fab-bottom-sentinel');
      if (sentinel) sentinel.remove();
    };
  }, []);

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
        <div className="fixed bottom-36 right-4 z-50 md:hidden animate-in slide-in-from-bottom-4 fade-in duration-150">
          <div className="flex flex-col gap-3">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className={cn(
                    "flex items-center gap-3 pr-4 pl-2 py-2 rounded-full",
                    "bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg",
                    "active:scale-95 touch-manipulation",
                    "hover:bg-card transition-colors duration-100"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shadow-md",
                    action.color || "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
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
          "fixed bottom-20 right-4 z-50 md:hidden",
          "transition-all duration-300 ease-out",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
        )}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "h-14 w-14 rounded-full flex items-center justify-center",
            "transition-all duration-150 ease-out",
            "active:scale-95 touch-manipulation",
            isExpanded 
              ? "bg-destructive rotate-45 shadow-lg shadow-destructive/30" 
              : "fab-gradient"
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
