import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Circle, Play, Send } from "lucide-react";

export default function PatientFormCatalog({ 
  sections, 
  completedSections, 
  currentSection, 
  onSectionSelect, 
  onBack, 
  onSubmit, 
  isSubmitting,
  hasBasicInfo 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">数据收集目录</h1>
            <p className="text-slate-600">选择需要收集的患者信息模块</p>
          </div>
        </div>

        {/* 进度概览 */}
        <Card className="mb-8 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">收集进度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-emerald-600">
                {completedSections.size}/{sections.length}
              </div>
              <div className="flex-1">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedSections.size / sections.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-slate-500">
                已完成 {completedSections.size} 个模块
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 模块列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {sections.map((section, index) => {
            const isCompleted = completedSections.has(section.id);
            const isCurrent = index === currentSection;
            
            return (
              <Card 
                key={section.id} 
                className={`border-0 shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                  isCurrent 
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200' 
                    : 'bg-white/90 backdrop-blur-sm'
                }`}
                onClick={() => onSectionSelect(index)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                          : isCurrent
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-6 h-6" /> : index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-slate-800">{section.title}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          {section.required && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              必填
                            </Badge>
                          )}
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              已完成
                            </Badge>
                          )}
                          {isCurrent && !isCompleted && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              当前位置
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isCurrent ? "default" : "outline"}
                      className={isCurrent ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      {isCompleted ? "重新编辑" : "开始填写"}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* 底部操作 */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-slate-600">
                {!hasBasicInfo && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Circle className="w-4 h-4" />
                    请先完成"基本信息"模块，这是必填项
                  </div>
                )}
                {hasBasicInfo && completedSections.size < sections.length && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Circle className="w-4 h-4" />
                    您可以继续填写其他模块，或直接提交已收集的信息
                  </div>
                )}
                {completedSections.size === sections.length && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    所有模块已完成，可以提交患者信息
                  </div>
                )}
              </div>
              
              {hasBasicInfo && (
                <Button
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-6"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "提交中..." : "提交患者信息"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}