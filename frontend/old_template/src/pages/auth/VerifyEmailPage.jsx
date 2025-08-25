import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AuthLayout from '../../components/layout/AuthLayout';
import AlertMessage from '../../components/shared/AlertMessage';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

// Language strings
const translations = {
  zh: {
    title: '邮箱验证',
    emailSent: '我们已向',
    checkEmail: '发送了验证码',
    enterCode: '请查收邮件并输入6位验证码',
    verificationCode: '验证码',
    codePlaceholder: '请输入6位验证码',
    verifyButton: '验证邮箱',
    noEmail: '没有收到邮件？',
    resendCode: '重新发送验证码',
    secondsRemaining: '秒后可重新发送',
    verificationSuccess: '验证成功！正在跳转到登录页面...',
    verificationFailed: '验证失败，请检查验证码是否正确',
    resendSuccess: '验证码已重新发送，请查收邮箱',
    resendFailed: '重新发送失败，请重试'
  },
  en: {
    title: 'Email Verification',
    emailSent: 'We have sent a verification code to',
    checkEmail: '',
    enterCode: 'Please check your email and enter the 6-digit code',
    verificationCode: 'Verification Code',
    codePlaceholder: 'Enter 6-digit code',
    verifyButton: 'Verify Email',
    noEmail: 'Didn\'t receive the email?',
    resendCode: 'Resend verification code',
    secondsRemaining: 'seconds until resend available',
    verificationSuccess: 'Verification successful! Redirecting to login page...',
    verificationFailed: 'Verification failed, please check your code',
    resendSuccess: 'Verification code has been resent, please check your email',
    resendFailed: 'Failed to resend code, please try again'
  }
};

const VerifyEmailPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get('email');
  
  const [email, setEmail] = useState(emailFromQuery || '');
  const [code, setCode] = useState('');
  const [alert, setAlert] = useState(null);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [showCountdown, setShowCountdown] = useState(true);
  
  const { verifyEmail, resendVerification, loading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  
  // Start countdown on component mount
  useEffect(() => {
    let timer;
    if (countdown > 0 && isResendDisabled) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsResendDisabled(false);
      setShowCountdown(false);
    }
    
    return () => clearTimeout(timer);
  }, [countdown, isResendDisabled]);
  
  // Handle code input (only allow numbers)
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCode(value);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await verifyEmail(email, code);
      
      if (result.success) {
        setAlert({
          type: 'success',
          message: t.verificationSuccess
        });
        
        // Redirect to login page after showing success message
        setTimeout(() => {
          setRedirectToLogin(true);
        }, 2000);
      } else {
        setAlert({
          type: 'error',
          message: result.error || t.verificationFailed
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: t.verificationFailed
      });
    }
  };
  
  // Handle resend code
  const handleResendCode = async () => {
    try {
      const result = await resendVerification(email);
      
      if (result.success) {
        setAlert({
          type: 'success',
          message: t.resendSuccess
        });
        
        // Reset countdown
        setCountdown(60);
        setIsResendDisabled(true);
        setShowCountdown(true);
      } else {
        setAlert({
          type: 'error',
          message: result.error || t.resendFailed
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: t.resendFailed
      });
    }
  };
  
  // Redirect to login page
  if (redirectToLogin) {
    return <Navigate to="/login" />;
  }
  
  // If no email is provided, redirect to register page
  if (!email) {
    return <Navigate to="/register" />;
  }
  
  return (
    <AuthLayout showBackLink={true}>
      <div className="card">
        <div className="card-header text-center">
          <h4 className="mb-0"><i className="fas fa-envelope-open me-2"></i>{t.title}</h4>
        </div>
        <div className="card-body">
          {alert && (
            <AlertMessage 
              type={alert.type} 
              message={alert.message} 
              onClose={() => setAlert(null)} 
            />
          )}
          
          <div className="text-center mb-4">
            <i className="fas fa-envelope fa-3x text-primary mb-3"></i>
            <p className="text-muted">
              {t.emailSent} <strong>{email}</strong> {t.checkEmail}
            </p>
            <p className="text-muted">{t.enterCode}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="email" value={email} />
            
            <div className="mb-3">
              <label htmlFor="code" className="form-label">{t.verificationCode}</label>
              <input 
                type="text" 
                className="form-control text-center" 
                id="code" 
                value={code}
                onChange={handleCodeChange}
                required
                placeholder={t.codePlaceholder}
                maxLength={6}
                style={{ fontSize: '1.2rem', letterSpacing: '0.2rem' }}
                autoFocus
              />
            </div>
            
            <div className="d-grid">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg"
                disabled={loading || code.length !== 6}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <><i className="fas fa-check me-2"></i>{t.verifyButton}</>
                )}
              </button>
            </div>
          </form>
          
          <hr />
          
          <div className="text-center">
            <p className="mb-2 text-muted">{t.noEmail}</p>
            {showCountdown ? (
              <div className="mt-2 text-muted small">
                {countdown} {t.secondsRemaining}
              </div>
            ) : (
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={handleResendCode}
                disabled={isResendDisabled || loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <><i className="fas fa-redo me-2"></i>{t.resendCode}</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
