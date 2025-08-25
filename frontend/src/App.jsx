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
