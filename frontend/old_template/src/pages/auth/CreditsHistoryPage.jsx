import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import MainLayout from '../../components/layout/MainLayout';
import AlertMessage from '../../components/shared/AlertMessage';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { creditsAPI } from '../../services/api';

// Language strings
const translations = {
  zh: {
    title: '积分使用历史',
    date: '日期',
    type: '类型',
    amount: '数量',
    balance: '余额',
    description: '描述',
    loading: '加载中...',
    errorLoading: '加载积分历史失败',
    noHistory: '暂无积分使用记录',
    types: {
      purchase: '购买',
      usage: '使用',
      refund: '退款',
      bonus: '奖励'
    }
  },
  en: {
    title: 'Credits History',
    date: 'Date',
    type: 'Type',
    amount: 'Amount',
    balance: 'Balance',
    description: 'Description',
    loading: 'Loading...',
    errorLoading: 'Failed to load credits history',
    noHistory: 'No credits history available',
    types: {
      purchase: 'Purchase',
      usage: 'Usage',
      refund: 'Refund',
      bonus: 'Bonus'
    }
  }
};

const CreditsHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  
  const { language } = useLanguage();
  const t = translations[language];
  
  // Load credits history on component mount
  useEffect(() => {
    fetchCreditsHistory();
  }, []);
  
  // Fetch credits history
  const fetchCreditsHistory = async () => {
    setLoading(true);
    try {
      const response = await creditsAPI.getHistory();
      setHistory(response.data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: t.errorLoading
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Get type label based on type code
  const getTypeLabel = (type) => {
    return t.types[type] || type;
  };
  
  // Get CSS class for amount display
  const getAmountClass = (amount) => {
    if (amount > 0) return 'text-success';
    if (amount < 0) return 'text-danger';
    return '';
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
        ) : history.length === 0 ? (
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            {t.noHistory}
          </div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>{t.date}</th>
                    <th>{t.type}</th>
                    <th>{t.amount}</th>
                    <th>{t.balance}</th>
                    <th>{t.description}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(item => (
                    <tr key={item.id}>
                      <td>{new Date(item.created_at).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${
                          item.type === 'purchase' || item.type === 'bonus' ? 'bg-success' : 
                          item.type === 'usage' ? 'bg-primary' : 
                          'bg-secondary'
                        }`}>
                          {getTypeLabel(item.type)}
                        </span>
                      </td>
                      <td className={getAmountClass(item.amount)}>
                        {item.amount > 0 ? '+' : ''}{item.amount}
                      </td>
                      <td>{item.balance}</td>
                      <td>{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CreditsHistoryPage;
