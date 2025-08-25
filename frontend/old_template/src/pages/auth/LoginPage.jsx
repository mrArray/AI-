import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import AlertMessage from '../../components/shared/AlertMessage';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [alert, setAlert] = useState(null);

  const { login, isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
      if (!result.success) {
        setAlert({ type: 'error', message: result.error || t('auth.login.loginFailed') });
      }
    } catch (error) {
      setAlert({ type: 'error', message: t('auth.login.loginFailed') });
    }
  };

  return (
    <AuthLayout>
      <div className="card">
        <div className="card-header text-center">
          <h4 className="mb-0">
            <i className="fas fa-sign-in-alt me-2"></i>{t('auth.login.title')}
          </h4>
        </div>
        <div className="card-body">
          {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">{t('auth.login.email')}</label>
              <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t('auth.login.emailPlaceholder')} />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">{t('auth.login.password')}</label>
              <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={t('auth.login.passwordPlaceholder')} />
            </div>
            <div className="mb-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <label className="form-check-label" htmlFor="remember">{t('auth.login.rememberMe')}</label>
              </div>
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <LoadingSpinner size="small" /> : <><i className="fas fa-sign-in-alt me-2"></i>{t('auth.login.loginButton')}</>}
              </button>
            </div>
          </form>
          <hr />
          <div className="text-center">
            <p className="mb-2">
              <a href="/forgot-password" className="text-decoration-none text-muted">{t('auth.login.forgotPassword')}</a>
            </p>
            <p className="mb-0">
              {t('auth.login.noAccount')} <a href="/register" className="text-decoration-none">{t('auth.login.register')}</a>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
