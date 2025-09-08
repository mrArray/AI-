import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TemplateBrowse from './pages/TemplateBrowse'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'
import DocumentTypesetting from './pages/DocumentTypesetting'
import PricingPage from './pages/PricingPage'
import PointsRechargeModal from './components/PointsRechargeModal'
import AuthModal from './components/AuthModal'
import LandingPage from './pages/LandingPage'
import FormatDocumentPage from './pages/FormatDocumentPage'

// Admin components

import DashboardLayout from './components/admin/DashboardLayout'
import Overview from './pages/admin/Overview'
import LLMProviders from './pages/admin/LLMProviders'
import LLMModels from './pages/admin/LLMModels'
import PromptTemplates from './pages/admin/PromptTemplates'
import SystemConfig from './pages/admin/SystemConfig'
import CreateProvider from './pages/admin/CreateProvider'
import ProtectedRoute from './components/ProtectedRoute';
import BillingPackages from './pages/admin/BillingPackages'
import FormatCreditPrice from './pages/admin/FormatCreditPrice'


function App() {
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/typesetting" element={<DocumentTypesetting />} />
        <Route path="/templates" element={<TemplateBrowse />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/format-document" element={<FormatDocumentPage />} />
        
        {/* 个人中心页面 */}
        <Route path="/profile" element={<ProfilePage />} />


        {/* Admin Dashboard Routes - Protected */}
        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="providers" element={<LLMProviders />} />
            <Route path="providers/new" element={<CreateProvider />} />
            <Route path="models" element={<LLMModels />} />
            <Route path="templates" element={<PromptTemplates />} />
            <Route path="config" element={<SystemConfig />} />
            <Route path="billing-packages" element={<BillingPackages />} />
            <Route path="format-credit-prices" element={<FormatCreditPrice />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
              {/* 全局积分充值弹窗 */}
        <PointsRechargeModal 
          isOpen={showRechargeModal} 
          onClose={() => setShowRechargeModal(false)} 
        />
        
        {/* 全局登录注册弹窗 */}
        <AuthModal />
      </div>
  )
}

export default App
