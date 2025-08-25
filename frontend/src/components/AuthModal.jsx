import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useModal } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import UserProfileModal from './UserProfileModal';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function AuthModal() {
  const { t } = useTranslation('auth');
  const { isLoginModalOpen, loginModalMode, closeLoginModal, setLoginModalMode } = useModal();
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // 清空表单数据
  useEffect(() => {
    if (!isLoginModalOpen) {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        verificationCode: '',
      });
      setError('');
      setSuccessMessage('');
      setIsCodeSent(false);
      setCountdown(0);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isLoginModalOpen, loginModalMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        closeLoginModal();
        // 不需要刷新页面，AuthContext会自动更新状态
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    if (!formData.email) {
      setError('请输入邮箱地址');
      return;
    }
    
    setLoading(true);
    try {
      const result = await authService.sendVerificationCode(formData.email);
      if (result.success) {
        setIsCodeSent(true);
        setCountdown(60);
        setError('');
        
        // 倒计时
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('发送验证码失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('密码不匹配');
      setLoading(false);
      return;
    }

    if (!formData.verificationCode) {
      setError('请输入验证码');
      setLoading(false);
      return;
    }

    try {
      // 注册
      const registerResult = await authService.register({
        email: formData.email,
        password: formData.password,
        verification_code: formData.verificationCode,
      });
      
      if (registerResult.success) {
        // 注册成功后自动登录
        const loginResult = await login(formData.email, formData.password);
        
        if (loginResult.success) {
          // 登录成功后显示用户信息补充模态框
          closeLoginModal();
          setShowProfileModal(true);
        } else {
          setSuccessMessage('注册成功！请手动登录。');
          setLoginModalMode('login');
        }
      } else {
        setError(registerResult.error);
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authService.resetPassword(formData.email);
      
      if (result.success) {
        setSuccessMessage('密码重置邮件已发送，请查看邮箱');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (profileData) => {
    try {
      await authService.updateProfile(profileData);
      setShowProfileModal(false);
    } catch (error) {
      console.error('Profile update error:', error);
      setShowProfileModal(false);
    }
  };

  const handleProfileSkip = () => {
    setShowProfileModal(false);
  };

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {loginModalMode === 'login' && t('login.title')}
              {loginModalMode === 'register' && t('register.title')}
              {loginModalMode === 'forgot' && t('forgot.title')}
            </h2>
            <button
              onClick={closeLoginModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Login Form */}
          {loginModalMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('login.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={t('login.emailPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('login.password')}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={t('login.passwordPlaceholder')}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {loading ? '登录中...' : t('login.submit')}
              </button>
            </form>
          )}

          {/* Register Form */}
          {loginModalMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱地址
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="请输入邮箱地址"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  验证码
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleInputChange}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="请输入验证码"
                  />
                  <button
                    type="button"
                    onClick={sendVerificationCode}
                    disabled={loading || countdown > 0}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}s` : isCodeSent ? '重新发送' : '发送验证码'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  确认密码
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="请再次输入密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {loading ? '注册中...' : '立即注册'}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {loginModalMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('forgot.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={t('forgot.emailPlaceholder')}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {loading ? '发送中...' : t('forgot.submit')}
              </button>
            </form>
          )}

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            {loginModalMode === 'login' && (
              <>
                <button
                  onClick={() => setLoginModalMode('forgot')}
                  className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {t('login.forgotPassword')}
                </button>
                <div className="text-sm text-gray-600">
                  {t('login.noAccount')}{' '}
                  <button
                    onClick={() => setLoginModalMode('register')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {t('login.registerNow')}
                  </button>
                </div>
              </>
            )}
            
            {loginModalMode === 'register' && (
              <div className="text-sm text-gray-600">
                {t('register.hasAccount')}{' '}
                <button
                  onClick={() => setLoginModalMode('login')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {t('register.loginNow')}
                </button>
              </div>
            )}
            
            {loginModalMode === 'forgot' && (
              <button
                onClick={() => setLoginModalMode('login')}
                className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {t('forgot.backToLogin')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 用户信息补充模态框 */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSubmit={handleProfileSubmit}
        onSkip={handleProfileSkip}
      />
    </div>
  );
}

export default AuthModal; 