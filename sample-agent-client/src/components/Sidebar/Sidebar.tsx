import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { PlusIcon, ClockIcon, SettingsIcon } from '../icons';
import { SettingsDialog } from './SettingsDialog';

export const Sidebar: React.FC = () => {
  const { sessions, currentSession, selectSession, startNewChat } = useChat();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 bg-gray-50 border-r flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">AI Chat</h1>
          <button
            onClick={startNewChat}
            className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            title="Start new chat"
          >
            <PlusIcon size={18} />
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="mb-2">No conversations yet</div>
            <div className="text-sm">Start a new chat to get going!</div>
          </div>
        ) : (
          <div className="p-2">
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => selectSession(session.id)}
                className={`w-full p-3 mb-2 rounded-lg text-left transition-colors ${
                  currentSession?.id === session.id
                    ? 'bg-primary-100 border-primary-200 border'
                    : 'bg-white hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="font-medium text-gray-800 truncate mb-1">
                  {session.title}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <ClockIcon size={12} />
                    {formatDate(session.lastActivity)}
                  </span>
                  <span>{session.messages.length} messages</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Powered by Gemini 1.5 Flash
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </div>

      {/* Settings Dialog */}
      {isSettingsOpen && (
        <SettingsDialog onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
};
