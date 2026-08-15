// server/src/services/geminiClient.ts
import { env } from '../config/env.js';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{
    text: string;
  }>;
}

interface GeminiRequest {
  contents: GeminiMessage[];
  systemInstruction?: {
    parts: Array<{
      text: string;
    }>;
  };
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    responseMimeType?: string;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
    index: number;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

function isGeminiResponse(value: unknown): value is GeminiResponse {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as { candidates?: unknown };
  if (!Array.isArray(candidate.candidates) || candidate.candidates.length === 0) {
    return false;
  }

  return true;
}

export class GeminiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseData?: any,
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

export class GeminiClient {
  private apiKey: string;
  private model: string;
  private apiUrl: string;

  constructor() {
    if (!env?.gemini?.apiKey) {
      throw new Error('Gemini API key is not configured. Check your .env file.');
    }
    this.apiKey = env.gemini.apiKey;
    this.model = env.gemini.model;
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  }

  async generateAssessment(messages: any[], temperature = 0.4): Promise<string> {
    try {
      // Separate system message from user/assistant messages
      let systemInstruction: { parts: Array<{ text: string }> } | undefined;
      const geminiMessages: GeminiMessage[] = [];

      messages.forEach((msg) => {
        if (msg.role === 'system') {
          systemInstruction = {
            parts: [{ text: msg.content }],
          };
        } else {
          const role = msg.role === 'assistant' ? 'model' : 'user';
          geminiMessages.push({
            role,
            parts: [{ text: msg.content }],
          });
        }
      });

      const requestBody: GeminiRequest = {
        contents: geminiMessages,
        generationConfig: {
          temperature: temperature,       // Lower temperature for consistency
          maxOutputTokens: 12000,          // Increased for 30 questions
          responseMimeType: 'application/json', // Force JSON output
        },
      };

      // Add system instruction if present
      if (systemInstruction) {
        requestBody.systemInstruction = systemInstruction;
      }

      console.log('📡 Sending request to Gemini...');
      console.log('Model:', this.model);
      console.log('Max output tokens:', requestBody.generationConfig.maxOutputTokens);
      console.log('Temperature:', requestBody.generationConfig.temperature);

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(180000), // 180 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Gemini API error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });

        if (response.status === 401 || response.status === 403) {
          throw new GeminiError('Invalid Gemini API key', response.status, errorData);
        } else if (response.status === 429) {
          throw new GeminiError('Gemini rate limit exceeded', 429, errorData);
        } else if (response.status === 503) {
          throw new GeminiError('Gemini service unavailable', 503, errorData);
        } else {
          throw new GeminiError(
            `Gemini API error: ${response.statusText}`,
            response.status,
            errorData,
          );
        }
      }

      const rawData: unknown = await response.json();
      if (!isGeminiResponse(rawData)) {
        console.error('Invalid Gemini response shape:', rawData);
        throw new GeminiError('Invalid response format from Gemini');
      }
      const data: GeminiResponse = rawData;

      if (!data.candidates || data.candidates.length === 0) {
        console.error('No candidates in response:', data);
        throw new GeminiError('No response from Gemini');
      }

      const candidate = data.candidates[0];

      // Log finish reason
      console.log('Finish reason:', candidate.finishReason);

      if (candidate.finishReason === 'MAX_TOKENS') {
        console.warn('⚠️ Response truncated (MAX_TOKENS). Consider increasing maxOutputTokens or reducing question count.');
      }

      if (candidate.finishReason === 'SAFETY') {
        throw new GeminiError('Response blocked by safety filters');
      }

      // Read ALL parts, not just parts[0]
      const content = candidate.content?.parts
        ?.map(part => part.text)
        .filter(Boolean)
        .join('') || '';

      if (!content) {
        console.error('Empty content. Candidate:', JSON.stringify(candidate, null, 2));
        throw new GeminiError('Empty response from Gemini');
      }

      console.log('Response length:', content.length, 'characters');
      if (data.usageMetadata) {
        console.log('Token usage:', {
          prompt: data.usageMetadata.promptTokenCount,
          output: data.usageMetadata.candidatesTokenCount,
          total: data.usageMetadata.totalTokenCount,
        });
      }

      return content;
    } catch (error) {
      if (error instanceof GeminiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new GeminiError('Gemini request timed out', 504);
      }

      console.error('Unexpected Gemini error:', error);
      throw new GeminiError('Failed to communicate with Gemini');
    }
  }

  async generateWithRetry(messages: any[], maxRetries = 3): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Keep temperature constant at 0.4 for all attempts
        return await this.generateAssessment(messages, 0.4);
      } catch (error) {
        lastError = error as Error;
        console.error(`Gemini attempt ${attempt}/${maxRetries} failed:`, error);

        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = 2000 * attempt;
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    throw lastError || new GeminiError('All Gemini attempts failed');
  }
}

export const geminiClient = new GeminiClient();