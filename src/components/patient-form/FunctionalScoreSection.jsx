import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FunctionalScoreSection({ formData, updateFormData }) {
  const { t } = useTranslation();
  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t('form.functional.scaleTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="rmdq_score" className="text-slate-700 font-medium">
                {t('form.functional.rmdqFull')}
              </Label>
              <div className="space-y-1">
                <Input
                  id="rmdq_score"
                  type="number"
                  min="0"
                  max="24"
                  value={formData.rmdq_score || ''}
                  onChange={(e) => handleInputChange('rmdq_score', parseInt(e.target.value))}
                  placeholder={t('form.functional.rmdqPlaceholder')}
                  className="bg-white border-slate-200"
                />
                <p className="text-xs text-slate-500">
                  {t('form.functional.rmdqDesc')}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ndi_score" className="text-slate-700 font-medium">
                {t('form.functional.ndiFull')}
              </Label>
              <div className="space-y-1">
                <Input
                  id="ndi_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.ndi_score || ''}
                  onChange={(e) => handleInputChange('ndi_score', parseInt(e.target.value))}
                  placeholder="0-100%"
                  className="bg-white border-slate-200"
                />
                <p className="text-xs text-slate-500">
                  {t('form.functional.ndiDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Score Reference */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-800 mb-2">{t('form.functional.scoreReference')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <p className="font-medium">{t('form.functional.rmdqScoring')}</p>
                <ul className="mt-1 space-y-1">
                  <li>• {t('form.functional.rmdqMild')}</li>
                  <li>• {t('form.functional.rmdqModerate')}</li>
                  <li>• {t('form.functional.rmdqSevere')}</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">{t('form.functional.ndiScoring')}</p>
                <ul className="mt-1 space-y-1">
                  <li>• {t('form.functional.ndiMild')}</li>
                  <li>• {t('form.functional.ndiModerate')}</li>
                  <li>• {t('form.functional.ndiSevere')}</li>
                  <li>• {t('form.functional.ndiComplete')}</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}