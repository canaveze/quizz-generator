import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();
  const isPortuguese = language === 'pt';

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300 bg-background border border-border",
        className
      )}
      onClick={() => setLanguage(isPortuguese ? 'en' : 'pt')}
      role="button"
      tabIndex={0}
    >
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 text-sm",
            isPortuguese 
              ? "transform translate-x-0 bg-primary text-primary-foreground" 
              : "transform translate-x-8 bg-muted text-muted-foreground"
          )}
        >
          {isPortuguese ? "🇧🇷" : "🇺🇸"}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 text-sm",
            isPortuguese 
              ? "bg-transparent text-muted-foreground" 
              : "transform -translate-x-8 bg-primary text-primary-foreground"
          )}
        >
          {isPortuguese ? "🇺🇸" : "🇧🇷"}
        </div>
      </div>
    </div>
  );
}