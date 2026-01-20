import { useState } from 'react';
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

  const handleActionClick = (action: FABAction) => {
    setIsExpanded(false);
    action.onClick();
  };

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Grid Menu Panel */}
      {isExpanded && (
        <div className="fixed bottom-36 right-4 left-4 z-50 md:hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-4">
            <div className="grid grid-cols-2 gap-3">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl",
                      "bg-background/50 border border-border/30",
                      "animate-in zoom-in-95 fade-in duration-200",
                      "active:scale-95 touch-manipulation",
                      "hover:bg-background/80 transition-colors"
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center shadow-md",
                      action.color || "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-medium text-foreground text-center leading-tight">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main FAB Button */}
      <div className="fixed bottom-20 right-4 z-50 md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "h-14 w-14 rounded-full flex items-center justify-center",
            "transition-all duration-300 ease-out",
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
