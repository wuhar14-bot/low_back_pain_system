import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languages = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-HK', name: '繁體中文', flag: '🇭🇰' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
];

export default function LanguageSwitcher({ variant = "default" }) {
  const { i18n } = useTranslation();

  const getCurrentLang = () => {
    const currentCode = i18n.language;
    // Handle language codes like 'zh-CN', 'zh-HK', 'zh', 'en-US', etc.
    const lang = languages.find(l => l.code === currentCode);
    if (lang) return lang;

    // Fallback for partial matches (e.g., 'zh' -> 'zh-CN', 'en-US' -> 'en')
    if (currentCode.startsWith('zh-TW') || currentCode.startsWith('zh-HK')) {
      return languages.find(l => l.code === 'zh-HK');
    }
    if (currentCode.startsWith('zh')) {
      return languages.find(l => l.code === 'zh-CN');
    }
    if (currentCode.startsWith('en')) {
      return languages.find(l => l.code === 'en');
    }

    return languages[0]; // Default to zh-CN
  };

  const currentLang = getCurrentLang();

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Globe className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`cursor-pointer ${i18n.language === lang.code || currentLang.code === lang.code ? 'bg-accent' : ''}`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-9">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLang.flag} {currentLang.name}</span>
          <span className="sm:hidden">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer ${i18n.language === lang.code || currentLang.code === lang.code ? 'bg-accent' : ''}`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
