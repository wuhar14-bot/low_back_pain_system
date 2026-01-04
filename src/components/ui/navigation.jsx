import React from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export function NavigationHeader({ title, showBack = true }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Button>
          )}
          {title && (
            <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="compact" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            {t('nav.home')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NavigationHeader;