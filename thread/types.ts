import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export interface ChatMessage {
  role: string;
  content: string;
}

export const ROLES = {
  SYSTEM: 'system',
  USER: 'user',
  ASSISTANT: 'assistant'
} as const;

export const MODELS = {
  GPT4: "gpt-4",
  GPT4_MINI: "gpt-4o-mini"
} as const;

export const PROMPTS = {
  SUMMARIZATION: (previousSummary: string, userMessage: string, assistantResponse: string) => 
    `Please summarize the following conversation in a concise manner, incorporating the previous summary if available:
<previous_summary>${previousSummary || "No previous summary"}</previous_summary>
<current_turn> User: ${userMessage}\nAssistant: ${assistantResponse} </current_turn>`,

  SYSTEM: (summarization: string) =>
    `You are Alice, a helpful assistant who speaks using as few words as possible. 
    ${summarization ? `Here is a summary of the conversation so far: 
    <conversation_summary>
      ${summarization}
    </conversation_summary>` : ''} 
    Let's chat!`
}; 