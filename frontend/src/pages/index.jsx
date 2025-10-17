import React, { useState, useEffect } from "react";
import { Workspace } from "@/api/entities";
import { Patient } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Building2,
  Users,
  Activity,
  ArrowRight,
  Settings,
  BarChart3,
  Smartphone,
  Monitor,
  RefreshCw,
  LogOut,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();
  // Debug: checking page render
  const [stats, setStats] = useState({
    totalWorkspaces: 0,
    totalPatients: 0,
    recentPatients: 0,
    activeWorkspaces: 0
  });
  const [recentWorkspaces, setRecentWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // 获取当前选择的工作室ID
      const workspaceId = localStorage.getItem('currentWorkspaceId');

      // 加载工作室数据 (全局)
      const workspaces = await Workspace.list("-created_date");
      const activeWorkspaces = workspaces.filter(w => w.is_active);

      // 加载患者数据
      const allPatients = await Patient.list("-created_date");

      // 根据工作室ID筛选患者
      const relevantPatients = workspaceId
        ? allPatients.filter(p => p.workspace_id === workspaceId)
        : allPatients;

      // 计算最近24小时的新增患者数量
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentPatientsCount = relevantPatients.filter(p => new Date(p.created_date) > oneDayAgo).length;

      setStats({
        totalWorkspaces: workspaces.length,
        totalPatients: relevantPatients.length,
        recentPatients: recentPatientsCount,
        activeWorkspaces: activeWorkspaces.length
      });

      setRecentWorkspaces(workspaces.slice(0, 3));
    } catch (error) {
      console.error("加载统计数据失败:", error);
      // Set demo/placeholder data when API fails
      setStats({
        totalWorkspaces: 0,
        totalPatients: 0,
        recentPatients: 0,
        activeWorkspaces: 0
      });
      setRecentWorkspaces([]);
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
      title: "医生工作台",
      description: "查看和管理患者数据",
      icon: Monitor,
      url: createPageUrl("Dashboard"),
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "管理后台",
      description: "管理工作室、查看系统数据",
      icon: Settings,
      url: createPageUrl("AdminPanel"),
      color: "from-purple-500 to-indigo-500"
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
            专业临床数据收集，支持跨平台协作和患者匿名化处理
          </p>
        </div>

        {/* 系统统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-500">工作室总数</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.totalWorkspaces}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

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
                  <p className="text-sm font-medium text-slate-500">24小时新增</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.recentPatients}</p>
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
                  <p className="text-sm font-medium text-slate-500">活跃工作室</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.activeWorkspaces}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* 快速操作区域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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

        {/* 最近工作室 */}
        {recentWorkspaces.length > 0 && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Building2 className="w-5 h-5" />
                最近的工作室
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentWorkspaces.map((workspace) => (
                  <div key={workspace.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-800">{workspace.name}</h4>
                      <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                        活跃
                      </Badge>
                    </div>
                    {workspace.description && (
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                        {workspace.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>创建于 {format(new Date(workspace.created_date), "MM月dd日")}</span>
                      {workspace.created_by_name && (
                        <span>{workspace.created_by_name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link to={createPageUrl("AdminPanel")}>
                  <Button variant="outline" className="hover:bg-slate-50">
                    查看所有工作室
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 使用指南 */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardHeader>
            <CardTitle className="text-slate-800">使用指南</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-600 font-bold">1</span>
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">创建工作室</h4>
                <p className="text-sm text-slate-600">在管理后台创建您的工作室，设置基本信息和权限</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">收集数据</h4>
                <p className="text-sm text-slate-600">使用手机端表单收集患者腰痛评估数据</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">分析管理</h4>
                <p className="text-sm text-slate-600">在医生工作台查看分析数据，制定治疗方案</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}