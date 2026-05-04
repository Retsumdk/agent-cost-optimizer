#!/usr/bin/env bun
/**
 * agent-cost-optimizer - Real-time agent operation cost tracking and autonomous budget allocation with cost-ceiling enforcement
 */

import { Command } from "commander";
import { CostTracker } from "./tracker";
import { BudgetManager } from "./budget";
import { CeilingEnforcer } from "./enforcer";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

const tracker = new CostTracker(DATA_DIR);
const budgetManager = new BudgetManager(DATA_DIR);
const enforcer = new CeilingEnforcer(tracker, budgetManager);

const program = new Command();
program
  .name("agent-cost")
  .description("AI Agent Cost Optimization and Budget Enforcement CLI")
  .version("1.0.0");

// Record usage
program
  .command("record")
  .description("Record token usage for an agent session")
  .requiredOption("-a, --agent <id>", "Agent ID")
  .requiredOption("-s, --session <id>", "Session ID")
  .requiredOption("-m, --model <name>", "Model name (e.g., gpt-4o)")
  .requiredOption("-p, --prompt <count>", "Prompt token count", parseInt)
  .requiredOption("-c, --completion <count>", "Completion token count", parseInt)
  .action((opts) => {
    const record = tracker.recordUsage(
      opts.agent,
      opts.session,
      opts.model,
      opts.prompt,
      opts.completion
    );
    console.log(`✅ Recorded: ${record.totalCost.toFixed(6)} USD`);
  });

// Check budget
program
  .command("check")
  .description("Check if an agent has remaining budget")
  .requiredOption("-a, --agent <id>", "Agent ID")
  .requiredOption("-s, --session <id>", "Session ID")
  .action((opts) => {
    const result = enforcer.check(opts.agent, opts.session);
    if (result.allowed) {
      console.log(`✅ Allowed. Remaining budget: ${result.remainingBudget.toFixed(4)} USD`);
    } else {
      console.log(`❌ Denied: ${result.reason}`);
    }
  });

// Set budget
program
  .command("set-budget")
  .description("Set budget limits for an agent")
  .requiredOption("-a, --agent <id>", "Agent ID")
  .option("-d, --daily <limit>", "Daily limit in USD", parseFloat, 1.0)
  .option("-s, --session <limit>", "Session limit in USD", parseFloat, 0.1)
  .option("-m, --monthly <limit>", "Monthly limit in USD", parseFloat, 10.0)
  .action((opts) => {
    budgetManager.setBudget({
      agentId: opts.agent,
      dailyLimit: opts.daily,
      sessionLimit: opts.session,
      monthlyLimit: opts.monthly,
      currency: "USD"
    });
    console.log(`✅ Budget set for agent: ${opts.agent}`);
  });

// Show summary
program
  .command("summary")
  .description("Show usage summary for an agent")
  .requiredOption("-a, --agent <id>", "Agent ID")
  .option("-s, --session <id>", "Session ID")
  .action((opts) => {
    const summary = tracker.getSummary(opts.agent, opts.session);
    console.log(`\nUsage Summary for Agent: ${opts.agent}`);
    console.log(`-----------------------------------`);
    console.log(`Session: ${summary.sessionTotal.toFixed(6)} USD`);
    console.log(`Daily:   ${summary.dailyTotal.toFixed(6)} USD`);
    console.log(`Monthly: ${summary.monthlyTotal.toFixed(6)} USD`);
    console.log(`Last Updated: ${summary.lastUpdate}\n`);
  });

// List budgets
program
  .command("list-budgets")
  .description("List all configured budgets")
  .action(() => {
    const budgets = budgetManager.listBudgets();
    console.table(budgets);
  });

program.parse(process.argv);
