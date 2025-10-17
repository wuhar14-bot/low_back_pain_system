import React from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function StatsCards({ title, value, icon: Icon, bgColor, trend }) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-gradient-to-r ${bgColor} rounded-full opacity-10`} />
      <CardHeader className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <CardTitle className="text-2xl md:text-3xl font-bold mt-2 text-slate-800">
              {value}
            </CardTitle>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-r ${bgColor} bg-opacity-20`}>
            <Icon className={`w-5 h-5 text-white`} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" />
            <span className="text-slate-600 font-medium">{trend}</span>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}