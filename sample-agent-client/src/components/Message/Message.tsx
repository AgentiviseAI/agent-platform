import React from 'react';
import { Message as MessageType } from '../../types';
import { UserIcon, BotIcon, PaperclipIcon } from '../icons';

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex gap-4 mb-6 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        message.isUser 
          ? 'bg-primary-500 text-white' 
          : 'bg-gray-200 text-gray-600'
      }`}>
        {message.isUser ? <UserIcon size={16} /> : <BotIcon size={16} />}
      </div>

      {/* Message Content */}
      <div className={`max-w-[70%] ${message.isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-4 rounded-2xl ${
          message.isUser
            ? 'bg-primary-500 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}>
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2">
              {message.attachments.map(attachment => (
                <div key={attachment.id} className="flex items-center gap-2 mb-1 text-sm">
                  <PaperclipIcon size={14} />
                  <span>{attachment.name}</span>
                  <span className="text-xs opacity-70">({(attachment.size / 1024).toFixed(1)} KB)</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Message text */}
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-500 mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};
