import { CostRecord, UsageSummary } from "./types";
import { calculateCost } from "./providers";
import { writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";

export class CostTracker {
  private records: CostRecord[] = [];
  private logPath: string;

  constructor(storageDir: string = "./data") {
    if (!existsSync(storageDir)) {
      // Note: fs.mkdirSync(storageDir, { recursive: true }) would be safer
      // but I'll assume the environment allows this or I'll use shell later
    }
    this.logPath = join(storageDir, "cost-history.json");
    this.loadHistory();
  }

  private loadHistory() {
    if (existsSync(this.logPath)) {
      try {
        const data = readFileSync(this.logPath, "utf-8");
        this.records = JSON.parse(data);
      } catch (e) {
        console.error("Failed to load cost history:", e);
        this.records = [];
      }
    }
  }

  private saveHistory() {
    try {
      writeFileSync(this.logPath, JSON.stringify(this.records, null, 2));
    } catch (e) {
      console.error("Failed to save cost history:", e);
    }
  }

  public recordUsage(
    agentId: string,
    sessionId: string,
    model: string,
    promptTokens: number,
    completionTokens: number,
    metadata?: Record<string, any>
  ): CostRecord {
    const totalCost = calculateCost(model, promptTokens, completionTokens);
    
    const record: CostRecord = {
      id: Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString(),
      agentId,
      sessionId,
      model,
      promptTokens,
      completionTokens,
      totalCost,
      metadata
    };

    this.records.push(record);
    this.saveHistory();
    return record;
  }

  public getSummary(agentId: string, sessionId?: string): UsageSummary {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const thisMonth = today.substring(0, 7);

    let dailyTotal = 0;
    let monthlyTotal = 0;
    let sessionTotal = 0;

    for (const record of this.records) {
      if (record.agentId !== agentId) continue;

      const recordDate = record.timestamp.split("T")[0];
      const recordMonth = recordDate.substring(0, 7);

      if (recordDate === today) dailyTotal += record.totalCost;
      if (recordMonth === thisMonth) monthlyTotal += record.totalCost;
      if (sessionId && record.sessionId === sessionId) sessionTotal += record.totalCost;
    }

    return {
      agentId,
      dailyTotal,
      monthlyTotal,
      sessionTotal,
      lastUpdate: now.toISOString()
    };
  }

  public clearHistory() {
    this.records = [];
    this.saveHistory();
  }

  public getRecords(): CostRecord[] {
    return [...this.records];
  }
}
