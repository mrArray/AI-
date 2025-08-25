import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import AlertMessage from '../../components/shared/AlertMessage';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { chatAPI } from '../../services/api';
import useBootstrapJS from '../../utils/bootstrapHelpers';


const ChatPage = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [alert, setAlert] = useState(null);
  
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // Initialize Bootstrap components
  useBootstrapJS();
  
  // Load sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);
  
  // Fetch all chat sessions
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await chatAPI.getSessions();
      setSessions(response.data);
      
      // If there are sessions, load the most recent one
      if (response.data.length > 0) {
        selectSession(response.data[0].id);
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: t('chat.errorLoading')
      });
    } finally {
      setLoadingSessions(false);
    }
  };
  
  // Select a session and load its messages
  const selectSession = async (sessionId) => {
    setLoading(true);
    setCurrentSession(sessionId);
    
    try {
      const response = await chatAPI.getMessages(sessionId);
      setMessages(response.data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || t('common.error')
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Start a new chat session
  const startNewChat = async () => {
    if (!newMessage.trim()) return;
    
    setLoading(true);
    try {
      const response = await chatAPI.startChat(newMessage);
      
      // Add new session to list
      const newSession = response.data.session;
      setSessions([newSession, ...sessions]);
      
      // Set as current session and load messages
      setCurrentSession(newSession.id);
      setMessages(response.data.messages || []);
      
      // Clear input
      setNewMessage('');
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || t('common.error')
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Send a follow-up message in current session
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSession) return;
    
    // Optimistically add message to UI
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      is_user: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, tempMessage]);
    const messageToSend = newMessage;
    setNewMessage('');
    
    setLoading(true);
    try {
      const response = await chatAPI.followupChat(currentSession, messageToSend);
      
      // Replace optimistic messages with actual response
      setMessages(response.data.messages);
    } catch (error) {
      // Remove optimistic message on error
      setMessages(messages.filter(m => m.id !== tempMessage.id));
      
      setAlert({
        type: 'error',
        message: error.response?.data?.message || t('common.error')
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Auto-scroll to bottom of messages when messages change
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);
  
  return (
    <MainLayout>
      <div className="container py-4">
        {alert && (
          <AlertMessage 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert(null)} 
          />
        )}
        
        <div className="row">
          {/* Chat sessions sidebar */}
          <div className="col-md-3">
            <div className="card mb-3">
              <div className="card-header">
                <h5 className="mb-0">{t('chat.chatHistory')}</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  <button 
                    className="list-group-item list-group-item-action d-flex align-items-center"
                    onClick={() => {
                      setCurrentSession(null);
                      setMessages([]);
                    }}
                  >
                    <i className="fas fa-plus-circle me-2 text-success"></i>
                    {t('chat.newChat')}
                  </button>
                  
                  {loadingSessions ? (
                    <div className="text-center py-3">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    sessions.map(session => (
                      <button 
                        key={session.id}
                        className={`list-group-item list-group-item-action ${currentSession === session.id ? 'active' : ''}`}
                        onClick={() => selectSession(session.id)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="text-truncate">
                            {session.title || `Chat #${session.id}`}
                          </div>
                          <small>{new Date(session.created_at).toLocaleDateString()}</small>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Chat messages area */}
          <div className="col-md-9">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  {currentSession ? (
                    sessions.find(s => s.id === currentSession)?.title || `Chat #${currentSession}`
                  ) : (
                    t('chat.newChat')
                  )}
                </h5>
                {user && (
                  <span className="badge bg-success">
                    {t('common.credits')}: {user.credits}
                  </span>
                )}
              </div>
              
              <div className="card-body">
                {/* Messages display */}
                <div className="chat-messages mb-3" style={{ minHeight: '300px', maxHeight: '500px', overflowY: 'auto' }}>
                  {loading && messages.length === 0 ? (
                    <div className="text-center py-5">
                      <LoadingSpinner />
                      <p className="mt-2">{t('chat.loadingMessages')}</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <i className="fas fa-comments fa-3x mb-3"></i>
                      <p>{t('chat.noMessages')}</p>
                    </div>
                  ) : (
                    messages.map(message => (
                      <div 
                        key={message.id} 
                        className={`mb-3 ${message.is_user ? 'text-end' : ''}`}
                      >
                        <div 
                          className={`d-inline-block p-3 rounded ${
                            message.is_user 
                              ? 'bg-primary text-white' 
                              : 'bg-light'
                          }`}
                          style={{ maxWidth: '80%', textAlign: 'left' }}
                        >
                          {message.content}
                        </div>
                        <div className="text-muted small mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Message input */}
                <div className="chat-input">
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder={t('chat.placeholder')}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          currentSession ? sendMessage() : startNewChat();
                        }
                      }}
                      disabled={loading}
                    />
                    <button 
                      className="btn btn-primary" 
                      onClick={currentSession ? sendMessage : startNewChat}
                      disabled={loading || !newMessage.trim()}
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <><i className="fas fa-paper-plane"></i> {t('chat.send')}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatPage;
