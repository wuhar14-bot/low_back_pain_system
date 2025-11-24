import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Building2, ArrowRight } from "lucide-react";

export default function WorkspacePrompt() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4">
      <Card className="w-full max-w-lg text-center border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8 md:p-12">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
            <Building2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            请选择一个工作室
          </h2>
          <p className="text-slate-600 mb-8">
            您需要先选择或创建一个工作室才能查看患者数据或录入新信息。
          </p>
          <Link to={createPageUrl("WorkspaceManager")}>
            <Button className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold">
              前往工作室管理
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}