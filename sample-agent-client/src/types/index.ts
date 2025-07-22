export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastActivity: Date;
}

export interface ProcessPromptRequest {
  agentid: string;
  prompt: string;
  chatid: string;
  userid: string;
}

export interface ProcessPromptResponse {
  agentid: string;
  response: string;
  chatid: string;
  userid: string;
}

export interface AppConfig {
  apiBaseUrl: string;
  agentId: string;
  userId: string;
}
