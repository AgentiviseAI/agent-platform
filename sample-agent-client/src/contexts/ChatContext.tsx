import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Message, ChatSession, AppConfig } from '../types';
import { chatAPI } from '../services/api';

interface ChatContextType {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isLoading: boolean;
  error: string | null;
  config: AppConfig;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  startNewChat: () => void;
  selectSession: (sessionId: string) => void;
  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

const generateUserId = () => {
  const stored = localStorage.getItem('chatUserId');
  if (stored) return stored;
  
  const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('chatUserId', newId);
  return newId;
};

const getStoredConfig = (): AppConfig => {
  const stored = localStorage.getItem('chatConfig');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        apiBaseUrl: parsed.apiBaseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
        agentId: parsed.agentId || import.meta.env.VITE_AGENT_ID || 'default_agent',
        userId: parsed.userId || import.meta.env.VITE_USER_ID || generateUserId(),
      };
    } catch {
      // Fall through to defaults
    }
  }
  
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
    agentId: import.meta.env.VITE_AGENT_ID || 'default_agent',
    userId: import.meta.env.VITE_USER_ID || generateUserId(),
  };
};

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AppConfig>(getStoredConfig);

  const updateConfig = useCallback(async (updates: Partial<AppConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem('chatConfig', JSON.stringify(newConfig));
  }, [config]);

  const createMessage = (content: string, isUser: boolean, attachments?: File[]): Message => ({
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    content,
    isUser,
    timestamp: new Date(),
    attachments: attachments?.map(file => ({
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    })),
  });

  const sendMessage = useCallback(async (content: string, attachments?: File[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create user message
      const userMessage = createMessage(content, true, attachments);

      // Update current session or create new one
      let session = currentSession;
      if (!session) {
        session = {
          id: '',
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          messages: [],
          lastActivity: new Date(),
        };
        setCurrentSession(session);
      }

      // Add user message to session
      const updatedSession = {
        ...session,
        messages: [...session.messages, userMessage],
        lastActivity: new Date(),
      };
      setCurrentSession(updatedSession);

      // Send to API
      const response = await chatAPI.sendMessage({
        agentid: config.agentId,
        prompt: content,
        chatid: session.id,
        userid: config.userId,
      });

      // Create AI response message
      const aiMessage = createMessage(response.response, false);

      // Update session with AI response
      const finalSession = {
        ...updatedSession,
        id: response.chatid,
        messages: [...updatedSession.messages, aiMessage],
        lastActivity: new Date(),
      };

      setCurrentSession(finalSession);

      // Update sessions list
      setSessions(prev => {
        const existingIndex = prev.findIndex(s => s.id === response.chatid);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = finalSession;
          return updated;
        } else {
          return [finalSession, ...prev];
        }
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, config]);

  const startNewChat = useCallback(() => {
    setCurrentSession(null);
    setError(null);
  }, []);

  const selectSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  }, [sessions]);

  const value: ChatContextType = {
    currentSession,
    sessions,
    isLoading,
    error,
    config,
    sendMessage,
    startNewChat,
    selectSession,
    updateConfig,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
