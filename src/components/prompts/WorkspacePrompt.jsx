import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, AlertCircle } from "lucide-react";

export default function WorkspacePrompt() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4">
      <Card className="w-full max-w-lg text-center border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8 md:p-12">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            缺少工作室信息
          </h2>
          <p className="text-slate-600 mb-4">
            本系统需要从主系统访问，以获取工作室和医生信息。
          </p>
          <p className="text-sm text-slate-500 mb-8">
            请返回主系统，通过正确的入口进入本系统。
          </p>
          <Button
            onClick={() => window.history.back()}
            className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold"
          >
            返回上一页
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}