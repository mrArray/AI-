import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AuthLayout from '../../components/layout/AuthLayout';
import AlertMessage from '../../components/shared/AlertMessage';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const translations = {
  zh: {
    title: '注册账户',
    email: '邮箱地址',
    emailPlaceholder: '请输入邮箱地址',
    password: '密码',
    passwordPlaceholder: '请输入密码（至少6位）',
    confirmPassword: '确认密码',
    confirmPasswordPlaceholder: '请再次输入密码',
    agreeTerms: '我同意',
    termsOfService: '用户服务协议',
    and: '和',
    privacyPolicy: '隐私政策',
    registerButton: '注册账户',
    haveAccount: '已有账户？',
    login: '立即登录',
    freeCredits: '注册即送30积分，立即开始使用AI论文排版服务',
    passwordMismatch: '两次输入的密码不一致',
    registrationSuccess: '注册成功！请前往您的邮箱查看验证码，并在5分钟内完成验证。'
  },
  en: {
    title: 'Register Account',
    email: 'Email Address',
    emailPlaceholder: 'Enter your email address',
    password: 'Password',
    passwordPlaceholder: 'Enter password (minimum 6 characters)',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Enter password again',
    agreeTerms: 'I agree to the',
    termsOfService: 'Terms of Service',
    and: 'and',
    privacyPolicy: 'Privacy Policy',
    registerButton: 'Register Account',
    haveAccount: 'Already have an account?',
    login: 'Login now',
    freeCredits: 'Get 30 free credits upon registration to start using AI paper formatting service',
    passwordMismatch: 'Passwords do not match',
    registrationSuccess: 'Registration successful! Please check your email for verification code and complete verification within 5 minutes.'
  }
};

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [alert, setAlert] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [redirectToVerify, setRedirectToVerify] = useState(false);

  const { register, loading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  const handleConfirmPasswordBlur = () => {
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError(t.passwordMismatch);
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAlert({ type: 'error', message: t.passwordMismatch });
      return;
    }

    try {
      const result = await register(email, email, password);
      if (result.success) {
        setAlert({ type: 'success', message: t.registrationSuccess });
        setTimeout(() => {
          setRedirectToVerify(true);
        }, 2000);
      } else {
        setAlert({ type: 'error', message: result.error });
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  if (redirectToVerify) {
    return <Navigate to={`/verify?email=${encodeURIComponent(email)}`} />;
  }

  return (
    <AuthLayout>
      <div className="card">
        <div className="card-header text-center">
          <h4 className="mb-0">
            <i className="fas fa-user-plus me-2"></i>{t.title}
          </h4>
        </div>
        <div className="card-body">
          {alert && (
            <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">{t.email} <span className="text-danger">*</span></label>
              <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t.emailPlaceholder} />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">{t.password} <span className="text-danger">*</span></label>
              <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder={t.passwordPlaceholder} />
            </div>
            <div className="mb-3">
              <label htmlFor="confirm_password" className="form-label">{t.confirmPassword} <span className="text-danger">*</span></label>
              <input type="password" className={`form-control ${passwordError ? 'is-invalid' : ''}`} id="confirm_password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onBlur={handleConfirmPasswordBlur} required placeholder={t.confirmPasswordPlaceholder} />
              {passwordError && <div className="invalid-feedback">{passwordError}</div>}
            </div>
            <div className="mb-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="agree_terms" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} required />
                <label className="form-check-label" htmlFor="agree_terms">
                  {t.agreeTerms} <a href="#" className="text-decoration-none">{t.termsOfService}</a> {t.and} <a href="#" className="text-decoration-none">{t.privacyPolicy}</a>
                </label>
              </div>
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !agreeTerms}>
                {loading ? <LoadingSpinner size="sm" /> : <><i className="fas fa-user-plus me-2"></i>{t.registerButton}</>}
              </button>
            </div>
          </form>
          <hr />
          <div className="text-center">
            <p className="mb-0">{t.haveAccount} <a href="/login" className="text-decoration-none">{t.login}</a></p>
          </div>
        </div>
        <div className="card-footer bg-light text-center">
          <small className="text-muted">
            <i className="fas fa-gift me-1"></i>{t.freeCredits}
          </small>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
