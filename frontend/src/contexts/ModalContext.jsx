import { createContext, useContext, useState } from 'react';

const ModalContext = createContext({
  isLoginModalOpen: false,
  loginModalMode: 'login', // 'login' | 'register' | 'forgot'
  openLoginModal: () => {},
  openRegisterModal: () => {},
  closeLoginModal: () => {},
  setLoginModalMode: () => {},
});

export const ModalProvider = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState('login');

  const openLoginModal = () => {
    setLoginModalMode('login');
    setIsLoginModalOpen(true);
  };

  const openRegisterModal = () => {
    setLoginModalMode('register');
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const value = {
    isLoginModalOpen,
    loginModalMode,
    openLoginModal,
    openRegisterModal,
    closeLoginModal,
    setLoginModalMode,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);

export default ModalContext;
