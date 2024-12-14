import { Message, Conversation, PromptTemplate } from './types';

export function createConversation(template: PromptTemplate): Conversation {
  return {
    system: template.system,
    messages: [
      { role: 'user', content: template.user },
      { role: 'assistant', content: template.assistant }
    ]
  };
}

export function addMessage(conversation: Conversation, message: Message): Conversation {
  return {
    ...conversation,
    messages: [...conversation.messages, message]
  };
}

export function formatPrompt(template: string, variables: Record<string, string>): string {
  return Object.entries(variables).reduce(
    (prompt, [key, value]) => prompt.replace(`{{${key}}}`, value),
    template
  );
} 