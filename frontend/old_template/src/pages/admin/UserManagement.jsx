import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import MainLayout from '../../components/layout/MainLayout';
import AlertMessage from '../../components/shared/AlertMessage';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

// Language strings
const translations = {
  zh: {
    title: '用户管理',
    search: '搜索用户...',
    id: 'ID',
    email: '邮箱',
    username: '用户名',
    credits: '积分',
    status: '状态',
    registeredDate: '注册日期',
    actions: '操作',
    loading: '加载中...',
    errorLoading: '加载用户数据失败',
    noUsers: '暂无用户数据',
    active: '活跃',
    inactive: '未激活',
    suspended: '已暂停',
    view: '查看',
    edit: '编辑',
    suspend: '暂停',
    activate: '激活',
    totalUsers: '总用户数',
    activeUsers: '活跃用户',
    inactiveUsers: '未激活用户',
    suspendedUsers: '已暂停用户'
  },
  en: {
    title: 'User Management',
    search: 'Search users...',
    id: 'ID',
    email: 'Email',
    username: 'Username',
    credits: 'Credits',
    status: 'Status',
    registeredDate: 'Registered Date',
    actions: 'Actions',
    loading: 'Loading...',
    errorLoading: 'Failed to load user data',
    noUsers: 'No users available',
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    view: 'View',
    edit: 'Edit',
    suspend: 'Suspend',
    activate: 'Activate',
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    inactiveUsers: 'Inactive Users',
    suspendedUsers: 'Suspended Users'
  }
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0
  });
  
  const { language } = useLanguage();
  const t = translations[language];
  
  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Filter users when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);
  
  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // This would be an actual API call in production
      // For demo purposes, we'll use mock data
      setTimeout(() => {
        const mockUsers = [
          { id: 1, email: 'user1@example.com', username: 'user1', credits: 120, status: 'active', registered_date: '2024-01-15T08:30:00Z' },
          { id: 2, email: 'user2@example.com', username: 'user2', credits: 45, status: 'active', registered_date: '2024-02-20T14:15:00Z' },
          { id: 3, email: 'user3@example.com', username: 'user3', credits: 0, status: 'inactive', registered_date: '2024-03-05T11:45:00Z' },
          { id: 4, email: 'admin@example.com', username: 'admin', credits: 500, status: 'active', registered_date: '2023-12-01T09:00:00Z' },
          { id: 5, email: 'suspended@example.com', username: 'suspended_user', credits: 10, status: 'suspended', registered_date: '2024-01-30T16:20:00Z' }
        ];
        
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        
        // Calculate stats
        const stats = {
          total: mockUsers.length,
          active: mockUsers.filter(u => u.status === 'active').length,
          inactive: mockUsers.filter(u => u.status === 'inactive').length,
          suspended: mockUsers.filter(u => u.status === 'suspended').length
        };
        setStats(stats);
        
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
  
  // Get status badge class based on user status
  const getStatusBadgeClass = (status) => {
    if (status === 'active') return 'bg-success';
    if (status === 'inactive') return 'bg-warning';
    return 'bg-danger';
  };
  
  // Get status label based on user status
  const getStatusLabel = (status) => {
    if (status === 'active') return t.active;
    if (status === 'inactive') return t.inactive;
    return t.suspended;
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
        
        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title text-muted">{t.totalUsers}</h6>
                <h3 className="mb-0">{stats.total}</h3>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h6 className="card-title">{t.activeUsers}</h6>
                <h3 className="mb-0">{stats.active}</h3>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="card bg-warning text-dark">
              <div className="card-body">
                <h6 className="card-title">{t.inactiveUsers}</h6>
                <h3 className="mb-0">{stats.inactive}</h3>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="card bg-danger text-white">
              <div className="card-body">
                <h6 className="card-title">{t.suspendedUsers}</h6>
                <h3 className="mb-0">{stats.suspended}</h3>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Table */}
        <div className="card">
          <div className="card-header bg-white">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input 
                type="text" 
                className="form-control" 
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <LoadingSpinner />
                <p className="mt-3">{t.loading}</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="alert alert-info m-3">
                <i className="fas fa-info-circle me-2"></i>
                {t.noUsers}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t.id}</th>
                      <th>{t.email}</th>
                      <th>{t.username}</th>
                      <th>{t.credits}</th>
                      <th>{t.status}</th>
                      <th>{t.registeredDate}</th>
                      <th>{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.email}</td>
                        <td>{user.username}</td>
                        <td>{user.credits}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                            {getStatusLabel(user.status)}
                          </span>
                        </td>
                        <td>{new Date(user.registered_date).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button type="button" className="btn btn-outline-primary">
                              <i className="fas fa-eye"></i> {t.view}
                            </button>
                            <button type="button" className="btn btn-outline-secondary">
                              <i className="fas fa-edit"></i> {t.edit}
                            </button>
                            {user.status === 'active' ? (
                              <button type="button" className="btn btn-outline-danger">
                                <i className="fas fa-ban"></i> {t.suspend}
                              </button>
                            ) : (
                              <button type="button" className="btn btn-outline-success">
                                <i className="fas fa-check"></i> {t.activate}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminUsersPage;
