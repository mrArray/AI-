import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

// 创建认证上下文
const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  register: () => {},
  logout: () => {},
  resetPassword: () => {},
});

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 检查用户是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = authService.getStoredUserData();
        const hasValidToken = await authService.validateToken();
        
        if (storedUser && hasValidToken) {
          setUser(storedUser);
          setToken(authService.accessToken);
        } else if (storedUser) {
          // 用户数据存在但token无效，清除数据
          authService.clearTokens();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        authService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 登录函数
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        setToken(authService.accessToken);
        authService.setUserData(result.user);
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Login failed. Please check your credentials and try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 注册函数
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'Registration failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 登出函数
  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  // 重置密码函数
  const resetPassword = async (email) => {
    setIsLoading(true);
    try {
      const result = await authService.resetPassword(email);
      return result;
    } catch (error) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        error: 'Password reset failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 更新用户信息函数
  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    authService.setUserData(updatedUser);
  };

  // 提供认证状态和方法
  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义钩子，方便组件使用认证上下文
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
