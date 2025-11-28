import './App.css'
import Home from "@/pages/index.jsx"
import PatientForm from "@/pages/PatientForm.jsx"
import Dashboard from "@/pages/Dashboard.jsx"
import PatientDetail from "@/pages/PatientDetail.jsx"
import Login from "@/pages/Login.jsx"
import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { ExternalProvider } from "@/contexts/ExternalContext"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <ExternalProvider>
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
          <Route path="/patientdetail/*" element={
            <ProtectedRoute>
              <PatientDetail />
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster />
        </BrowserRouter>
      </ExternalProvider>
    </AuthProvider>
  )
}

export default App 