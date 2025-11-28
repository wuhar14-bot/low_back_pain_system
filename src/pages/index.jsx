import React, { useState, useEffect } from "react";
import { Patient } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Stethoscope,
  Users,
  Activity,
  ArrowRight,
  Smartphone,
  Monitor,
  RefreshCw,
  LogOut,
  User,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useExternal } from "@/contexts/ExternalContext";

export default function Home() {
  const { user, logout } = useAuth();
  const { workspaceName, doctorName, isExternalMode } = useExternal();

  const [stats, setStats] = useState({
    totalPatients: 0,
    recentPatients: 0,
    todayPatients: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // 加载患者数据
      const allPatients = await Patient.list("-created_date");

      // 计算最近24小时的新增患者数量
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentPatientsCount = allPatients.filter(p => new Date(p.created_date) > oneDayAgo).length;

      // 计算今天的新增患者数量
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayPatientsCount = allPatients.filter(p => new Date(p.created_date) >= today).length;

      setStats({
        totalPatients: allPatients.length,
        recentPatients: recentPatientsCount,
        todayPatients: todayPatientsCount
      });
    } catch (error) {
      console.error("加载统计数据失败:", error);
      setStats({
        totalPatients: 0,
        recentPatients: 0,
        todayPatients: 0
      });
    }
    setIsLoading(false);
  };

  const quickActions = [
    {
      title: "患者数据收集",
      description: "手机端数据收集表单",
      icon: Smartphone,
      url: createPageUrl("PatientForm"),
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "患者数据查看",
      description: "查看和管理患者数据",
      icon: Monitor,
      url: createPageUrl("Dashboard"),
      color: "from-blue-500 to-cyan-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 顶部用户信息栏 */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-3 bg-white rounded-lg shadow-sm px-4 py-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{user?.name || user?.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-500 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 头部欢迎区域 */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Stethoscope className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
              腰痛门诊数据收集系统
            </h1>
            <Button variant="ghost" size="icon" onClick={loadStats} disabled={isLoading}>
                <RefreshCw className={`w-6 h-6 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            专业临床数据收集、OCR文档识别和姿态分析服务
          </p>

          {isExternalMode && (workspaceName || doctorName) && (
            <div className="mt-4 inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
              {workspaceName && <span>工作室: <strong>{workspaceName}</strong></span>}
              {workspaceName && doctorName && <span className="mx-2">|</span>}
              {doctorName && <span>医生: <strong>{doctorName}</strong></span>}
            </div>
          )}
        </div>

        {/* 系统统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-500">患者总数</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.totalPatients}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-500">今日新增</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.todayPatients}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-500">24小时新增</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.recentPatients}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* 快速操作区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.url}>
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className={`w-14 h-14 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{action.title}</h3>
                      <p className="text-slate-600 mb-4">{action.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* 系统功能说明 */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardHeader>
            <CardTitle className="text-slate-800">系统功能</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">数据收集</h4>
                <p className="text-sm text-slate-600">便捷的患者腰痛评估数据收集表单</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">OCR识别</h4>
                <p className="text-sm text-slate-600">医疗文档自动文字识别（中英文）</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Monitor className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">姿态分析</h4>
                <p className="text-sm text-slate-600">基于MediaPipe的体态评估和分析</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}