import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Activity } from "lucide-react";

export default function SubjectiveExamSection({ formData, updateFormData }) {
  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  const handleCheckboxWithInput = (checkboxField, inputField, checked) => {
    updateFormData({
      [checkboxField]: checked,
      [inputField]: checked ? (formData[inputField] || '') : ''
    });
  };

  const handleRedFlagChange = (flag, checked) => {
    const currentFlags = formData.red_flags || {};
    updateFormData({
      red_flags: { ...currentFlags, [flag]: checked }
    });
  };

  const handleCervicalFunctionChange = (item, checked) => {
    const currentProblems = formData.cervical_function_problems || {};
    updateFormData({
      cervical_function_problems: { ...currentProblems, [item]: checked }
    });
  };

  const redFlags = [
    { key: 'weight_loss', label: '显著体重减轻' },
    { key: 'appetite_loss', label: '食欲不振' },
    { key: 'fever', label: '发热' },
    { key: 'night_pain', label: '夜间疼痛' },
    { key: 'bladder_bowel_dysfunction', label: '膀胱/肠道功能障碍' },
    { key: 'saddle_numbness', label: '鞍区麻木' },
    { key: 'bilateral_limb_weakness', label: '双侧上肢/下肢无力' },
    { key: 'bilateral_sensory_abnormal', label: '双侧上肢/下肢感觉异常' },
    { key: 'hand_clumsiness', label: '手部不灵活' },
    { key: 'gait_abnormal', label: '步态异常' }
  ];

  const cervicalFunctionItems = [
    { key: 'dropping_objects', label: '物品掉落' },
    { key: 'difficulty_picking_small_items', label: '难以拾取小物件' },
    { key: 'writing_difficulty', label: '书写困难' },
    { key: 'phone_usage_difficulty', label: '使用手机困难' },
    { key: 'buttoning_difficulty', label: '扣纽扣困难' },
    { key: 'chopstick_usage_difficulty', label: '使用筷子困难' }
  ];

  return (
    <div className="space-y-6">
      {/* 疼痛评分 */}
      <div className="space-y-3">
        <Label className="text-slate-700 font-medium flex items-center gap-2">
          <Activity className="w-4 h-4" />
          疼痛评分 (NPRS 0-10分)
        </Label>
        <div className="text-sm text-slate-600 mb-2">
          0为无痛，10为最痛
        </div>
        <RadioGroup
          value={formData.pain_score?.toString() || ''}
          onValueChange={(value) => handleInputChange('pain_score', parseInt(value))}
          className="flex justify-between"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
            <div key={score} className="flex flex-col items-center space-y-1">
              <RadioGroupItem value={score.toString()} id={`pain_${score}`} className="h-5 w-5" />
              <Label htmlFor={`pain_${score}`} className="text-slate-700 font-medium cursor-pointer text-sm">{score}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* 耐受时间 */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            耐受时间 (分钟)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sitting_tolerance" className="text-slate-700 font-medium">坐姿</Label>
              <Input
                id="sitting_tolerance"
                type="number"
                value={formData.sitting_tolerance || ''}
                onChange={(e) => handleInputChange('sitting_tolerance', parseInt(e.target.value))}
                placeholder="分钟"
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standing_tolerance" className="text-slate-700 font-medium">站立</Label>
              <Input
                id="standing_tolerance"
                type="number"
                value={formData.standing_tolerance || ''}
                onChange={(e) => handleInputChange('standing_tolerance', parseInt(e.target.value))}
                placeholder="分钟"
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="walking_tolerance" className="text-slate-700 font-medium">行走</Label>
              <Input
                id="walking_tolerance"
                type="number"
                value={formData.walking_tolerance || ''}
                onChange={(e) => handleInputChange('walking_tolerance', parseInt(e.target.value))}
                placeholder="分钟"
                className="bg-white border-slate-200"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="has_assistive_tools"
                  checked={formData.has_assistive_tools || false}
                  onCheckedChange={(checked) => handleCheckboxWithInput('has_assistive_tools', 'assistive_tools', checked)}
                />
                <Label htmlFor="has_assistive_tools" className="text-slate-700 font-medium">辅助工具</Label>
              </div>
              <Input
                id="assistive_tools"
                value={formData.assistive_tools || ''}
                onChange={(e) => handleInputChange('assistive_tools', e.target.value)}
                placeholder="如：拐杖、助行器等"
                className="bg-white border-slate-200"
                disabled={!formData.has_assistive_tools}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="has_claudication"
                  checked={formData.has_claudication || false}
                  onCheckedChange={(checked) => handleCheckboxWithInput('has_claudication', 'claudication_distance', checked)}
                />
                <Label htmlFor="has_claudication" className="text-slate-700 font-medium">间歇性跛行距离</Label>
              </div>
              <Input
                id="claudication_distance"
                value={formData.claudication_distance || ''}
                onChange={(e) => handleInputChange('claudication_distance', e.target.value)}
                placeholder="米或其他描述"
                className="bg-white border-slate-200"
                disabled={!formData.has_claudication}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 危险信号筛查 */}
      <Card className="border border-red-200 bg-red-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            危险信号筛查
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {redFlags.map((flag) => (
              <div key={flag.key} className="flex items-center space-x-2">
                <Checkbox
                  id={flag.key}
                  checked={(formData.red_flags || {})[flag.key] || false}
                  onCheckedChange={(checked) => handleRedFlagChange(flag.key, checked)}
                />
                <Label htmlFor={flag.key} className="text-sm font-medium text-slate-700">
                  {flag.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 颈椎相关手功能问题 */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-slate-800">
            颈椎相关手功能问题
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cervicalFunctionItems.map((item) => (
              <div key={item.key} className="flex items-center space-x-2">
                <Checkbox
                  id={item.key}
                  checked={(formData.cervical_function_problems || {})[item.key] || false}
                  onCheckedChange={(checked) => handleCervicalFunctionChange(item.key, checked)}
                />
                <Label htmlFor={item.key} className="text-sm font-medium text-slate-700">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}