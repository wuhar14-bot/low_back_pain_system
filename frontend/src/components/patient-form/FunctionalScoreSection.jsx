import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function FunctionalScoreSection({ formData, updateFormData }) {
  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            功能评分量表
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="rmdq_score" className="text-slate-700 font-medium">
                罗兰-莫里斯残疾问卷 (RMDQ)
              </Label>
              <div className="space-y-1">
                <Input
                  id="rmdq_score"
                  type="number"
                  min="0"
                  max="24"
                  value={formData.rmdq_score || ''}
                  onChange={(e) => handleInputChange('rmdq_score', parseInt(e.target.value))}
                  placeholder="0-24分"
                  className="bg-white border-slate-200"
                />
                <p className="text-xs text-slate-500">
                  24项量表，用于评估腰痛对日常生活的影响 (0-24分)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ndi_score" className="text-slate-700 font-medium">
                颈部残疾指数 (NDI)
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
                  10项百分比量表，用于评估颈椎功能障碍 (0-100%)
                </p>
              </div>
            </div>
          </div>

          {/* 功能评分解释 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-800 mb-2">评分参考:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <p className="font-medium">RMDQ评分:</p>
                <ul className="mt-1 space-y-1">
                  <li>• 0-4分: 轻微残疾</li>
                  <li>• 5-14分: 中等残疾</li>
                  <li>• 15-24分: 重度残疾</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">NDI评分:</p>
                <ul className="mt-1 space-y-1">
                  <li>• 0-20%: 轻微残疾</li>
                  <li>• 21-40%: 中等残疾</li>
                  <li>• 41-60%: 重度残疾</li>
                  <li>• {">"}60%: 完全残疾</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}