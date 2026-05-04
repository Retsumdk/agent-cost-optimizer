import { ModelPricing, PricingProvider } from "./types";

/**
 * Static pricing data for popular LLM models
 * Prices are in USD per 1,000,000 tokens
 */
export const MODEL_PRICING: Record<string, ModelPricing> = {
  // OpenAI
  "gpt-4o": { promptTokens: 5.0, completionTokens: 15.0 },
  "gpt-4o-mini": { promptTokens: 0.15, completionTokens: 0.6 },
  "gpt-4-turbo": { promptTokens: 10.0, completionTokens: 30.0 },
  "gpt-3.5-turbo": { promptTokens: 0.5, completionTokens: 1.5 },

  // Anthropic
  "claude-3-5-sonnet": { promptTokens: 3.0, completionTokens: 15.0 },
  "claude-3-opus": { promptTokens: 15.0, completionTokens: 75.0 },
  "claude-3-haiku": { promptTokens: 0.25, completionTokens: 1.25 },

  // Google
  "gemini-1.5-pro": { promptTokens: 3.5, completionTokens: 10.5 },
  "gemini-1.5-flash": { promptTokens: 0.075, completionTokens: 0.3 },
};

export function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    console.warn(`Pricing for model ${model} not found. Using default low-cost estimate.`);
    return ((promptTokens * 0.5) + (completionTokens * 1.5)) / 1_000_000;
  }

  const promptCost = (promptTokens / 1_000_000) * pricing.promptTokens;
  const completionCost = (completionTokens / 1_000_000) * pricing.completionTokens;

  return promptCost + completionCost;
}

export function getProvider(model: string): PricingProvider {
  if (model.startsWith("gpt")) return PricingProvider.OPENAI;
  if (model.startsWith("claude")) return PricingProvider.ANTHROPIC;
  if (model.startsWith("gemini")) return PricingProvider.GOOGLE;
  return PricingProvider.OPENAI; // Default
}
