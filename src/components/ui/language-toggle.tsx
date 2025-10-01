import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
interface LanguageToggleProps {
  className?: string;
}
export function LanguageToggle({
  className
}: LanguageToggleProps) {
  const {
    language,
    setLanguage
  } = useLanguage();
  const isPortuguese = language === 'pt';
  
  return (
    <div className={cn("flex items-center gap-2 p-1 bg-muted/30 rounded-lg", className)}>
      <button
        onClick={() => setLanguage('pt')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          isPortuguese
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        🇧🇷
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          !isPortuguese
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        🇺🇸
      </button>
    </div>
  );
}