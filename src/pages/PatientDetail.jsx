import React, { useState, useEffect } from "react";
import { Patient } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Phone, Calendar, Activity, AlertTriangle, FileText, Edit, Trash2 } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

import PatientDetailInfo from "../components/patient-detail/PatientDetailInfo";
import MedicalHistoryDetail from "../components/patient-detail/MedicalHistoryDetail";
import ExaminationResults from "../components/patient-detail/ExaminationResults";
import TreatmentPlan from "../components/patient-detail/TreatmentPlan";

export default function PatientDetail() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('id');

  const handleEdit = () => {
    // Navigate to PatientForm with patient ID for editing
    navigate(createPageUrl("PatientForm") + `?id=${patientId}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await Patient.delete(patientId);
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("删除患者失败:", error);
      alert("删除失败，请重试");
    }
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const loadPatient = async () => {
    if (!patientId) {
      navigate(createPageUrl("Dashboard"));
      return;
    }

    setIsLoading(true);
    try {
      const patients = await Patient.list();
      const foundPatient = patients.find(p => p.id === patientId);
      if (foundPatient) {
        setPatient(foundPatient);
      } else {
        navigate(createPageUrl("Dashboard"));
      }
    } catch (error) {
      console.error("加载患者信息失败:", error);
      navigate(createPageUrl("Dashboard"));
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">加载患者信息中...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-slate-600">未找到患者信息</p>
            <Button 
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="mt-4"
            >
              返回列表
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPainLevelColor = (score) => {
    if (score >= 7) return "bg-red-100 text-red-800 border-red-200";
    if (score >= 4) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const hasRedFlags = (patient) => {
    const flags = patient.red_flags || {};
    return Object.values(flags).some(flag => flag === true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">患者详情</h1>
              <p className="text-slate-600 mt-1">完整的腰痛评估记录</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              编辑
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </Button>
          </div>
        </div>

        {/* 删除确认对话框 */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除患者 {patient?.study_id} 的记录吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "删除中..." : "确认删除"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 患者概览卡片 */}
        <Card className="mb-8 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{patient.study_id}</h2>
                  <div className="flex items-center gap-4 text-slate-600 mt-1">
                    <div className="flex items-center gap-1">
                      <span>{patient.age}岁</span>
                      <span>•</span>
                      <span>{patient.gender}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{patient.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {patient.pain_score !== undefined && (
                  <Badge className={`${getPainLevelColor(patient.pain_score)} border font-medium px-3 py-1`}>
                    <Activity className="w-3 h-3 mr-1" />
                    疼痛评分: {patient.pain_score}/10
                  </Badge>
                )}
                {hasRedFlags(patient) && (
                  <Badge className="bg-red-100 text-red-800 border-red-200 px-3 py-1">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    危险信号
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>就诊时间: {format(new Date(patient.created_date), "yyyy年MM月dd日 HH:mm")}</span>
            </div>
            {patient.chief_complaint && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-blue-800">主诉:</span>
                    <p className="text-slate-700 mt-1">{patient.chief_complaint}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 详细信息模块 */}
        <div className="grid gap-6">
          <PatientDetailInfo patient={patient} />
          <MedicalHistoryDetail patient={patient} />
          <ExaminationResults patient={patient} />
          <TreatmentPlan patient={patient} />
        </div>
      </div>
    </div>
  );
}