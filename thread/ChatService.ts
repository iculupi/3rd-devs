import { OpenAIService } from './OpenAIService';
import { LogService } from './services/LogService';
import { ROLES, MODELS, PROMPTS } from './types';
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type OpenAI from 'openai';

export class ChatService {
  private openaiService: OpenAIService;
  private logService: LogService;
  private previousSummarization: string = "";

  constructor() {
    this.openaiService = new OpenAIService();
    this.logService = new LogService();
  }

  /**
   * Generates a conversation summary based on the current exchange
   */
  private async generateSummarization(
    userMessage: ChatCompletionMessageParam, 
    assistantResponse: ChatCompletionMessageParam
  ): Promise<string> {
    const summarizationPrompt: ChatCompletionMessageParam = {
      role: ROLES.SYSTEM,
      content: PROMPTS.SUMMARIZATION(
        this.previousSummarization,
        userMessage.content ?? '',
        assistantResponse.content ?? ''
      )
    };

    const response = await this.openaiService.completion(
      [
        summarizationPrompt, 
        { role: ROLES.USER, content: "Please create/update our conversation summary." }
      ],
      MODELS.GPT4_MINI,
      false
    ) as OpenAI.Chat.Completions.ChatCompletion;

    const newSummary = response.choices[0].message.content ?? "No conversation history";
    
    // Log the new summary to file
    await this.logService.appendSummary(newSummary);

    return newSummary;
  }

  /**
   * Processes a single chat message and returns AI response
   */
  async processMessage(message: ChatCompletionMessageParam): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    const systemPrompt: ChatCompletionMessageParam = {
      role: ROLES.SYSTEM,
      content: PROMPTS.SYSTEM(this.previousSummarization)
    };

    const assistantResponse = await this.openaiService.completion(
      [systemPrompt, message],
      MODELS.GPT4,
      false
    ) as OpenAI.Chat.Completions.ChatCompletion;

    // Update conversation summary
    this.previousSummarization = await this.generateSummarization(
      message,
      assistantResponse.choices[0].message
    );

    return assistantResponse;
  }

  /**
   * Processes a demo conversation with multiple messages
   */
  async runDemo(): Promise<OpenAI.Chat.Completions.ChatCompletion | null> {
    const demoMessages: ChatCompletionMessageParam[] = [
      { content: "Hi! I'm Adam", role: ROLES.USER },
      { content: "How are you?", role: ROLES.USER },
      { content: "Do you know my name?", role: ROLES.USER }
    ];

    let lastResponse: OpenAI.Chat.Completions.ChatCompletion | null = null;

    for (const message of demoMessages) {
      console.log('--- NEXT TURN ---');
      console.log('Adam:', message.content);

      lastResponse = await this.processMessage(message);
      console.log('Alice:', lastResponse.choices[0].message.content);
    }

    return lastResponse;
  }
} 