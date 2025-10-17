
import React from 'react';
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, Calendar, Activity, AlertTriangle, Eye, Trash2, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PatientList({ patients, isLoading, searchTerm, onDeleteClick }) {
  const getPainLevelColor = (score) => {
    if (score >= 7) return "bg-red-100 text-red-800 border-red-200";
    if (score >= 4) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getPainLevelText = (score) => {
    if (score >= 7) return "重度疼痛";
    if (score >= 4) return "中度疼痛";
    return "轻度疼痛";
  };

  const hasRedFlags = (patient) => {
    const flags = patient.red_flags || {};
    return Object.values(flags).some(flag => flag === true);
  };

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader className="p-6 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-slate-800">患者列表</CardTitle>
          <div className="text-sm text-slate-500">
            {searchTerm ? `搜索结果: ${patients.length} 位患者` : `共 ${patients.length} 位患者`}
          </div>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold text-slate-700">患者信息</TableHead>
              <TableHead className="font-semibold text-slate-700">疼痛评分</TableHead>
              <TableHead className="font-semibold text-slate-700">就诊时间</TableHead>
              <TableHead className="font-semibold text-slate-700">状态标记</TableHead>
              <TableHead className="font-semibold text-slate-700">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="wait">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    {searchTerm ? "未找到匹配的患者记录" : "暂无患者记录"}
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <motion.tr
                    key={patient.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{patient.study_id}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            {patient.phone && (
                              <>
                                <Phone className="w-3 h-3" />
                                <span>{patient.phone}</span>
                              </>
                            )}
                            {!patient.phone && (
                              <span className="text-slate-400">未填写电话</span>
                            )}
                          </div>
                          {patient.chief_complaint && (
                            <p className="text-xs text-slate-400 truncate max-w-xs">
                              {patient.chief_complaint}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {patient.pain_score !== undefined ? (
                        <Badge className={`${getPainLevelColor(patient.pain_score)} border font-medium`}>
                          <Activity className="w-3 h-3 mr-1" />
                          {patient.pain_score}/10 - {getPainLevelText(patient.pain_score)}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-sm">未记录</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Calendar className="w-3 h-3" />
                        <span className="text-sm">
                          {format(new Date(patient.created_date), "yyyy年MM月dd日 HH:mm")}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-1">
                        {hasRedFlags(patient) && (
                          <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            危险信号
                          </Badge>
                        )}
                        {patient.age && patient.age >= 65 && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                            高龄
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-2">
                        <Link to={createPageUrl(`PatientDetail?id=${patient.id}`)}>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            查看
                          </Button>
                        </Link>
                         <Link to={createPageUrl(`PatientForm?id=${patient.id}`)}>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            编辑
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                          onClick={() => onDeleteClick(patient)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
