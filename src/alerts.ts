import { UsageSummary, Budget } from "./types";

export enum AlertLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL",
}

export interface CostAlert {
  level: AlertLevel;
  message: string;
  thresholdReached: number;
  agentId: string;
}

export class AlertManager {
  private thresholds = [0.5, 0.8, 0.9, 1.0]; // Percentage of budget
  private triggeredAlerts: Set<string> = new Set();

  public checkAlerts(summary: UsageSummary, budget: Budget): CostAlert[] {
    const alerts: CostAlert[] = [];
    
    // Check daily budget thresholds
    const dailyPercent = summary.dailyTotal / budget.dailyLimit;
    this.processThresholds(dailyPercent, "daily", summary.agentId, alerts);

    // Check monthly budget thresholds
    const monthlyPercent = summary.monthlyTotal / budget.monthlyLimit;
    this.processThresholds(monthlyPercent, "monthly", summary.agentId, alerts);

    return alerts;
  }

  private processThresholds(percent: number, type: string, agentId: string, alerts: CostAlert[]) {
    for (const threshold of this.thresholds) {
      if (percent >= threshold) {
        const alertKey = `${agentId}-${type}-${threshold}`;
        if (!this.triggeredAlerts.has(alertKey)) {
          const level = threshold >= 1.0 ? AlertLevel.CRITICAL : 
                        threshold >= 0.8 ? AlertLevel.WARNING : AlertLevel.INFO;
          
          alerts.push({
            level,
            message: `${agentId} has reached ${(threshold * 100).toFixed(0)}% of its ${type} budget.`,
            thresholdReached: threshold,
            agentId
          });
          
          this.triggeredAlerts.add(alertKey);
        }
      }
    }
  }

  public resetAlerts(agentId?: string) {
    if (agentId) {
      for (const key of this.triggeredAlerts) {
        if (key.startsWith(`${agentId}-`)) {
          this.triggeredAlerts.delete(key);
        }
      }
    } else {
      this.triggeredAlerts.clear();
    }
  }
}
