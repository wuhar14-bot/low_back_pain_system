import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, ExternalLink } from 'lucide-react';

export default function Base44AuthHandler({ children }) {
  const [hasBase44Token, setHasBase44Token] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkBase44Auth();
  }, []);

  const checkBase44Auth = () => {
    // Check if we have a base44 token from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('access_token') || urlParams.get('token');
    const storedToken = localStorage.getItem('base44_access_token');

    if (urlToken) {
      localStorage.setItem('base44_access_token', urlToken);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setHasBase44Token(true);
    } else if (storedToken) {
      setHasBase44Token(true);
    } else {
      setHasBase44Token(false);
    }

    setIsChecking(false);
  };

  const handleBase44Login = () => {
    const currentUrl = encodeURIComponent(window.location.href);
    const loginUrl = `https://base44.app/login?from_url=${currentUrl}&app_id=687f33ef23f636e1a60871bd`;
    window.location.href = loginUrl;
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">检查认证状态...</p>
        </div>
      </div>
    );
  }

  if (!hasBase44Token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-orange-500 rounded-full">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              需要Base44平台认证
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center text-gray-600">
                <p className="mb-4">
                  为了使用AI分析功能，需要通过Base44平台进行认证。
                </p>
                <p className="text-sm text-gray-500">
                  点击下方按钮将跳转到Base44登录页面，登录成功后会自动返回此页面。
                </p>
              </div>

              <Button
                onClick={handleBase44Login}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                前往Base44登录
              </Button>

              <div className="text-xs text-gray-500 text-center">
                <p>登录后将能够使用：</p>
                <ul className="mt-2 space-y-1">
                  <li>• OCR图像识别</li>
                  <li>• AI医疗数据分析</li>
                  <li>• 智能数据提取</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}