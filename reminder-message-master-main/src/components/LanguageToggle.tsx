
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center space-x-2"
    >
      <span>{language === 'en' ? '🇬🇧' : '🇷🇼'}</span>
      <span className="hidden sm:inline">
        {language === 'en' ? 'English' : 'Kinyarwanda'}
      </span>
    </Button>
  );
};

export default LanguageToggle;
