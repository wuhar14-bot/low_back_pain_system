import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

export default function BodySectionSelector({ formData, updateFormData }) {
  const handleBodySectionToggle = (section) => {
    const currentSections = formData.discomfort_areas || {};
    const newSections = {
      ...currentSections,
      [section]: !currentSections[section]
    };
    updateFormData({ discomfort_areas: newSections });
  };

  const bodySections = [
    { key: 'cervical_left', label: '颈椎（左）', position: { top: '4%', left: '40%' } },
    { key: 'cervical_right', label: '颈椎（右）', position: { top: '4%', left: '60%' } },
    { key: 'thoracic_center', label: '胸椎中间', position: { top: '15%', left: '50%' } },
    { key: 'thoracic_left', label: '胸椎（左）', position: { top: '15%', left: '35%' } },
    { key: 'thoracic_right', label: '胸椎（右）', position: { top: '15%', left: '65%' } },
    { key: 'lumbar_center', label: '腰椎中间', position: { top: '28%', left: '50%' } },
    { key: 'lumbar_left', label: '腰椎（左）', position: { top: '28%', left: '35%' } },
    { key: 'lumbar_right', label: '腰椎（右）', position: { top: '28%', left: '65%' } },
    { key: 'hip_left', label: '臀部（左）', position: { top: '38%', left: '37%' } },
    { key: 'hip_right', label: '臀部（右）', position: { top: '38%', left: '63%' } },
    { key: 'thigh_left', label: '大腿（左）', position: { top: '50%', left: '32%' } },
    { key: 'thigh_right', label: '大腿（右）', position: { top: '50%', left: '68%' } },
    { key: 'knee_left', label: '膝盖（左）', position: { top: '63%', left: '32%' } },
    { key: 'knee_right', label: '膝盖（右）', position: { top: '63%', left: '68%' } },
    { key: 'calf_left', label: '小腿（左）', position: { top: '75%', left: '32%' } },
    { key: 'calf_right', label: '小腿（右）', position: { top: '75%', left: '68%' } },
    { key: 'foot_left', label: '足部（左）', position: { top: '87%', left: '30%' } },
    { key: 'foot_right', label: '足部（右）', position: { top: '87%', left: '70%' } }
  ];

  const getSelectedCount = () => {
    const selected = formData.discomfort_areas || {};
    return Object.values(selected).filter(Boolean).length;
  };

  const getSelectedSections = () => {
    const selected = formData.discomfort_areas || {};
    return bodySections.filter(section => selected[section.key]);
  };

  return (
    <Card className="border border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
          <User className="w-5 h-5" />
          身体不适区域选择
          {getSelectedCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              已选择 {getSelectedCount()} 个区域
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 问题提示 */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium mb-2">
              近期哪里有不适？
            </p>
            <p className="text-xs text-blue-600">
              请在下方人体图示中点击患者描述的不适区域
            </p>
          </div>

          {/* 人体图示区域 */}
          <div className="relative mx-auto max-w-md">
            {/* 人体轮廓背景 */}
            <div className="relative bg-gradient-to-b from-slate-50 to-slate-100 rounded-3xl border-2 border-slate-200 h-[480px] w-64 mx-auto shadow-sm">
              {/* 头部 */}
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-slate-200 rounded-full border border-slate-300"></div>

              {/* 颈部 */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-slate-150 rounded border border-slate-300"></div>

              {/* 躯干上部 */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-24 h-20 bg-slate-100 rounded-t-2xl border border-slate-300"></div>

              {/* 躯干中部 */}
              <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-22 h-16 bg-slate-100 border border-slate-300"></div>

              {/* 腰部/骨盆区域 */}
              <div className="absolute top-56 left-1/2 transform -translate-x-1/2 w-26 h-14 bg-slate-100 rounded-lg border border-slate-300"></div>

              {/* 臀部 */}
              <div className="absolute top-70 left-1/2 transform -translate-x-1/2 w-28 h-12 bg-slate-100 rounded-lg border border-slate-300"></div>

              {/* 大腿 */}
              <div className="absolute top-82 left-7 w-7 h-20 bg-slate-100 rounded-lg border border-slate-300"></div>
              <div className="absolute top-82 right-7 w-7 h-20 bg-slate-100 rounded-lg border border-slate-300"></div>

              {/* 膝盖 */}
              <div className="absolute top-[25.5rem] left-7 w-7 h-4 bg-slate-150 rounded border border-slate-300"></div>
              <div className="absolute top-[25.5rem] right-7 w-7 h-4 bg-slate-150 rounded border border-slate-300"></div>

              {/* 小腿 */}
              <div className="absolute top-[27rem] left-7 w-6 h-16 bg-slate-100 rounded-lg border border-slate-300"></div>
              <div className="absolute top-[27rem] right-7 w-6 h-16 bg-slate-100 rounded-lg border border-slate-300"></div>

              {/* 足部 */}
              <div className="absolute top-[31rem] left-6 w-8 h-6 bg-slate-100 rounded-lg border border-slate-300"></div>
              <div className="absolute top-[31rem] right-6 w-8 h-6 bg-slate-100 rounded-lg border border-slate-300"></div>

              {/* 可点击的身体区域 */}
              {bodySections.map((section) => {
                const isSelected = (formData.discomfort_areas || {})[section.key];
                return (
                  <button
                    key={section.key}
                    onClick={() => handleBodySectionToggle(section.key)}
                    className={`absolute w-4 h-4 rounded-full border-2 transition-all duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isSelected
                        ? 'bg-red-500 border-red-600 shadow-lg'
                        : 'bg-white border-gray-400 hover:border-red-400'
                    }`}
                    style={{
                      top: section.position.top,
                      left: section.position.left,
                      transform: 'translate(-50%, -50%)'
                    }}
                    title={section.label}
                  />
                );
              })}
            </div>
          </div>

          {/* 已选择区域列表 */}
          {getSelectedCount() > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700">已选择的不适区域：</h4>
              <div className="flex flex-wrap gap-2">
                {getSelectedSections().map((section) => (
                  <Badge
                    key={section.key}
                    variant="destructive"
                    className="cursor-pointer hover:bg-red-600"
                    onClick={() => handleBodySectionToggle(section.key)}
                  >
                    {section.label}
                    <span className="ml-1 text-xs">×</span>
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                点击标签可取消选择
              </p>
            </div>
          )}

          {/* 使用说明 */}
          <div className="text-xs text-slate-500 space-y-1">
            <p>• 红色圆点表示患者有不适的区域</p>
            <p>• 点击人体图上的圆点或下方标签来选择/取消区域</p>
            <p>• 可以选择多个区域</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}