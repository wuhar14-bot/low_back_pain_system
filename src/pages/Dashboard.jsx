import React, { useState, useEffect } from "react";
import { Patient } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  Users,
  Activity,
  Calendar,
  Search,
  Filter,
  Eye,
  Phone,
  AlertTriangle,
  Download,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Home
} from "lucide-react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import StatsCards from "../components/dashboard/StatsCards";
import PatientList from "../components/dashboard/PatientList";
import WorkspacePrompt from "../components/prompts/WorkspacePrompt";

export default function Dashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const workspaceId = localStorage.getItem('currentWorkspaceId');
    setCurrentWorkspaceId(workspaceId);

    const isAuthDisabled = import.meta.env.VITE_DISABLE_AUTH === 'true';
    if (isAuthDisabled || workspaceId) {
      loadPatients(workspaceId);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    filterPatients();
    setCurrentPage(1); // Reset to first page when filters change
  }, [patients, searchTerm, filterType]);

  const loadPatients = async (workspaceId) => {
    setIsLoading(true);
    try {
      const allPatients = await Patient.list("-created_date");
      // 认证禁用时显示所有患者，否则按 workspace 过滤
      const isAuthDisabled = import.meta.env.VITE_DISABLE_AUTH === 'true';
      const displayPatients = isAuthDisabled
        ? allPatients
        : allPatients.filter(p => p.workspace_id === workspaceId);
      setPatients(displayPatients);
    } catch (error) {
      console.error("加载患者数据失败:", error);
    }
    setIsLoading(false);
  };

  const filterPatients = () => {
    let filtered = patients;

    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.study_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm) ||
        patient.chief_complaint?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      switch (filterType) {
        case "high_pain":
          filtered = filtered.filter(patient => (patient.pain_score || 0) >= 7);
          break;
        case "red_flags":
          filtered = filtered.filter(patient => {
            const flags = patient.red_flags || {};
            return Object.values(flags).some(flag => flag === true);
          });
          break;
        case "recent":
          const today = new Date();
          const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
          filtered = filtered.filter(patient => 
            new Date(patient.created_date) > oneDayAgo
          );
          break;
      }
    }

    setFilteredPatients(filtered);
  };

  const handleDeleteRequest = (patient) => {
    setPatientToDelete(patient);
  };

  const confirmDelete = async () => {
    if (patientToDelete) {
      try {
        await Patient.delete(patientToDelete.id);
        setPatientToDelete(null);
        if (currentWorkspaceId) {
          await loadPatients(currentWorkspaceId);
        }
      } catch (error) {
        console.error("删除患者失败:", error);
        alert("删除患者失败，请重试");
      }
    }
  };

  const getHighPainCount = () => {
    return patients.filter(p => (p.pain_score || 0) >= 7).length;
  };

  const getRedFlagsCount = () => {
    return patients.filter(p => {
      const flags = p.red_flags || {};
      return Object.values(flags).some(flag => flag === true);
    }).length;
  };

  const getAveragePainScore = () => {
    const totalScore = patients.reduce((sum, p) => sum + (p.pain_score || 0), 0);
    return patients.length > 0 ? (totalScore / patients.length).toFixed(1) : 0;
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const exportData = patients.map(patient => ({
        '研究编号': patient.study_id || '',
        '年龄': patient.age || '',
        '性别': patient.gender || '',
        '联系电话': patient.phone || '',
        '主诉': patient.chief_complaint || '',
        '现病史类型': patient.history_type || '',
        '初次发作日期': patient.first_onset_date ? format(new Date(patient.first_onset_date), "yyyy-MM-dd") : '',
        '疼痛类型': patient.pain_type || '',
        '加重因素': patient.aggravating_factors || '',
        '缓解因素': patient.relieving_factors || '',
        '放射痛': patient.has_radiation === true ? '有' : (patient.has_radiation === false ? '无' : ''),
        '放射位置': patient.radiation_location || '',
        '病情进展': patient.condition_progress || '',
        '疼痛评分': patient.pain_score || '',
        '坐姿耐受时间': patient.sitting_tolerance ? `${patient.sitting_tolerance}分钟` : '',
        '站立耐受时间': patient.standing_tolerance ? `${patient.standing_tolerance}分钟` : '',
        '行走耐受时间': patient.walking_tolerance ? `${patient.walking_tolerance}分钟` : '',
        '辅助工具': patient.assistive_tools || '',
        '颈椎体态': patient.cervical_posture || '',
        '腰椎体态': patient.lumbar_posture || '',
        'RMDQ评分': patient.rmdq_score || '',
        'NDI评分': patient.ndi_score !== undefined && patient.ndi_score !== null ? `${patient.ndi_score}%` : '',
        '远端脉搏': patient.distal_pulse || '',
        '就诊时间': patient.created_date ? format(new Date(patient.created_date), "yyyy-MM-dd HH:mm:ss") : ''
      }));

      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        '\ufeff' + headers.join(','),
        ...exportData.map(row => 
          headers.map(header => 
            `"${(row[header] || '').toString().replace(/"/g, '""')}"`
          ).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `患者数据_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("导出Excel失败:", error);
      alert("导出失败，请重试");
    }
    setIsExporting(false);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!currentWorkspaceId) {
    return <WorkspacePrompt />;
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Home")}>
              <Button variant="outline" size="icon" className="rounded-full">
                <Home className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Monitor className="w-8 h-8 text-emerald-600" />
                <h1 className="text-3xl font-bold text-slate-800">医生工作台</h1>
              </div>
              <p className="text-slate-600">查看和管理患者腰痛评估数据</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={exportToExcel}
              disabled={isExporting || patients.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "导出中..." : "导出Excel"}
            </Button>
            <Link to={createPageUrl("PatientForm")}>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold">
                <Users className="w-4 h-4 mr-2" />
                新增患者
              </Button>
            </Link>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCards 
            title="总患者数" 
            value={patients.length}
            icon={Users}
            bgColor="from-blue-500 to-cyan-500"
            trend={`今日新增 ${patients.filter(p => {
              const today = new Date();
              const patientDate = new Date(p.created_date);
              return patientDate.toDateString() === today.toDateString();
            }).length} 人`}
          />
          <StatsCards 
            title="高疼痛评分" 
            value={getHighPainCount()}
            icon={AlertTriangle}
            bgColor="from-red-500 to-orange-500"
            trend="疼痛评分 ≥7"
          />
          <StatsCards 
            title="危险信号" 
            value={getRedFlagsCount()}
            icon={Activity}
            bgColor="from-purple-500 to-pink-500"
            trend="需要重点关注"
          />
          <StatsCards 
            title="平均疼痛评分" 
            value={getAveragePainScore()}
            icon={Calendar}
            bgColor="from-emerald-500 to-teal-500"
            trend="0-10分制"
          />
        </div>

        {/* 搜索和过滤 */}
        <Card className="mb-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Search className="w-5 h-5" />
              搜索与筛选
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="搜索患者姓名、电话或主诉..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                  size="sm"
                >
                  全部
                </Button>
                <Button
                  variant={filterType === "recent" ? "default" : "outline"}
                  onClick={() => setFilterType("recent")}
                  size="sm"
                >
                  最近24小时
                </Button>
                <Button
                  variant={filterType === "high_pain" ? "default" : "outline"}
                  onClick={() => setFilterType("high_pain")}
                  size="sm"
                >
                  高疼痛评分
                </Button>
                <Button
                  variant={filterType === "red_flags" ? "default" : "outline"}
                  onClick={() => setFilterType("red_flags")}
                  size="sm"
                >
                  危险信号
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 患者列表 */}
        <PatientList
          patients={filteredPatients.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onDeleteClick={handleDeleteRequest}
        />

        {/* 分页控件 */}
        {filteredPatients.length > 0 && (
          <Card className="mt-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600">
                  显示 {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredPatients.length)} 条，共 {filteredPatients.length} 条记录
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-3 py-1 text-sm font-medium">
                    第 {currentPage} / {Math.ceil(filteredPatients.length / pageSize)} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredPatients.length / pageSize), prev + 1))}
                    disabled={currentPage >= Math.ceil(filteredPatients.length / pageSize)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.ceil(filteredPatients.length / pageSize))}
                    disabled={currentPage >= Math.ceil(filteredPatients.length / pageSize)}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="ml-2 px-2 py-1 text-sm border rounded-md bg-white"
                  >
                    <option value={5}>5条/页</option>
                    <option value={10}>10条/页</option>
                    <option value={20}>20条/页</option>
                    <option value={50}>50条/页</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 删除确认弹窗 */}
        <AlertDialog 
          open={!!patientToDelete} 
          onOpenChange={(isOpen) => { 
            if(!isOpen) {
              setPatientToDelete(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>您确定要删除吗？</AlertDialogTitle>
              <AlertDialogDescription>
                此操作无法撤销。这将永久删除患者 "{patientToDelete?.study_id}" 的所有评估数据。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPatientToDelete(null)}>取消</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}