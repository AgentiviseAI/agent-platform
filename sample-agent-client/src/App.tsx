import React from 'react';
import { ChatProvider } from './contexts/ChatContext';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatWindow } from './components/ChatWindow/ChatWindow';
import { MessageInput } from './components/MessageInput/MessageInput';

const App: React.FC = () => {
  return (
    <ChatProvider>
      <div className="h-screen flex overflow-hidden bg-gray-100">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatWindow />
          <MessageInput />
        </div>
      </div>
    </ChatProvider>
  );
};

export default App;
