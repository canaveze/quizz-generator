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
  return;
}