# Agent Cost Optimizer

Real-time agent operation cost tracking and autonomous budget allocation with cost-ceiling enforcement.

## Features

- **Real-time Cost Tracking**: Track token usage across different LLM providers (OpenAI, Anthropic, Google).
- **Budget Management**: Set daily, per-session, and monthly budget limits for multiple agents.
- **Ceiling Enforcement**: Automatically check and block operations that exceed budget limits.
- **Cost Analysis**: Generate usage summaries and export data to CSV or Markdown.
- **Alerting System**: Get notified when agents reach specific budget thresholds (50%, 80%, 90%, 100%).

## Installation

```bash
bun install
```

## Usage

### Record Token Usage

```bash
bun src/index.ts record -a agent-1 -s session-123 -m gpt-4o -p 500 -c 200
```

### Check Budget Status

```bash
bun src/index.ts check -a agent-1 -s session-123
```

### Set Agent Budgets

```bash
bun src/index.ts set-budget -a agent-1 -d 5.0 -s 0.5 -m 50.0
```

### View Usage Summary

```bash
bun src/index.ts summary -a agent-1
```

### List All Budgets

```bash
bun src/index.ts list-budgets
```

## Architecture

- `CostTracker`: Manages the persistence and aggregation of cost records.
- `BudgetManager`: Handles agent-specific budget configurations.
- `CeilingEnforcer`: Core logic for determining if an operation is allowed based on current usage and budget.
- `AlertManager`: Monitors usage levels and triggers notifications at configurable thresholds.
- `DataExporter`: Utility for exporting cost data to various formats.

## Configuration

Pricing data is maintained in `src/providers.ts` and can be updated to reflect current API costs. Data is stored locally in the `data/` directory.

## License

MIT
