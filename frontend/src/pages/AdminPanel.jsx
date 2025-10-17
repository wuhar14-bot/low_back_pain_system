import React, { useState, useEffect } from "react";
import { Workspace } from "@/api/entities";
import { Patient } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Plus, 
  Building2,
  Users, 
  Calendar,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Activity,
  BarChart3,
  Download
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminPanel() {
  const [workspaces, setWorkspaces] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
    created_by_name: '',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [workspacesData, patientsData] = await Promise.all([
        Workspace.list("-created_date"),
        Patient.list("-created_date")
      ]);
      setWorkspaces(workspacesData);
      setPatients(patientsData);
    } catch (error) {
      console.error("加载数据失败:", error);
    }
    setIsLoading(false);
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name.trim()) {
      alert("请输入工作室名称");
      return;
    }

    try {
      if (editingWorkspace) {
        await Workspace.update(editingWorkspace.id, newWorkspace);
      } else {
        await Workspace.create(newWorkspace);
      }
      
      setShowCreateDialog(false);
      setEditingWorkspace(null);
      setNewWorkspace({ name: '', description: '', created_by_name: '', is_active: true });
      loadData();
    } catch (error) {
      console.error("操作工作室失败:", error);
      alert("操作失败，请重试");
    }
  };

  const handleEditWorkspace = (workspace) => {
    setEditingWorkspace(workspace);
    setNewWorkspace({
      name: workspace.name,
      description: workspace.description || '',
      created_by_name: workspace.created_by_name || '',
      is_active: workspace.is_active
    });
    setShowCreateDialog(true);
  };

  const handleDeleteWorkspace = async () => {
    if (workspaceToDelete) {
      try {
        await Workspace.delete(workspaceToDelete.id);
        setWorkspaceToDelete(null);
        loadData();
      } catch (error) {
        console.error("删除工作室失败:", error);
        alert("删除工作室失败，请重试");
      }
    }
  };

  const toggleWorkspaceStatus = async (workspace) => {
    try {
      await Workspace.update(workspace.id, { 
        ...workspace, 
        is_active: !workspace.is_active 
      });
      loadData();
    } catch (error) {
      console.error("更新工作室状态失败:", error);
      alert("更新状态失败，请重试");
    }
  };

  const getWorkspaceStats = (workspaceId) => {
    const workspacePatients = patients.filter(p => p.workspace_id === workspaceId);
    const today = new Date();
    const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const recentPatients = workspacePatients.filter(p => new Date(p.created_date) > oneDayAgo);
    
    return {
      totalPatients: workspacePatients.length,
      recentPatients: recentPatients.length
    };
  };

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (workspace.created_by_name && workspace.created_by_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeWorkspaces = workspaces.filter(w => w.is_active).length;
  const totalPatients = patients.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 头部导航 */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("index")}>
            <Button variant="outline" size="icon" className="hover:bg-slate-100">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-slate-800">管理后台</h1>
            </div>
            <p className="text-slate-600">系统管理、工作室管理、数据统计</p>
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-500">工作室总数</p>
                  <p className="text-2xl font-bold text-slate-800">{workspaces.length}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-500">活跃工作室</p>
                  <p className="text-2xl font-bold text-slate-800">{activeWorkspaces}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-500">患者总数</p>
                  <p className="text-2xl font-bold text-slate-800">{totalPatients}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-500">平均患者数</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {activeWorkspaces > 0 ? Math.round(totalPatients / activeWorkspaces) : 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* 工作室管理 */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-xl font-bold text-slate-800">工作室管理</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Input
                  placeholder="搜索工作室..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64"
                />
                <Dialog open={showCreateDialog} onOpenChange={(open) => {
                  setShowCreateDialog(open);
                  if (!open) {
                    setEditingWorkspace(null);
                    setNewWorkspace({ name: '', description: '', created_by_name: '', is_active: true });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      新建工作室
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingWorkspace ? '编辑工作室' : '创建新工作室'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="workspace-name">工作室名称 *</Label>
                        <Input
                          id="workspace-name"
                          value={newWorkspace.name}
                          onChange={(e) => setNewWorkspace({...newWorkspace, name: e.target.value})}
                          placeholder="请输入工作室名称"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="creator-name">创建者姓名</Label>
                        <Input
                          id="creator-name"
                          value={newWorkspace.created_by_name}
                          onChange={(e) => setNewWorkspace({...newWorkspace, created_by_name: e.target.value})}
                          placeholder="请输入创建者姓名"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="workspace-desc">工作室描述</Label>
                        <Textarea
                          id="workspace-desc"
                          value={newWorkspace.description}
                          onChange={(e) => setNewWorkspace({...newWorkspace, description: e.target.value})}
                          placeholder="请描述这个工作室的用途"
                          className="h-20"
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                          取消
                        </Button>
                        <Button onClick={handleCreateWorkspace}>
                          {editingWorkspace ? '更新' : '创建'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse p-6 bg-slate-100 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-48"></div>
                        <div className="h-3 bg-slate-200 rounded w-32"></div>
                      </div>
                      <div className="h-6 bg-slate-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredWorkspaces.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                {searchTerm ? "未找到匹配的工作室" : "暂无工作室"}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredWorkspaces.map((workspace) => {
                  const stats = getWorkspaceStats(workspace.id);
                  return (
                    <div key={workspace.id} className="p-6 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Building2 className="w-5 h-5 text-slate-600" />
                            <h3 className="text-lg font-semibold text-slate-800">{workspace.name}</h3>
                            <Badge className={workspace.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}>
                              {workspace.is_active ? "活跃" : "停用"}
                            </Badge>
                          </div>
                          
                          {workspace.description && (
                            <p className="text-slate-600 mb-3">{workspace.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            {workspace.created_by_name && (
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>创建者: {workspace.created_by_name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>创建于: {format(new Date(workspace.created_date), "yyyy年MM月dd日")}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="w-4 h-4" />
                              <span>患者数: {stats.totalPatients} (24h新增: {stats.recentPatients})</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleWorkspaceStatus(workspace)}
                            className={workspace.is_active ? "text-orange-600 hover:text-orange-700" : "text-emerald-600 hover:text-emerald-700"}
                          >
                            {workspace.is_active ? "停用" : "启用"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditWorkspace(workspace)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setWorkspaceToDelete(workspace)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            删除
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 删除确认弹窗 */}
        <AlertDialog open={!!workspaceToDelete} onOpenChange={(isOpen) => { if(!isOpen) setWorkspaceToDelete(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除工作室</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要删除工作室 "{workspaceToDelete?.name}" 吗？此操作将删除该工作室内的所有患者数据，且无法恢复。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setWorkspaceToDelete(null)}>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteWorkspace} className="bg-red-600 hover:bg-red-700 text-white">
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}