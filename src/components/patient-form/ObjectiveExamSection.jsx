
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, RotateCcw, Zap, Camera, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostureAnalysisModal from "./PostureAnalysisModal";
import { useTranslation } from "react-i18next";

export default function ObjectiveExamSection({ formData, updateFormData }) {
  const { t } = useTranslation();
  const [showPostureAnalysis, setShowPostureAnalysis] = useState(false);

  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  const handleRomReview = () => {
    updateFormData({ rom_reviewed: true });
  };

  const handleSpecialTestReview = () => {
    updateFormData({ special_test_reviewed: true });
  };

  const handleNestedObjectChange = (parentField, childField, value) => {
    const currentData = formData[parentField] || {};
    updateFormData({
      [parentField]: { ...currentData, [childField]: value }
    });
  };

  const handlePostureAnalysisComplete = (analysisResult) => {
    // 将AI分析结果整合到表单数据中
    const postureData = {
      ai_posture_analysis: analysisResult
    };

    // 如果AI识别出了具体的ROM数据，也可以更新到对应字段
    if (analysisResult.rom_degrees) {
      const currentLumbarRom = formData.lumbar_rom || {};
      postureData.lumbar_rom = {
        ...currentLumbarRom,
        flexion: `${analysisResult.rom_degrees}° (AI测量)`
      };
    }

    updateFormData(postureData);
  };

  const reflexGrades = ["-", "+", "++", "+++", "++++"];
  const pathologicalOptions = ["-", "+"];
  const myotomeScores = ["0", "1", "2", "3", "4", "5"];

  const postureOptions = {
    cervical: [
      { value: "颈椎前凸过度", key: "excessiveLordosis" },
      { value: "正常曲度", key: "normalCurvature" },
      { value: "颈椎前凸消失", key: "reducedLordosis" },
      { value: "颈椎后凸", key: "kyphotic" }
    ],
    lumbar: [
      { value: "腰椎前凸过度", key: "lumbarExcessiveLordosis" },
      { value: "正常曲度", key: "lumbarNormal" },
      { value: "腰椎曲度变平", key: "lumbarReduced" },
      { value: "腰椎后凸", key: "lumbarKyphotic" }
    ]
  };

  return (
    <div className="space-y-6">
      {/* AI Posture Analysis */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            {t('form.objective.aiPostureAnalysis')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-600 mb-4">
            {t('form.objective.aiPostureDesc')}
          </div>

          <Button
            onClick={() => setShowPostureAnalysis(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            {t('form.objective.startAnalysis')}
          </Button>

          {/* AI Analysis Result */}
          {formData.ai_posture_analysis && (
            <div className="bg-white p-4 rounded-lg border border-blue-200 mt-4">
              <h5 className="font-medium text-slate-800 mb-3">{t('form.objective.aiResult')}</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-slate-600">{t('form.objective.flexionROM')}</span>
                  <span className="font-semibold text-blue-700 ml-1">
                    {formData.ai_posture_analysis.rom_degrees}°
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">{t('form.objective.functionalAssessment')}</span>
                  <span className="font-semibold ml-1">
                    {formData.ai_posture_analysis.rom_assessment}
                  </span>
                </div>
                {formData.ai_posture_analysis.compensations && (
                  <div className="md:col-span-2">
                    <span className="text-slate-600">{t('form.objective.compensation')}</span>
                    <span className="ml-1">{formData.ai_posture_analysis.compensations}</span>
                  </div>
                )}
                {formData.ai_posture_analysis.recommendations && (
                  <div className="md:col-span-2">
                    <span className="text-slate-600">{t('form.objective.suggestion')}</span>
                    <span className="ml-1">{formData.ai_posture_analysis.recommendations}</span>
                  </div>
                )}
              </div>
              {/* Annotated Images */}
              {(formData.ai_posture_analysis.annotatedStandingUrl || formData.ai_posture_analysis.annotatedFlexionUrl) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  {formData.ai_posture_analysis.annotatedStandingUrl && (
                    <div className="space-y-2">
                      <p className="font-medium text-sm text-center text-slate-700">{t('form.objective.standingAnalysis')}</p>
                      <img
                        src={formData.ai_posture_analysis.annotatedStandingUrl}
                        alt={t('form.objective.standingAnalysis')}
                        className="rounded-lg border bg-slate-100 w-full h-[300px] object-contain"
                      />
                    </div>
                  )}
                  {formData.ai_posture_analysis.annotatedFlexionUrl && (
                    <div className="space-y-2">
                       <p className="font-medium text-sm text-center text-slate-700">{t('form.objective.flexionAnalysis')}</p>
                      <img
                        src={formData.ai_posture_analysis.annotatedFlexionUrl}
                        alt={t('form.objective.flexionAnalysis')}
                        className="rounded-lg border bg-slate-100 w-full h-[300px] object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posture Examination */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {t('form.objective.postureExam')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">{t('form.objective.cervicalPosture')}</Label>
              <RadioGroup
                value={formData.cervical_posture || ''}
                onValueChange={(value) => handleInputChange('cervical_posture', value)}
                className="grid grid-cols-1 gap-2"
              >
                {postureOptions.cervical.map((option, index) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`cervical_${index}`} />
                    <Label htmlFor={`cervical_${index}`} className="text-slate-700 font-normal cursor-pointer">{t(`form.objective.postures.${option.key}`)}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">{t('form.objective.lumbarPosture')}</Label>
              <RadioGroup
                value={formData.lumbar_posture || ''}
                onValueChange={(value) => handleInputChange('lumbar_posture', value)}
                className="grid grid-cols-1 gap-2"
              >
                {postureOptions.lumbar.map((option, index) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`lumbar_${index}`} />
                    <Label htmlFor={`lumbar_${index}`} className="text-slate-700 font-normal cursor-pointer">{t(`form.objective.postures.${option.key}`)}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ROM Examination */}
      <Card className="border border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              {t('form.objective.romExam')}
            </CardTitle>
            <div className="flex items-center gap-2">
              {formData.rom_reviewed && (
                <span className="text-green-600 font-medium text-sm flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {t('form.objective.reviewed')}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={handleRomReview} className="bg-white">
                {t('form.objective.save')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleRomReview} className="bg-white">
                {t('form.objective.review')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cervical ROM */}
          <div>
            <h4 className="font-medium text-slate-700 mb-3">{t('form.objective.cervicalROMTitle')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['flexion', 'extension', 'left_lateral', 'right_lateral', 'left_rotation', 'right_rotation'].map((movement) => (
                <div key={movement} className="space-y-2">
                  <Label className="text-sm text-slate-600">
                    {t(`form.objective.movements.${movement}`)}
                  </Label>
                  <Input
                    value={(formData.cervical_rom || {})[movement] || ''}
                    onChange={(e) => handleNestedObjectChange('cervical_rom', movement, e.target.value)}
                    placeholder={t('form.objective.anglePlaceholder')}
                    className="bg-white border-slate-200 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Lumbar ROM */}
          <div>
            <h4 className="font-medium text-slate-700 mb-3">{t('form.objective.lumbarROMTitle')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['flexion', 'extension', 'left_lateral', 'right_lateral', 'left_rotation', 'right_rotation'].map((movement) => (
                <div key={movement} className="space-y-2">
                  <Label className="text-sm text-slate-600">
                    {t(`form.objective.movements.${movement}`)}
                  </Label>
                  <Input
                    value={(formData.lumbar_rom || {})[movement] || ''}
                    onChange={(e) => handleNestedObjectChange('lumbar_rom', movement, e.target.value)}
                    placeholder={t('form.objective.anglePlaceholder')}
                    className="bg-white border-slate-200 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Tests */}
      <Card className="border border-blue-200 bg-blue-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {t('form.objective.specialTests')}
            </CardTitle>
            <div className="flex items-center gap-2">
              {formData.special_test_reviewed && (
                <span className="text-green-600 font-medium text-sm flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {t('form.objective.reviewed')}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={handleSpecialTestReview} className="bg-white">
                {t('form.objective.save')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSpecialTestReview} className="bg-white">
                {t('form.objective.review')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700">{t('form.objective.slrLeft')}</Label>
              <Input
                value={(formData.slr_test || {}).left_angle || ''}
                onChange={(e) => handleNestedObjectChange('slr_test', 'left_angle', e.target.value)}
                placeholder={t('form.objective.anglePlaceholderShort')}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">{t('form.objective.slrRight')}</Label>
              <Input
                value={(formData.slr_test || {}).right_angle || ''}
                onChange={(e) => handleNestedObjectChange('slr_test', 'right_angle', e.target.value)}
                placeholder={t('form.objective.anglePlaceholderShort')}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">{t('form.objective.femoralStretchLeft')}</Label>
              <Input
                value={(formData.femoral_nerve_test || {}).left || ''}
                onChange={(e) => handleNestedObjectChange('femoral_nerve_test', 'left', e.target.value)}
                placeholder={t('form.objective.resultPlaceholder')}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">{t('form.objective.femoralStretchRight')}</Label>
              <Input
                value={(formData.femoral_nerve_test || {}).right || ''}
                onChange={(e) => handleNestedObjectChange('femoral_nerve_test', 'right', e.target.value)}
                placeholder={t('form.objective.resultPlaceholder')}
                className="bg-white border-slate-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reflex Examination */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            {t('form.objective.reflexExam')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
              {[
                { key: 'biceps' },
                { key: 'triceps' },
                { key: 'knee' },
                { key: 'ankle' }
              ].map((reflex) => (
                <div key={reflex.key} className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="font-medium text-slate-700 mb-3">{t(`form.objective.reflexes.${reflex.key}`)}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm text-slate-600 mb-2 block">{t('form.objective.leftSide')}</Label>
                      <RadioGroup
                        value={(formData.reflexes || {})[`${reflex.key}_left`] || ''}
                        onValueChange={(value) => handleNestedObjectChange('reflexes', `${reflex.key}_left`, value)}
                        className="flex flex-wrap gap-2"
                      >
                        {reflexGrades.map((grade) => (
                          <div key={grade} className="flex items-center space-x-1">
                            <RadioGroupItem value={grade} id={`${reflex.key}_left_${grade}`} />
                            <Label htmlFor={`${reflex.key}_left_${grade}`} className="text-slate-700 font-normal cursor-pointer text-sm">{grade}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-600 mb-2 block">{t('form.objective.rightSide')}</Label>
                      <RadioGroup
                        value={(formData.reflexes || {})[`${reflex.key}_right`] || ''}
                        onValueChange={(value) => handleNestedObjectChange('reflexes', `${reflex.key}_right`, value)}
                        className="flex flex-wrap gap-2"
                      >
                        {reflexGrades.map((grade) => (
                          <div key={grade} className="flex items-center space-x-1">
                            <RadioGroupItem value={grade} id={`${reflex.key}_right_${grade}`} />
                            <Label htmlFor={`${reflex.key}_right_${grade}`} className="text-slate-700 font-normal cursor-pointer text-sm">{grade}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Distal Pulse */}
      <div className="space-y-2">
        <Label className="text-slate-700 font-medium">{t('form.objective.distalPulse')}</Label>
        <RadioGroup
          value={formData.distal_pulse || ''}
          onValueChange={(value) => handleInputChange('distal_pulse', value)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="存在" id="pulse_present" />
            <Label htmlFor="pulse_present" className="text-slate-700 font-normal cursor-pointer">{t('form.objective.pulsePresent')}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="不存在" id="pulse_absent" />
            <Label htmlFor="pulse_absent" className="text-slate-700 font-normal cursor-pointer">{t('form.objective.pulseAbsent')}</Label>
          </div>
        </RadioGroup>
      </div>

      {/* AI姿态分析弹窗 */}
      <PostureAnalysisModal
        isOpen={showPostureAnalysis}
        onClose={() => setShowPostureAnalysis(false)}
        onAnalysisComplete={handlePostureAnalysisComplete}
      />
    </div>
  );
}
