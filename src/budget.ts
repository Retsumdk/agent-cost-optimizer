import { Budget } from "./types";
import { writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";

export class BudgetManager {
  private budgets: Map<string, Budget> = new Map();
  private configPath: string;

  constructor(storageDir: string = "./data") {
    this.configPath = join(storageDir, "budgets.json");
    this.loadBudgets();
  }

  private loadBudgets() {
    if (existsSync(this.configPath)) {
      try {
        const data = readFileSync(this.configPath, "utf-8");
        const list: Budget[] = JSON.parse(data);
        for (const b of list) {
          this.budgets.set(b.agentId, b);
        }
      } catch (e) {
        console.error("Failed to load budgets:", e);
      }
    }
  }

  private saveBudgets() {
    try {
      const list = Array.from(this.budgets.values());
      writeFileSync(this.configPath, JSON.stringify(list, null, 2));
    } catch (e) {
      console.error("Failed to save budgets:", e);
    }
  }

  public setBudget(budget: Budget) {
    this.budgets.set(budget.agentId, budget);
    this.saveBudgets();
  }

  public getBudget(agentId: string): Budget {
    const existing = this.budgets.get(agentId);
    if (existing) return existing;

    // Default budget if none exists
    return {
      agentId,
      dailyLimit: 1.0, // $1.00
      sessionLimit: 0.1, // $0.10
      monthlyLimit: 10.0, // $10.00
      currency: "USD"
    };
  }

  public listBudgets(): Budget[] {
    return Array.from(this.budgets.values());
  }
}
