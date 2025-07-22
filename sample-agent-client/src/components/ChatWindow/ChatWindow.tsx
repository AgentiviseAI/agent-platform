import React, { useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { Message } from '../Message/Message';
import { LoaderIcon } from '../icons';

export const ChatWindow: React.FC = () => {
  const { currentSession, isLoading, error } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  if (!currentSession) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to AI Chat</h2>
          <p className="text-gray-600 mb-6">
            Start a new conversation by typing a message below, or select a previous chat from the sidebar.
          </p>
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Tips:</h3>
            <ul className="text-sm text-gray-600 text-left space-y-1">
              <li>• Press Enter to send your message</li>
              <li>• Use Shift+Enter for a new line</li>
              <li>• Attach files using the paperclip icon</li>
              <li>• Record voice messages with the microphone</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="border-b bg-white p-4">
        <h2 className="font-semibold text-gray-800 truncate">{currentSession.title}</h2>
        <div className="text-sm text-gray-500">
          {currentSession.messages.length} messages
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="text-red-800 font-medium">Error</div>
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {currentSession.messages.map(message => (
          <Message key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-4 mb-6">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
              🤖
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm p-4 max-w-[70%]">
              <div className="flex items-center gap-2 text-gray-600">
                <LoaderIcon size={16} />
                <span>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
