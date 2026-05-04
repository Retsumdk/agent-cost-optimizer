import { CostRecord } from "./types";
import { writeFileSync } from "fs";

export class DataExporter {
  public static toCSV(records: CostRecord[]): string {
    if (records.length === 0) return "";

    const headers = [
      "ID",
      "Timestamp",
      "Agent ID",
      "Session ID",
      "Model",
      "Prompt Tokens",
      "Completion Tokens",
      "Total Cost (USD)"
    ];

    const rows = records.map(r => [
      r.id,
      r.timestamp,
      r.agentId,
      r.sessionId,
      r.model,
      r.promptTokens,
      r.completionTokens,
      r.totalCost.toFixed(6)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    return csvContent;
  }

  public static exportToFile(records: CostRecord[], filePath: string): boolean {
    try {
      const csv = this.toCSV(records);
      writeFileSync(filePath, csv);
      return true;
    } catch (e) {
      console.error("Failed to export data:", e);
      return false;
    }
  }

  public static toMarkdownTable(records: CostRecord[]): string {
    if (records.length === 0) return "No records found.";

    const header = "| Timestamp | Agent | Model | Cost (USD) |\n| --- | --- | --- | --- |";
    const rows = records.map(r => 
      `| ${r.timestamp.substring(0, 19).replace('T', ' ')} | ${r.agentId} | ${r.model} | ${r.totalCost.toFixed(6)} |`
    ).join("\n");

    return `${header}\n${rows}`;
  }
}
