import { useState, useEffect, useRef } from 'react';
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
  const lastScrollTop = useRef(0);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;
      const isAtBottom = maxScroll > 0 && (maxScroll - scrollTop) < 50;
      
      if (isAtBottom) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollTop.current = scrollTop;
    };

    // Find scroll container after a short delay
    const initScrollListener = () => {
      const container = document.querySelector('[data-pull-to-refresh="true"]') as HTMLElement;
      
      if (container) {
        scrollContainerRef.current = container;
        container.addEventListener('scroll', handleScroll, { passive: true });
        // Initial check
        handleScroll();
      }
    };

    // Try immediately and also after a delay
    initScrollListener();
    const timeoutId = setTimeout(initScrollListener, 500);

    return () => {
      clearTimeout(timeoutId);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', handleScroll);
      }
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
          "fixed bottom-28 right-4 z-50 md:hidden",
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
