interface CostConfig {
  model: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
  maxBudget: number;
}

export class LLMCostManager {
  private costs: Map<string, number> = new Map();
  private configs: Map<string, CostConfig> = new Map();
  
  constructor(configs: CostConfig[]) {
    configs.forEach(config => {
      this.configs.set(config.model, config);
      this.costs.set(config.model, 0);
    });
  }

  calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const config = this.configs.get(model);
    if (!config) throw new Error(`No config found for model: ${model}`);

    const inputCost = (inputTokens / 1000) * config.inputCostPer1k;
    const outputCost = (outputTokens / 1000) * config.outputCostPer1k;
    
    return inputCost + outputCost;
  }

  trackUsage(model: string, cost: number): boolean {
    const currentCost = this.costs.get(model) || 0;
    const config = this.configs.get(model);
    
    if (!config) throw new Error(`No config found for model: ${model}`);
    
    if (currentCost + cost > config.maxBudget) {
      return false;
    }

    this.costs.set(model, currentCost + cost);
    return true;
  }

  getCurrentCosts(): Map<string, number> {
    return new Map(this.costs);
  }

  resetCosts(): void {
    this.costs.clear();
  }
} 