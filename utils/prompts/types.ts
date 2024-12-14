export interface SystemPrompt {
  role: 'system';
  content: string;
}

export interface UserPrompt {
  role: 'user';
  content: string;
}

export interface AssistantPrompt {
  role: 'assistant';
  content: string;
}

export type Message = SystemPrompt | UserPrompt | AssistantPrompt;

export interface Conversation {
  system: string;
  messages: Message[];
}

export interface PromptTemplate {
  system: string;
  user: string;
  assistant: string;
} 