import { AI_DEVS_3_ASSISTANT, PROMPT_ENGINEER, CODE_REVIEWER } from './systemPrompts';

export const examplePrompts = {
  // Przykład promptu dla asystenta
  assistant: {
    system: AI_DEVS_3_ASSISTANT,
    user: "Jak zaimplementować cache dla odpowiedzi LLM?",
    assistant: "Oto przykład implementacji cache managera..."
  },

  // Przykład promptu dla inżyniera promptów
  promptEngineer: {
    system: PROMPT_ENGINEER,
    user: "Zaprojektuj prompt do klasyfikacji tekstu",
    assistant: "Oto struktura promptu do klasyfikacji..."
  },

  // Przykład promptu dla code reviewera
  codeReviewer: {
    system: CODE_REVIEWER,
    user: "Sprawdź ten kod pod kątem bezpieczeństwa...",
    assistant: "Znalazłem następujące problemy..."
  }
}; 