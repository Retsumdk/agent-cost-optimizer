/**
 * Core types for agent cost optimization
 */

export interface ModelPricing {
  promptTokens: number; // per 1M tokens
  completionTokens: number; // per 1M tokens
}

export interface CostRecord {
  id: string;
  timestamp: string;
  agentId: string;
  sessionId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalCost: number;
  toolCalls?: number;
  metadata?: Record<string, any>;
}

export interface Budget {
  agentId: string;
  dailyLimit: number;
  sessionLimit: number;
  monthlyLimit: number;
  currency: string;
}

export interface UsageSummary {
  agentId: string;
  dailyTotal: number;
  monthlyTotal: number;
  sessionTotal: number;
  lastUpdate: string;
}

export interface EnforcementResult {
  allowed: boolean;
  reason?: string;
  remainingBudget: number;
}

export enum PricingProvider {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  GOOGLE = "google",
  COHERE = "cohere",
}
