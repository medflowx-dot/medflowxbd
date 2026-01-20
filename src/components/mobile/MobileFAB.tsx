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

      {/* FAB Container */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col-reverse items-end gap-3 md:hidden">
        {/* Action Buttons */}
        {isExpanded && actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={cn(
                "flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-full shadow-lg",
                "bg-card/95 backdrop-blur-lg border border-border/50",
                "animate-in slide-in-from-right-2 fade-in duration-200",
                "active:scale-95 touch-manipulation",
                "hover:shadow-xl transition-shadow"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-sm font-medium text-foreground whitespace-nowrap">
                {action.label}
              </span>
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center shadow-md",
                action.color || "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
              )}>
                <Icon className="h-5 w-5" />
              </div>
            </button>
          );
        })}

        {/* Main FAB Button */}
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
