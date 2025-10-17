import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, RotateCcw, CheckCircle2 } from "lucide-react";

export default function PainAreaSection({ formData, updateFormData }) {
  const handleAreaToggle = (areaKey) => {
    const currentAreas = formData.pain_areas || {};
    const newAreas = {
      ...currentAreas,
      [areaKey]: !currentAreas[areaKey]
    };
    updateFormData({ pain_areas: newAreas });
  };

  const clearAllSelections = () => {
    updateFormData({ pain_areas: {} });
  };

  const confirmAreas = () => {
    const selectedAreas = formData.pain_areas || {};
    const selectedCount = Object.values(selectedAreas).filter(Boolean).length;
    if (selectedCount > 0) {
      alert(`已确认选择 ${selectedCount} 个疼痛区域`);
    } else {
      alert('请先选择疼痛区域');
    }
  };

  const getSelectedCount = () => {
    const selected = formData.pain_areas || {};
    return Object.values(selected).filter(Boolean).length;
  };

  const getSelectedAreas = () => {
    const selected = formData.pain_areas || {};
    return painAreas.filter(area => selected[area.key]);
  };

  // Anatomical pain areas based on the reference images
  const painAreas = [
    // Upper back/cervical
    { key: 'upper_cervical', label: '上颈椎', coords: '128,45,158,75' },
    { key: 'lower_cervical', label: '下颈椎', coords: '128,75,158,105' },

    // Upper trapezius
    { key: 'left_upper_trap', label: '左上斜方肌', coords: '85,85,125,125' },
    { key: 'right_upper_trap', label: '右上斜方肌', coords: '160,85,200,125' },

    // Middle trapezius/rhomboids
    { key: 'left_mid_trap', label: '左中斜方肌', coords: '85,125,125,165' },
    { key: 'right_mid_trap', label: '右中斜方肌', coords: '160,125,200,165' },

    // Lower trapezius
    { key: 'left_lower_trap', label: '左下斜方肌', coords: '90,165,130,205' },
    { key: 'right_lower_trap', label: '右下斜方肌', coords: '155,165,195,205' },

    // Latissimus dorsi
    { key: 'left_latissimus', label: '左背阔肌', coords: '70,165,110,225' },
    { key: 'right_latissimus', label: '右背阔肌', coords: '175,165,215,225' },

    // Erector spinae - thoracic
    { key: 'thoracic_erector', label: '胸椎竖脊肌', coords: '128,105,158,185' },

    // Erector spinae - lumbar
    { key: 'lumbar_erector', label: '腰椎竖脊肌', coords: '128,185,158,245' },

    // Gluteus maximus
    { key: 'left_glute_max', label: '左臀大肌', coords: '105,245,145,285' },
    { key: 'right_glute_max', label: '右臀大肌', coords: '140,245,180,285' },

    // Gluteus medius
    { key: 'left_glute_med', label: '左臀中肌', coords: '95,225,135,265' },
    { key: 'right_glute_med', label: '右臀中肌', coords: '150,225,190,265' },

    // Hamstrings
    { key: 'left_hamstring', label: '左腘绳肌', coords: '105,285,130,340' },
    { key: 'right_hamstring', label: '右腘绳肌', coords: '155,285,180,340' },

    // Gastrocnemius
    { key: 'left_gastrocnemius', label: '左腓肠肌', coords: '110,370,130,420' },
    { key: 'right_gastrocnemius', label: '右腓肠肌', coords: '155,370,175,420' }
  ];

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">疼痛区域选择</h3>
        <p className="text-sm text-blue-700 mb-2">
          请根据患者描述，在下方人体后视图中点击疼痛或不适的肌肉群区域
        </p>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• 灰色区域：正常无疼痛</li>
          <li>• 红色区域：有疼痛或不适</li>
          <li>• 点击区域可切换选择状态</li>
        </ul>
      </div>

      <Card className="border border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <User className="w-5 h-5" />
            后视疼痛区域选择 (肌肉群)
            {getSelectedCount() > 0 && (
              <Badge variant="destructive" className="ml-2">
                已选择 {getSelectedCount()} 个区域
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* SVG Body Diagram */}
            <div className="flex justify-center">
              <div className="relative">
                <svg
                  width="285"
                  height="450"
                  viewBox="0 0 285 450"
                  className="border border-slate-200 rounded-lg bg-white"
                >
                  {/* Head */}
                  <ellipse cx="143" cy="35" rx="25" ry="30" fill="#D4A574" stroke="#8B6914" strokeWidth="2"/>

                  {/* Neck */}
                  <rect x="135" y="60" width="16" height="20" fill="#E5E5E5" stroke="#9CA3AF" strokeWidth="1"/>

                  {/* Shoulder line */}
                  <line x1="70" y1="85" x2="215" y2="85" stroke="#9CA3AF" strokeWidth="2"/>

                  {/* Main torso outline */}
                  <path d="M 85 85 L 200 85 L 195 165 L 175 225 L 190 265 L 180 285 L 155 340 L 175 420 L 175 445 L 155 445 L 130 420 L 110 445 L 110 445 L 95 425 L 110 340 L 105 285 L 95 265 L 110 225 L 90 165 L 85 85 Z"
                        fill="#E5E5E5" stroke="#9CA3AF" strokeWidth="2"/>

                  {/* Spine line */}
                  <line x1="143" y1="80" x2="143" y2="245" stroke="#9CA3AF" strokeWidth="3"/>

                  {/* Clickable muscle areas */}
                  {painAreas.map((area) => {
                    const isSelected = (formData.pain_areas || {})[area.key];
                    const coords = area.coords.split(',').map(Number);

                    return (
                      <rect
                        key={area.key}
                        x={coords[0]}
                        y={coords[1]}
                        width={coords[2] - coords[0]}
                        height={coords[3] - coords[1]}
                        fill={isSelected ? '#EF4444' : '#E5E5E5'}
                        stroke={isSelected ? '#DC2626' : '#9CA3AF'}
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-200 hover:opacity-80"
                        onClick={() => handleAreaToggle(area.key)}
                        title={area.label}
                      />
                    );
                  })}
                </svg>

                {/* Label */}
                <div className="text-center mt-4">
                  <h4 className="text-sm font-semibold text-slate-700">后视疼痛选择</h4>
                  <h5 className="text-xs text-slate-600">(肌肉群)</h5>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={clearAllSelections}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                disabled={getSelectedCount() === 0}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                清除选择
              </Button>
              <Button
                onClick={confirmAreas}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={getSelectedCount() === 0}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                确认区域
              </Button>
            </div>

            {/* Selected areas list */}
            {getSelectedCount() > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-700">已选择的疼痛区域：</h4>
                <div className="flex flex-wrap gap-2">
                  {getSelectedAreas().map((area) => (
                    <Badge
                      key={area.key}
                      variant="destructive"
                      className="cursor-pointer hover:bg-red-600"
                      onClick={() => handleAreaToggle(area.key)}
                    >
                      {area.label}
                      <span className="ml-1 text-xs">×</span>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  点击标签可取消选择
                </p>
              </div>
            )}

            {/* Legend */}
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded border border-red-600"></div>
                <span className="text-slate-700">红色选择疼痛区域</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded border border-gray-400"></div>
                <span className="text-slate-700">灰色正常</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded border border-gray-400"></div>
                <span className="text-slate-700">无疼痛</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}