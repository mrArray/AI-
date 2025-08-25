import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  UserIcon, 
  CogIcon, 
  ChartBarIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  CalendarIcon,
  MapPinIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

function ProfilePage() {
  const { t } = useTranslation('profile');
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [creditHistory, setCreditHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProfileData();
    loadStatsData();
    loadCreditHistory();
  }, []);

  const loadProfileData = async () => {
    const result = await authService.getProfileDetail();
    if (result.success) {
      setProfileData(result.data);
      setEditData(result.data);
    } else {
      setError(result.error);
    }
  };

  const loadStatsData = async () => {
    const result = await authService.getUserStats();
    if (result.success) {
      setStatsData(result.data);
    }
    setLoading(false);
  };

  const loadCreditHistory = async () => {
    const result = await authService.getCreditHistory();
    if (result.success) {
      setCreditHistory(result.data.slice(0, 10)); // 显示最近10条
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('头像格式不支持，请上传 JPG、PNG、GIF 或 WebP 格式的图片');
      return;
    }

    // 验证文件大小
    if (file.size > 5 * 1024 * 1024) {
      setError('头像文件过大，请上传小于 5MB 的图片');
      return;
    }

    setSubmitting(true);
    const result = await authService.uploadAvatar(file);
    setSubmitting(false);

    if (result.success) {
      // 更新profile数据和用户上下文
      await loadProfileData();
      if (updateUser) {
        updateUser({ avatar_url: result.data.avatar_url });
      }
      setError('');
    } else {
      setError(result.error);
    }
  };

  const handleEditSubmit = async () => {
    setSubmitting(true);
    const result = await authService.updateProfile(editData);
    setSubmitting(false);

    if (result.success) {
      setProfileData(result.data.user);
      setIsEditing(false);
      setError('');
      // 更新用户上下文
      if (updateUser) {
        updateUser(result.data.user);
      }
    } else {
      setError(result.error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('新密码和确认密码不一致');
      return;
    }

    setSubmitting(true);
    const result = await authService.changePassword(passwordData.old_password, passwordData.new_password);
    setSubmitting(false);

    if (result.success) {
      setShowPasswordChange(false);
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setError('');
      alert('密码修改成功');
    } else {
      setError(result.error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getAvatarDisplay = () => {
    if (profileData?.avatar_url) {
      return (
        <img 
          src={profileData.avatar_url} 
          alt="头像" 
          className="h-24 w-24 rounded-full object-cover"
        />
      );
    }
    
    const displayName = profileData?.display_name || user?.email?.split('@')[0] || '用户';
    return (
      <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
        {displayName.charAt(0).toUpperCase()}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header activePage="profile" />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header activePage="profile" />

      <div className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('pageTitle')}</h1>
            <p className="mt-2 text-gray-600">{t('pageDescription')}</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`${
                    activeTab === 'profile'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
                >
                  <UserIcon className="h-5 w-5 mr-2" />
                  {t('tabs.profile')}
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`${
                    activeTab === 'settings'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
                >
                  <CogIcon className="h-5 w-5 mr-2" />
                  {t('tabs.settings')}
                </button>
                <button
                  onClick={() => setActiveTab('usage')}
                  className={`${
                    activeTab === 'usage'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  {t('tabs.usage')}
                </button>
              </nav>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && profileData && (
              <div className="px-4 py-5 sm:p-6">
                {/* Header with Avatar */}
                <div className="flex items-center mb-8">
                  <div className="relative">
                    {getAvatarDisplay()}
                    <label 
                      htmlFor="avatar-upload" 
                      className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors"
                    >
                      <CameraIcon className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={submitting}
                      />
                    </label>
                  </div>
                  <div className="ml-6 flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-medium text-gray-900">
                        {profileData.display_name || profileData.username}
                      </h2>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        {isEditing ? '取消编辑' : '编辑资料'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                      {profileData.email}
                    </p>
                    <div className="mt-2 flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {profileData.is_verified ? '已验证' : '未验证'}
                      </span>
                      <span className="ml-3 text-sm text-gray-500 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        加入于 {formatDate(profileData.date_joined)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="space-y-6">
                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">昵称</label>
                        <input
                          type="text"
                          value={editData.nickname || ''}
                          onChange={(e) => setEditData({...editData, nickname: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="请输入昵称"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">手机号</label>
                        <input
                          type="tel"
                          value={editData.phone || ''}
                          onChange={(e) => setEditData({...editData, phone: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="请输入手机号"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">生日</label>
                        <input
                          type="date"
                          value={editData.birth_date || ''}
                          onChange={(e) => setEditData({...editData, birth_date: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">性别</label>
                        <select
                          value={editData.gender || ''}
                          onChange={(e) => setEditData({...editData, gender: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="">请选择</option>
                          <option value="male">男</option>
                          <option value="female">女</option>
                          <option value="other">其他</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">所在地</label>
                        <input
                          type="text"
                          value={editData.location || ''}
                          onChange={(e) => setEditData({...editData, location: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="请输入所在地"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">个人网站</label>
                        <input
                          type="url"
                          value={editData.website || ''}
                          onChange={(e) => setEditData({...editData, website: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="https://"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">个人简介</label>
                        <textarea
                          rows={3}
                          value={editData.bio || ''}
                          onChange={(e) => setEditData({...editData, bio: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="简单介绍一下自己..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="flex items-center">
                        <dt className="text-sm font-medium text-gray-500 w-20">昵称</dt>
                        <dd className="text-sm text-gray-900">{profileData.nickname || '-'}</dd>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <dt className="text-sm font-medium text-gray-500 w-20">手机号</dt>
                        <dd className="text-sm text-gray-900">{profileData.phone || '-'}</dd>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <dt className="text-sm font-medium text-gray-500 w-20">生日</dt>
                        <dd className="text-sm text-gray-900">{formatDate(profileData.birth_date)}</dd>
                      </div>
                      <div className="flex items-center">
                        <dt className="text-sm font-medium text-gray-500 w-20">性别</dt>
                        <dd className="text-sm text-gray-900">
                          {profileData.gender === 'male' ? '男' : profileData.gender === 'female' ? '女' : profileData.gender === 'other' ? '其他' : '-'}
                        </dd>
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <dt className="text-sm font-medium text-gray-500 w-20">所在地</dt>
                        <dd className="text-sm text-gray-900">{profileData.location || '-'}</dd>
                      </div>
                      <div className="flex items-center">
                        <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <dt className="text-sm font-medium text-gray-500 w-20">网站</dt>
                        <dd className="text-sm text-gray-900">
                          {profileData.website ? (
                            <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                              {profileData.website}
                            </a>
                          ) : '-'}
                        </dd>
                      </div>
                      {profileData.bio && (
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500 mb-2">个人简介</dt>
                          <dd className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{profileData.bio}</dd>
                        </div>
                      )}
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleEditSubmit}
                        disabled={submitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {submitting ? '保存中...' : '保存修改'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditData(profileData);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        取消
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && profileData && (
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-8">
                  {/* Password Change */}
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">修改密码</h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                      <p>定期更新密码以保障账户安全</p>
                    </div>
                    
                    {!showPasswordChange ? (
                      <div className="mt-4">
                        <button
                          onClick={() => setShowPasswordChange(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          修改密码
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">当前密码</label>
                          <div className="mt-1 relative">
                            <input
                              type={showPasswords.old ? 'text' : 'password'}
                              value={passwordData.old_password}
                              onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                              className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({...showPasswords, old: !showPasswords.old})}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPasswords.old ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">新密码</label>
                          <div className="mt-1 relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordData.new_password}
                              onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                              className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPasswords.new ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">确认新密码</label>
                          <div className="mt-1 relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordData.confirm_password}
                              onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                              className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPasswords.confirm ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={handlePasswordChange}
                            disabled={submitting}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                          >
                            {submitting ? '修改中...' : '确认修改'}
                          </button>
                          <button
                            onClick={() => {
                              setShowPasswordChange(false);
                              setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
                            }}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notification Settings */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">通知设置</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">邮件通知</h4>
                          <p className="text-sm text-gray-500">接收系统通知和重要更新</p>
                        </div>
                        <button
                          onClick={() => {
                            const newValue = !editData.email_notifications;
                            setEditData({...editData, email_notifications: newValue});
                            authService.updateProfile({email_notifications: newValue});
                          }}
                          className={`${
                            editData.email_notifications ? 'bg-indigo-600' : 'bg-gray-200'
                          } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                          <span
                            className={`${
                              editData.email_notifications ? 'translate-x-5' : 'translate-x-0'
                            } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">营销邮件</h4>
                          <p className="text-sm text-gray-500">接收产品更新和优惠信息</p>
                        </div>
                        <button
                          onClick={() => {
                            const newValue = !editData.marketing_emails;
                            setEditData({...editData, marketing_emails: newValue});
                            authService.updateProfile({marketing_emails: newValue});
                          }}
                          className={`${
                            editData.marketing_emails ? 'bg-indigo-600' : 'bg-gray-200'
                          } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                          <span
                            className={`${
                              editData.marketing_emails ? 'translate-x-5' : 'translate-x-0'
                            } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Usage Tab */}
            {activeTab === 'usage' && statsData && (
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">使用统计</h3>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
                    <dt className="text-sm font-medium text-indigo-600">总任务数</dt>
                    <dd className="mt-1 text-2xl font-semibold text-indigo-900">{statsData.total_tasks}</dd>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 text-center">
                    <dt className="text-sm font-medium text-emerald-600">完成任务</dt>
                    <dd className="mt-1 text-2xl font-semibold text-emerald-900">{statsData.completed_tasks}</dd>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4 text-center">
                    <dt className="text-sm font-medium text-violet-600">本月任务</dt>
                    <dd className="mt-1 text-2xl font-semibold text-violet-900">{statsData.tasks_this_month}</dd>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 text-center">
                    <dt className="text-sm font-medium text-amber-600">成功率</dt>
                    <dd className="mt-1 text-2xl font-semibold text-amber-900">{statsData.success_rate}%</dd>
                  </div>
                </div>

                {/* Usage Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Credit Usage */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">积分使用情况</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">总消耗积分</span>
                        <span className="text-sm font-medium">{statsData.total_tokens_used}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">本月消耗</span>
                        <span className="text-sm font-medium">{statsData.credits_used_this_month}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">平均每任务</span>
                        <span className="text-sm font-medium">{statsData.avg_tokens_per_task}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">当前余额</span>
                        <span className="text-sm font-medium text-indigo-600">{profileData.credits}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">最近活动</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {creditHistory.length > 0 ? (
                        creditHistory.map((transaction, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                              <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                            </div>
                            <span className={`text-sm font-medium ${
                              transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">暂无活动记录</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ProfilePage;
