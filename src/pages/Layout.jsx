
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Workspace } from "@/api/entities";
import { useExternal } from "@/contexts/ExternalContext";
import {
  Smartphone,
  Monitor,
  FileText,
  Users,
  Activity,
  Stethoscope,
  Building2,
  Settings,
  Home,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  {
    title: "首页",
    url: createPageUrl("index"),
    icon: Home,
    description: "系统首页"
  },
  {
    title: "患者数据收集",
    url: createPageUrl("PatientForm"),
    icon: Smartphone,
    description: "手机端数据收集"
  },
  {
    title: "医生工作台",
    url: createPageUrl("Dashboard"),
    icon: Monitor,
    description: "查看患者数据"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { workspaceName, doctorName, isExternalMode } = useExternal();
  const { user, logout } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useState(null);

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    loadCurrentWorkspace();
  }, [location.pathname, workspaceName]);

  const loadCurrentWorkspace = async () => {
    // 优先使用外部传入的工作室信息
    if (isExternalMode && workspaceName) {
      setCurrentWorkspace({
        id: localStorage.getItem('currentWorkspaceId'),
        name: workspaceName,
        created_by_name: doctorName || '外部系统'
      });
      return;
    }

    // 降级：尝试从旧的 Workspace API 加载
    const workspaceId = localStorage.getItem('currentWorkspaceId');
    if (workspaceId) {
      try {
        const workspaces = await Workspace.list();
        const workspace = workspaces.find(w => w.id === workspaceId);
        setCurrentWorkspace(workspace);
      } catch (error) {
        console.error("加载当前工作室失败:", error);
        setCurrentWorkspace(null);
      }
    } else {
      setCurrentWorkspace(null);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <Sidebar className="border-r border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200/60 p-6">
            <Link to={createPageUrl("index")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">腰痛门诊</h2>
                <p className="text-xs text-slate-500 font-medium">数据收集系统</p>
              </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            {/* 当前工作室信息 */}
            {currentWorkspace && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-3">
                  当前工作室
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium text-emerald-800">{currentWorkspace.name}</span>
                    </div>
                    {currentWorkspace.created_by_name && (
                      <p className="text-xs text-emerald-600 mt-1">
                        创建者: {currentWorkspace.created_by_name}
                      </p>
                    )}
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-3">
                功能导航
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 transition-all duration-300 rounded-xl mb-1 p-3 ${
                          location.pathname === item.url || (item.url !=='/' && location.pathname.startsWith(item.url))
                            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-sm border border-emerald-200/50' 
                            : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <div>
                            <span className="font-semibold text-sm">{item.title}</span>
                            <p className="text-xs opacity-70">{item.description}</p>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-3">
                系统信息
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">患者记录</p>
                      <p className="text-xs text-slate-500">实时同步数据</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">系统状态</p>
                      <p className="text-xs text-emerald-600 font-medium">正常运行</p>
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                <span className="text-slate-600 font-bold text-sm">{user?.userName?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{user?.userName || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">腰痛门诊数据管理</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 text-slate-400 hover:text-red-500"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          {/* 移动端头部 */}
          <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 md:hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200 -ml-2" />
                <Link to={createPageUrl("index")} className="flex items-center gap-2 min-w-0">
                  <Stethoscope className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <h1 className="text-lg font-bold text-slate-800 truncate">腰痛门诊</h1>
                </Link>
              </div>
            </div>
          </header>

          {/* 主内容区域 */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
