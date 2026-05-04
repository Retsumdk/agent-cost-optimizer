import { CostTracker } from "./tracker";
import { BudgetManager } from "./budget";
import { EnforcementResult } from "./types";

export class CeilingEnforcer {
  private tracker: CostTracker;
  private budgetManager: BudgetManager;

  constructor(tracker: CostTracker, budgetManager: BudgetManager) {
    this.tracker = tracker;
    this.budgetManager = budgetManager;
  }

  /**
   * Checks if an agent's current usage allows for further operations
   */
  public check(agentId: string, sessionId: string): EnforcementResult {
    const budget = this.budgetManager.getBudget(agentId);
    const usage = this.tracker.getSummary(agentId, sessionId);

    // Check session limit
    if (usage.sessionTotal >= budget.sessionLimit) {
      return {
        allowed: false,
        reason: `Session budget of ${budget.sessionLimit} ${budget.currency} exceeded (Current: ${usage.sessionTotal.toFixed(4)})`,
        remainingBudget: 0
      };
    }

    // Check daily limit
    if (usage.dailyTotal >= budget.dailyLimit) {
      return {
        allowed: false,
        reason: `Daily budget of ${budget.dailyLimit} ${budget.currency} exceeded (Current: ${usage.dailyTotal.toFixed(4)})`,
        remainingBudget: 0
      };
    }

    // Check monthly limit
    if (usage.monthlyTotal >= budget.monthlyLimit) {
      return {
        allowed: false,
        reason: `Monthly budget of ${budget.monthlyLimit} ${budget.currency} exceeded (Current: ${usage.monthlyTotal.toFixed(4)})`,
        remainingBudget: 0
      };
    }

    // Calculate minimum remaining budget across all tiers
    const remainingSession = budget.sessionLimit - usage.sessionTotal;
    const remainingDaily = budget.dailyLimit - usage.dailyTotal;
    const remainingMonthly = budget.monthlyLimit - usage.monthlyTotal;

    const minRemaining = Math.min(remainingSession, remainingDaily, remainingMonthly);

    return {
      allowed: true,
      remainingBudget: minRemaining
    };
  }

  /**
   * Predicts if a future call will exceed the budget
   */
  public willExceed(
    agentId: string, 
    sessionId: string, 
    estimatedPromptTokens: number, 
    estimatedCompletionTokens: number,
    model: string
  ): boolean {
    const result = this.check(agentId, sessionId);
    if (!result.allowed) return true;

    // Implementation of cost calculation from providers would be better
    // but we can just use a helper or import it
    const { calculateCost } = require("./providers");
    const estimatedCost = calculateCost(model, estimatedPromptTokens, estimatedCompletionTokens);

    return estimatedCost > result.remainingBudget;
  }
}
