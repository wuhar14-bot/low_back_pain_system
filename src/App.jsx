import './App.css'
import Home from "@/pages/index.jsx"
import PatientForm from "@/pages/PatientForm.jsx"
import Dashboard from "@/pages/Dashboard.jsx"
import AdminPanel from "@/pages/AdminPanel.jsx"
import WorkspaceManager from "@/pages/WorkspaceManager.jsx"
import PatientDetail from "@/pages/PatientDetail.jsx"
import Login from "@/pages/Login.jsx"
import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/index" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/patientform" element={
            <ProtectedRoute>
              <PatientForm />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/adminpanel" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/workspacemanager" element={
            <ProtectedRoute>
              <WorkspaceManager />
            </ProtectedRoute>
          } />
          <Route path="/patientdetail/*" element={
            <ProtectedRoute>
              <PatientDetail />
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App 