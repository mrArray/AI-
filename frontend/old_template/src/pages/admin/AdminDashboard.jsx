import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import MainLayout from '../../components/layout/MainLayout';
import AlertMessage from '../../components/shared/AlertMessage';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

// Language strings
const translations = {
  zh: {
    title: '控制台概览',
    totalUsers: '总用户数',
    activeUsers: '活跃用户',
    totalTasks: '总任务数',
    completedTasks: '已完成任务',
    systemStatus: '系统状态',
    creditsUsed: '已使用积分',
    userRegistrations: '用户注册',
    taskCompletions: '任务完成',
    last7Days: '最近7天',
    last30Days: '最近30天',
    loading: '加载中...',
    errorLoading: '加载数据失败',
    healthy: '健康',
    warning: '警告',
    critical: '严重',
    today: '今日',
    yesterday: '昨日',
    viewDetails: '查看详情'
  },
  en: {
    title: 'Dashboard Overview',
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    totalTasks: 'Total Tasks',
    completedTasks: 'Completed Tasks',
    systemStatus: 'System Status',
    creditsUsed: 'Credits Used',
    userRegistrations: 'User Registrations',
    taskCompletions: 'Task Completions',
    last7Days: 'Last 7 Days',
    last30Days: 'Last 30 Days',
    loading: 'Loading...',
    errorLoading: 'Failed to load data',
    healthy: 'Healthy',
    warning: 'Warning',
    critical: 'Critical',
    today: 'Today',
    yesterday: 'Yesterday',
    viewDetails: 'View Details'
  }
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    systemStatus: 'healthy',
    creditsUsed: 0
  });
  
  const [chartData, setChartData] = useState({
    userRegistrations: [],
    taskCompletions: []
  });
  
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  
  const { language } = useLanguage();
  const t = translations[language];
  
  // Load dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // This would be an actual API call in production
      // For demo purposes, we'll use mock data
      setTimeout(() => {
        setStats({
          totalUsers: 1245,
          activeUsers: 876,
          totalTasks: 5432,
          completedTasks: 4891,
          systemStatus: 'healthy',
          creditsUsed: 28750
        });
        
        setChartData({
          userRegistrations: [12, 19, 15, 8, 22, 14, 10],
          taskCompletions: [45, 38, 52, 41, 55, 49, 62]
        });
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      setAlert({
        type: 'error',
        message: t.errorLoading
      });
      setLoading(false);
    }
  };
  
  // Get status class based on system status
  const getStatusClass = (status) => {
    if (status === 'healthy') return 'bg-success';
    if (status === 'warning') return 'bg-warning';
    return 'bg-danger';
  };
  
  // Get status label based on system status
  const getStatusLabel = (status) => {
    if (status === 'healthy') return t.healthy;
    if (status === 'warning') return t.warning;
    return t.critical;
  };
  
  return (
    <MainLayout>
      <div className="container py-4">
        <h2 className="mb-4">{t.title}</h2>
        
        {alert && (
          <AlertMessage 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert(null)} 
          />
        )}
        
        {loading ? (
          <div className="text-center py-5">
            <LoadingSpinner />
            <p className="mt-3">{t.loading}</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="row mb-4">
              <div className="col-md-3 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title text-muted">{t.totalUsers}</h5>
                    <h2 className="mb-0">{stats.totalUsers.toLocaleString()}</h2>
                    <small className="text-success">
                      <i className="fas fa-arrow-up me-1"></i>12% {t.last30Days}
                    </small>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title text-muted">{t.activeUsers}</h5>
                    <h2 className="mb-0">{stats.activeUsers.toLocaleString()}</h2>
                    <small className="text-success">
                      <i className="fas fa-arrow-up me-1"></i>8% {t.last7Days}
                    </small>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title text-muted">{t.totalTasks}</h5>
                    <h2 className="mb-0">{stats.totalTasks.toLocaleString()}</h2>
                    <div className="progress mt-2" style={{ height: '4px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
                      ></div>
                    </div>
                    <small className="text-muted mt-1">
                      {stats.completedTasks.toLocaleString()} {t.completedTasks}
                    </small>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title text-muted">{t.systemStatus}</h5>
                    <div className="d-flex align-items-center">
                      <span className={`badge ${getStatusClass(stats.systemStatus)} me-2`}>
                        {getStatusLabel(stats.systemStatus)}
                      </span>
                      <span className="text-success">
                        <i className="fas fa-check-circle"></i>
                      </span>
                    </div>
                    <small className="text-muted d-block mt-2">
                      {t.creditsUsed}: {stats.creditsUsed.toLocaleString()}
                    </small>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{t.userRegistrations}</h5>
                    <div className="btn-group btn-group-sm">
                      <button type="button" className="btn btn-outline-secondary active">{t.last7Days}</button>
                      <button type="button" className="btn btn-outline-secondary">{t.last30Days}</button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="chart-container" style={{ height: '250px' }}>
                      {/* Chart would be rendered here using a library like Chart.js */}
                      <div className="d-flex justify-content-between text-muted mb-2">
                        <small>{t.yesterday}</small>
                        <small>{t.today}</small>
                      </div>
                      <div className="d-flex align-items-end" style={{ height: '200px' }}>
                        {chartData.userRegistrations.map((value, index) => (
                          <div 
                            key={index}
                            className="bg-primary rounded-top mx-1"
                            style={{ 
                              height: `${(value / Math.max(...chartData.userRegistrations)) * 100}%`,
                              width: `${90 / chartData.userRegistrations.length}%`
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{t.taskCompletions}</h5>
                    <div className="btn-group btn-group-sm">
                      <button type="button" className="btn btn-outline-secondary active">{t.last7Days}</button>
                      <button type="button" className="btn btn-outline-secondary">{t.last30Days}</button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="chart-container" style={{ height: '250px' }}>
                      {/* Chart would be rendered here using a library like Chart.js */}
                      <div className="d-flex justify-content-between text-muted mb-2">
                        <small>{t.yesterday}</small>
                        <small>{t.today}</small>
                      </div>
                      <div className="d-flex align-items-end" style={{ height: '200px' }}>
                        {chartData.taskCompletions.map((value, index) => (
                          <div 
                            key={index}
                            className="bg-success rounded-top mx-1"
                            style={{ 
                              height: `${(value / Math.max(...chartData.taskCompletions)) * 100}%`,
                              width: `${90 / chartData.taskCompletions.length}%`
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="row">
              <div className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{t.totalUsers}</h5>
                    <p className="card-text">
                      <i className="fas fa-users text-primary me-2"></i>
                      {stats.totalUsers.toLocaleString()} {t.totalUsers}
                    </p>
                    <a href="/admin/users" className="btn btn-sm btn-outline-primary">
                      {t.viewDetails} <i className="fas fa-arrow-right ms-1"></i>
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{t.totalTasks}</h5>
                    <p className="card-text">
                      <i className="fas fa-tasks text-success me-2"></i>
                      {stats.totalTasks.toLocaleString()} {t.totalTasks}
                    </p>
                    <a href="/admin/tasks" className="btn btn-sm btn-outline-success">
                      {t.viewDetails} <i className="fas fa-arrow-right ms-1"></i>
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{t.systemStatus}</h5>
                    <p className="card-text">
                      <i className="fas fa-server text-info me-2"></i>
                      {getStatusLabel(stats.systemStatus)}
                    </p>
                    <a href="#" className="btn btn-sm btn-outline-info">
                      {t.viewDetails} <i className="fas fa-arrow-right ms-1"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
