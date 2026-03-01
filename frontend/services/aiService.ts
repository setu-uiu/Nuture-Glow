import { apiFetch } from './api';
import { Language } from "../types";

export interface HealthData {
  pregnancyWeek: string;
  vaccinesDue: number;
  hydrationLevel: string;
  recentMood?: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface ChatResponse {
  text: string;
  model_used: string;
  intent: string;
  sources?: any[];
  risk_level?: RiskLevel;
}

export class AIService {
  static async chatAssistant(
    message: string,
    locale: Language,
    includeContext: boolean = false
  ): Promise<ChatResponse> {
    const response = await apiFetch<ChatResponse>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        locale,
        includeContext
      })
    });
    return response;
  }

  static async getHealthInsights(data: HealthData, locale: Language): Promise<string[]> {
    try {
      const response = await apiFetch<{ insights: string[] }>('/api/ai/insights', {
        method: 'POST',
        body: JSON.stringify({
          pregnancyWeek: data.pregnancyWeek,
          vaccinesDue: data.vaccinesDue,
          hydrationLevel: data.hydrationLevel,
          locale
        })
      });
      return response.insights || [];
    } catch (error) {
      console.error("Health Insights Error:", error);
      return [
        "Stay hydrated by drinking 8-10 glasses of water daily.",
        "Keep tracking your symptoms and mood in your journal.",
        "Consult your doctor for personalized medical advice."
      ];
    }
  }

  static async checkMyth(statement: string, locale: Language): Promise<{ status: string, explanation: string }> {
    try {
      const response = await apiFetch<{ status: string, explanation: string }>('/api/ai/check-myth', {
        method: 'POST',
        body: JSON.stringify({
          statement,
          locale
        })
      });
      return response;
    } catch (error) {
      console.error("Myth Check Error:", error);
      return {
        status: 'Unknown',
        explanation: 'Unable to verify at this time. Please consult a healthcare professional.'
      };
    }
  }

  static async generateSpeech(text: string, locale: Language): Promise<string> {
    // Speech generation via backend or fallback to native
    return "";
  }
}
