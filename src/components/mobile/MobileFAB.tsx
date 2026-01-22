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
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      
      ticking.current = true;
      
      requestAnimationFrame(() => {
        // Find the scroll container
        const scrollContainer = document.querySelector('[data-pull-to-refresh]') as HTMLElement;
        
        if (scrollContainer) {
          const currentScrollY = scrollContainer.scrollTop;
          const scrollHeight = scrollContainer.scrollHeight;
          const clientHeight = scrollContainer.clientHeight;
          
          // Check if near bottom (within 100px of bottom)
          const isNearBottom = scrollHeight - currentScrollY - clientHeight < 100;
          
          if (isNearBottom && currentScrollY > 50) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
          
          lastScrollY.current = currentScrollY;
        }
        
        ticking.current = false;
      });
    };

    // Attach to the scroll container
    const scrollContainer = document.querySelector('[data-pull-to-refresh]');
    
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Also listen to window scroll as fallback
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
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
