import React, { useState, useEffect } from "react";
import { Workspace } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  Plus, 
  Users, 
  Calendar,
  Edit,
  Trash2,
  ArrowRight 
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
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import NavigationHeader from "@/components/ui/navigation";

export default function WorkspaceManager() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
    created_by_name: ''
  });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [workspaceToEdit, setWorkspaceToEdit] = useState(null);
  const [editWorkspace, setEditWorkspace] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      const data = await Workspace.list("-created_date");
      setWorkspaces(data);
    } catch (error) {
      console.error("加载工作室失败:", error);
    }
    setIsLoading(false);
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name.trim()) {
      alert("请输入工作室名称");
      return;
    }

    try {
      const result = await Workspace.create(newWorkspace);
      console.log("工作室创建成功:", result);
      setShowCreateDialog(false);
      setNewWorkspace({ name: '', description: '', created_by_name: '' });
      await loadWorkspaces(); // Ensure workspaces are reloaded
      alert("工作室创建成功！");
    } catch (error) {
      console.error("创建工作室失败:", error);
      alert("创建工作室失败，请重试。错误详情: " + (error.message || "未知错误"));
    }
  };

  const openEditDialog = (workspace) => {
    setWorkspaceToEdit(workspace);
    setEditWorkspace({
      name: workspace.name,
      description: workspace.description || ''
    });
    setShowEditDialog(true);
  };

  const handleEditWorkspace = async () => {
    if (!editWorkspace.name.trim()) {
      alert("请输入工作室名称");
      return;
    }
    try {
      const result = await Workspace.update(workspaceToEdit.id, editWorkspace);
      console.log("工作室更新成功:", result);
      setShowEditDialog(false);
      setWorkspaceToEdit(null);
      setEditWorkspace({ name: '', description: '' });
      await loadWorkspaces();
      alert("工作室更新成功！");
    } catch (error) {
      console.error("更新工作室失败:", error);
      alert("更新工作室失败，请重试。错误详情: " + (error.message || "未知错误"));
    }
  };

  const handleDeleteWorkspace = async () => {
    if (workspaceToDelete) {
      try {
        const result = await Workspace.delete(workspaceToDelete.id);
        console.log("工作室删除成功:", result);
        setWorkspaceToDelete(null);
        await loadWorkspaces(); // Ensure workspaces are reloaded
        alert("工作室删除成功！");
      } catch (error) {
        console.error("删除工作室失败:", error);
        alert("删除工作室失败，请重试。错误详情: " + (error.message || "未知错误"));
        setWorkspaceToDelete(null); // Close the dialog even if deletion failed
      }
    }
  };

  const enterWorkspace = (workspaceId) => {
    localStorage.setItem('currentWorkspaceId', workspaceId);
    navigate(createPageUrl("Dashboard"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <NavigationHeader title="工作室管理" />
      <div className="max-w-6xl mx-auto p-4">
        {/* 头部 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-slate-800">工作室管理</h1>
            </div>
            <p className="text-slate-600">管理您的腰痛评估工作室，每个工作室的数据独立管理</p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                新建工作室
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>创建新工作室</DialogTitle>
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
                    placeholder="请输入您的姓名"
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
                    创建工作室
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 工作室列表 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">还没有工作室</h3>
              <p className="text-slate-500 mb-6">创建您的第一个工作室开始管理患者数据</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                创建工作室
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <Card key={workspace.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-slate-800">{workspace.name}</CardTitle>
                        <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                          活跃工作室
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => openEditDialog(workspace)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setWorkspaceToDelete(workspace)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workspace.description && (
                    <p className="text-slate-600 text-sm">{workspace.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm text-slate-500">
                    {workspace.created_by_name && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>创建者: {workspace.created_by_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>创建时间: {format(new Date(workspace.created_date), "yyyy年MM月dd日")}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                    onClick={() => enterWorkspace(workspace.id)}
                  >
                    进入工作室
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 编辑工作室弹窗 */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>编辑工作室</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-workspace-name">工作室名称 *</Label>
                <Input
                  id="edit-workspace-name"
                  value={editWorkspace.name}
                  onChange={(e) => setEditWorkspace({...editWorkspace, name: e.target.value})}
                  placeholder="请输入工作室名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-workspace-description">工作室描述</Label>
                <Textarea
                  id="edit-workspace-description"
                  value={editWorkspace.description}
                  onChange={(e) => setEditWorkspace({...editWorkspace, description: e.target.value})}
                  placeholder="请输入工作室描述（可选）"
                  className="min-h-[80px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                取消
              </Button>
              <Button
                onClick={handleEditWorkspace}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                保存
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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