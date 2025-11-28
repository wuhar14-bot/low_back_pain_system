import React, { useState, useEffect } from "react";
import { Patient } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Smartphone, ArrowRight, List, Play, Image, Loader2 } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { UploadFile, InvokeLLM } from "@/api/integrations";

import PainAreaSection from "../components/patient-form/PainAreaSection";
import BasicInfoSection from "../components/patient-form/BasicInfoSection";
import MedicalHistorySection from "../components/patient-form/MedicalHistorySection";
import SubjectiveExamSection from "../components/patient-form/SubjectiveExamSection";
import ObjectiveExamSection from "../components/patient-form/ObjectiveExamSection";
import FunctionalScoreSection from "../components/patient-form/FunctionalScoreSection";
import InterventionSection from "../components/patient-form/InterventionSection";
import WorkspacePrompt from "../components/prompts/WorkspacePrompt";
import PatientFormCatalog from "../components/patient-form/PatientFormCatalog";
import ImageUploadModal from "../components/patient-form/ImageUploadModal";
import NavigationHeader from "@/components/ui/navigation";

const SECTIONS = [
  { id: 'basic', title: '基本信息', component: BasicInfoSection, required: true },
  { id: 'history', title: '病史资料', component: MedicalHistorySection, required: false },
  { id: 'pain_areas', title: '疼痛区域选择', component: PainAreaSection, required: true },
  { id: 'subjective', title: '主观检查', component: SubjectiveExamSection, required: false },
  { id: 'objective', title: '客观检查', component: ObjectiveExamSection, required: false },
  { id: 'functional', title: '功能评分', component: FunctionalScoreSection, required: false },
  { id: 'intervention', title: '干预建议', component: InterventionSection, required: false }
];

export default function PatientForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [patientId, setPatientId] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [completedSections, setCompletedSections] = useState(new Set());
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [syncInterval, setSyncInterval] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const id = urlParams.get('id');
    let workspaceId = localStorage.getItem('currentWorkspaceId');

    // If auth is disabled and no workspace ID exists, use a test workspace
    if (!workspaceId && import.meta.env.VITE_DISABLE_AUTH === 'true') {
      workspaceId = 'test-workspace';
      localStorage.setItem('currentWorkspaceId', workspaceId);
    }

    setCurrentWorkspaceId(workspaceId);

    if (id) {
      setPatientId(id);
      loadPatient(id);
      setShowWelcome(false);
      startSync(id);
    } else {
      setIsLoading(false);
    }

    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
        setSyncInterval(null);
      }
    };
  }, [location.search, syncInterval]);

  const startSync = (patientId) => {
    if (syncInterval) {
      clearInterval(syncInterval);
    }

    const interval = setInterval(async () => {
      try {
        const patients = await Patient.list();
        const currentPatient = patients.find(p => p.id === patientId);

        if (currentPatient && currentPatient.last_sync_timestamp) {
          const lastSyncRemote = new Date(currentPatient.last_sync_timestamp);
          const lastSyncLocal = formData.last_sync_timestamp ? new Date(formData.last_sync_timestamp) : null;

          if (!lastSyncLocal || lastSyncRemote.getTime() > lastSyncLocal.getTime()) {
            console.log("检测到远程更新，正在同步本地数据...");
            setFormData(currentPatient);
            updateCompletedSections(currentPatient);
          }
        }
      } catch (error) {
        console.error("同步失败:", error);
      }
    }, 3000);

    setSyncInterval(interval);
  };

  const loadPatient = async (id) => {
    setIsLoading(true);
    try {
      const patients = await Patient.list();
      const patientToEdit = patients.find(p => p.id === id);
      if (patientToEdit) {
        setFormData(patientToEdit);
        updateCompletedSections(patientToEdit);
      } else {
        console.warn(`Patient with ID ${id} not found.`);
        navigate(createPageUrl("PatientForm"), { replace: true });
      }
    } catch (error) {
      console.error("加载患者数据失败:", error);
      alert("加载患者数据失败，请重试。");
      navigate(createPageUrl("PatientForm"), { replace: true });
    }
    setIsLoading(false);
  };

  const updateFormData = (sectionData) => {
    const updatedData = { ...formData, ...sectionData };
    updatedData.last_sync_timestamp = new Date().toISOString();
    setFormData(updatedData);
    setCompletedSections(prev => new Set([...prev, SECTIONS[currentSection].id]));

    if (patientId) {
      autoSave(updatedData);
    }
  };

  const autoSave = async (data) => {
    try {
      await Patient.update(patientId, {
        ...data,
        workspace_id: currentWorkspaceId
      });
    } catch (error) {
      console.error("自动保存失败:", error);
    }
  };

  const updateCompletedSections = (patientData) => {
    const completed = new Set();
    SECTIONS.forEach(section => {
      if (section.id === 'pain_areas' && patientData.pain_areas && Object.values(patientData.pain_areas).some(Boolean)) {
        completed.add(section.id);
      } else if (section.id === 'basic' && patientData.study_id) {
        completed.add(section.id);
      } else if (section.id !== 'basic' && section.id !== 'pain_areas') {
        const formKeys = Object.keys(patientData);
        if (formKeys.some(key => {
          const value = patientData[key];
          if (value === undefined || value === null) return false;
          if (typeof value === 'string' && value.trim() === '') return false;
          if (Array.isArray(value) && value.length === 0) return false;
          if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
          return true;
        })) {
          completed.add(section.id);
        }
      }
    });
    setCompletedSections(completed);
  };

  const sanitizeAIData = (data) => {
    const sanitized = { ...data };
    const numericFields = [
      'age', 'pain_score', 'sitting_tolerance', 'standing_tolerance',
      'walking_tolerance', 'rmdq_score', 'ndi_score'
    ];

    numericFields.forEach(field => {
      if (sanitized[field] !== undefined && sanitized[field] !== null) {
        const value = String(sanitized[field]).trim();
        if(value === '') {
            delete sanitized[field];
            return;
        }
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed)) {
          sanitized[field] = parsed;
        } else {
          delete sanitized[field];
        }
      }
    });

    const booleanFields = ['has_radiation'];
    booleanFields.forEach(field => {
        if(sanitized[field] !== undefined) {
            sanitized[field] = !!sanitized[field];
        }
    });

    const nestedBooleanObjects = ['red_flags', 'cervical_function_problems', 'interventions', 'recommendations'];
    nestedBooleanObjects.forEach(objKey => {
        const value = sanitized[objKey];
        if(value && typeof value === 'object' && !Array.isArray(value)) {
            Object.keys(value).forEach(innerKey => {
                value[innerKey] = !!value[innerKey];
            });
        } else {
            delete sanitized[objKey];
        }
    });

    return sanitized;
  };

  const handleDataExtracted = (extractedData) => {
    try {
      if (!extractedData || typeof extractedData !== 'object') {
        console.warn('提取的数据格式不正确:', extractedData);
        alert('数据格式错误，请重试或联系管理员');
        return;
      }

      const sanitizedData = sanitizeAIData(extractedData);
      sanitizedData.last_sync_timestamp = new Date().toISOString();
      setFormData(prev => ({ ...prev, ...sanitizedData }));

      const completed = new Set();
      SECTIONS.forEach(section => {
        if (section.id === 'pain_areas' && sanitizedData.pain_areas && Object.values(sanitizedData.pain_areas).some(Boolean)) {
          completed.add(section.id);
        } else if (section.id === 'basic' && (sanitizedData.name || sanitizedData.age || sanitizedData.gender || sanitizedData.phone || sanitizedData.study_id)) {
          completed.add(section.id);
        } else if (section.id === 'history' && (sanitizedData.chief_complaint || sanitizedData.pain_type || sanitizedData.aggravating_factors || sanitizedData.relieving_factors)) {
          completed.add(section.id);
        } else if (section.id === 'subjective' && (sanitizedData.pain_score || sanitizedData.has_radiation || sanitizedData.sitting_tolerance)) {
          completed.add(section.id);
        } else if (section.id === 'objective' && (sanitizedData.cervical_posture || sanitizedData.lumbar_posture || sanitizedData.distal_pulse)) {
          completed.add(section.id);
        } else if (section.id === 'functional' && (sanitizedData.rmdq_score || sanitizedData.ndi_score)) {
          completed.add(section.id);
        } else if (section.id === 'intervention' && sanitizedData.remarks) {
          completed.add(section.id);
        }
      });

      setCompletedSections(completed);
      setShowWelcome(false);
      setCurrentSection(0);

      if (patientId) {
        autoSave({ ...formData, ...sanitizedData });
      }
    } catch (error) {
      console.error('处理提取数据时出错:', error);
      alert('处理数据时出现错误，请重试或联系管理员');
    }
  };

  const handleNext = () => {
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSectionSelect = (sectionIndex) => {
    setCurrentSection(sectionIndex);
    setShowCatalog(false);
  };

  const handleStepClick = (stepIndex) => {
    setCurrentSection(stepIndex);
  };

  const isBasicInfoValid = () => {
    const requiredFields = ['study_id', 'age', 'gender'];
    for (const field of requiredFields) {
      if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!currentWorkspaceId) {
      alert("提交失败：未找到工作室信息。请从主系统重新进入本系统。");
      return;
    }

    const requiredFields = {
      study_id: "Study ID",
      age: "年龄",
      gender: "性别"
    };

    const missingFields = [];
    for (const [field, displayName] of Object.entries(requiredFields)) {
      if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
        missingFields.push(displayName);
      }
    }

    if (missingFields.length > 0) {
      alert(`请填写以下必填字段：${missingFields.join(', ')}`);
      setCurrentSection(0);
      setShowCatalog(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        workspace_id: currentWorkspaceId,
        last_sync_timestamp: new Date().toISOString()
      };

      console.log("提交的数据:", dataToSubmit);

      if (patientId) {
        await Patient.update(patientId, dataToSubmit);
      } else {
        await Patient.create(dataToSubmit);
      }
      setIsSuccess(true);
    } catch (error) {
      console.error("提交失败详细错误:", error);

      let errorMessage = "提交失败：";
      if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "未知错误，请检查网络连接或联系管理员。";
      }

      if (error.message && error.message.includes("validation")) {
        errorMessage += "\n\n请检查：\n1. Study ID是否填写\n2. 年龄是否为有效数字\n3. 性别是否已选择";
      }

      alert(errorMessage);
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setPatientId(null);
    setFormData({});
    setCurrentSection(0);
    setIsSuccess(false);
    setCompletedSections(new Set());
    setShowWelcome(true);
    setShowCatalog(false);
    if (syncInterval) {
      clearInterval(syncInterval);
      setSyncInterval(null);
    }
    navigate(createPageUrl("PatientForm"), { replace: true });
  };

  const startDataCollection = () => {
    setShowWelcome(false);
    setCurrentSection(0);
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              {patientId ? '更新成功！' : '提交成功！'}
            </h2>
            <p className="text-slate-600 mb-8">
              患者信息已成功保存，医生可以在工作台查看相关数据。
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={resetForm}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3"
              >
                {patientId ? '继续编辑' : '录入新患者'}
              </Button>
              <Link to={createPageUrl("Dashboard")} className="flex-1">
                <Button variant="outline" className="w-full py-3">
                  返回工作台
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCatalog) {
    return (
      <PatientFormCatalog
        sections={SECTIONS}
        completedSections={completedSections}
        currentSection={currentSection}
        onSectionSelect={handleSectionSelect}
        onBack={() => setShowCatalog(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        hasBasicInfo={isBasicInfoValid()}
      />
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <NavigationHeader title="患者数据收集" />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-3.5rem)]">
          <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-4">患者数据收集</h1>
              <p className="text-slate-600 text-lg">
                欢迎使用腰痛门诊数据收集系统，请按照以下模块收集患者信息
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {SECTIONS.map((section, index) => (
                <div key={section.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    section.required
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{section.title}</h3>
                    {section.required && (
                      <span className="text-xs text-emerald-600 font-medium">必填模块</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={startDataCollection}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-8 py-3 text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  开始数据收集
                </Button>

                <Button
                  onClick={() => setShowImageUpload(true)}
                  variant="outline"
                  className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 px-4 py-3 text-lg font-semibold"
                >
                  <Image className="w-5 h-5 mr-2" />
                  上传图片录入
                </Button>

              </div>

              <p className="text-sm text-slate-500">
                💡 提示：可上传病历截图，AI将自动识别并填写表单
              </p>
            </div>
          </CardContent>
        </Card>

        <ImageUploadModal
          isOpen={showImageUpload}
          onClose={() => setShowImageUpload(false)}
          onDataExtracted={handleDataExtracted}
        />
      </div>
      </div>
    );
  }

  const CurrentSectionComponent = SECTIONS[currentSection].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <NavigationHeader title="患者数据收集" />
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-slate-800">
                {patientId ? '编辑患者信息' : '患者信息收集'}
              </h1>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex items-center gap-2 mb-2 min-w-max">
                {SECTIONS.map((section, index) => (
                  <React.Fragment key={index}>
                    <button
                      onClick={() => handleStepClick(index)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 flex-shrink-0 hover:scale-110 ${
                        completedSections.has(section.id)
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:from-green-600 hover:to-emerald-600'
                          : index === currentSection
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:from-emerald-600 hover:to-teal-600'
                          : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                      }`}
                    >
                      {completedSections.has(section.id) ? '✓' : index + 1}
                    </button>
                    {index < SECTIONS.length - 1 && (
                      <div className={`flex-1 h-1 rounded transition-colors duration-300 ${
                        completedSections.has(section.id) ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-slate-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-600">
              第 {currentSection + 1} 步，共 {SECTIONS.length} 步 - {SECTIONS[currentSection].title}
              {SECTIONS[currentSection].required && <span className="text-emerald-600 font-medium"> (必填)</span>}
            </p>
          </div>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-xl text-slate-800">
                {SECTIONS[currentSection].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <CurrentSectionComponent
                formData={formData}
                updateFormData={updateFormData}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              上一步
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCatalog(true)}
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              >
                <List className="w-4 h-4 mr-2" />
                目录
              </Button>

              {currentSection === SECTIONS.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isBasicInfoValid()}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-8"
                >
                  {isSubmitting ? "提交中..." : (patientId ? '更新信息' : '完成提交')}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold"
                >
                  下一步
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}