---
title: Monitoring & Analytics - Szczegółowa Dokumentacja
topics: [Monitoring & Analytics - Szczegółowa Dokumentacja, 1. Narzędzia Monitoringu, Langfuse, Tiktokenizer, Custom Analytics, 2. Przykłady Implementacji, LLM Monitoring, Token Usage Analysis, Performance Tracking, 3. Metryki i KPI, LLM Metrics, 4. Best Practices, Monitoring Strategy, 5. Przydatne Snippety, Cost Calculator, Performance Monitor, 6. Troubleshooting, Common Issues, 7. Integracje, Monitoring Platforms, Analytics Tools, Alert Systems]
keywords: [typescript
import { LangfuseClient } from '../utils/api/langfuse';, typescript
import { Tokenizer } from '../utils/helpers/tokenCounter';, typescript
import { AnalyticsTracker } from '../utils/helpers/analytics';, typescript
const tracker = new LangfuseClient({
    apiKey: process.env.LANGFUSE_API_KEY
});

// Śledzenie wywołania modelu
await tracker.track({
    model: 'gpt-4',
    prompt: prompt,
    completion: response,
    tokens: tokenCount,
    latency: responseTime
});, typescript
const tokenizer = new Tokenizer();

// Analiza użycia tokenów
const analysis = await tokenizer.analyzeUsage({
    model: 'gpt-4',
    timeRange: 'last-7-days',
    groupBy: 'endpoint'
});, typescript
const analytics = new AnalyticsTracker();

// Śledzenie wydajności
analytics.trackOperation({
    name: 'embedding-generation',
    duration: endTime - startTime,
    status: 'success',
    metadata: { batchSize, model }
});, typescript
class CostCalculator {
    private readonly modelRates = {
        'gpt-4': 0.03,
        'gpt-3.5-turbo': 0.002
    };

    calculateCost(model: string, tokens: number): number {
        return this.modelRates[model]  tokens / 1000;
    }
}, typescript
class PerformanceMonitor {
    private metrics: Map<string, number[]> = new Map();

    track(operation: string, duration: number) {
        if (!this.metrics.has(operation)) {
            this.metrics.set(operation, []);
        }
        this.metrics.get(operation)!.push(duration);
    }

    getStats(operation: string) {
        const durations = this.metrics.get(operation) || [];
        return {
            avg: this.average(durations),
            p95: this.percentile(durations, 95),
            p99: this.percentile(durations, 99)
        };
    }
}]
lastUpdated: 2024-12-14T02:09:16.830Z


---

# Monitoring & Analytics - Szczegółowa Dokumentacja

## 1. Narzędzia Monitoringu
### Langfuse
```typescript
import { LangfuseClient } from '../utils/api/langfuse';
```
- LLM monitoring
- Performance tracking
- Cost analysis

### Tiktokenizer
```typescript
import { Tokenizer } from '../utils/helpers/tokenCounter';
```
- Token counting
- Cost estimation
- Model compatibility

### Custom Analytics
```typescript
import { AnalyticsTracker } from '../utils/helpers/analytics';
```
- Usage tracking
- Error monitoring
- Performance metrics

## 2. Przykłady Implementacji

### LLM Monitoring
```typescript
const tracker = new LangfuseClient({
    apiKey: process.env.LANGFUSE_API_KEY
});

// Śledzenie wywołania modelu
await tracker.track({
    model: 'gpt-4',
    prompt: prompt,
    completion: response,
    tokens: tokenCount,
    latency: responseTime
});
```

### Token Usage Analysis
```typescript
const tokenizer = new Tokenizer();

// Analiza użycia tokenów
const analysis = await tokenizer.analyzeUsage({
    model: 'gpt-4',
    timeRange: 'last-7-days',
    groupBy: 'endpoint'
});
```

### Performance Tracking
```typescript
const analytics = new AnalyticsTracker();

// Śledzenie wydajności
analytics.trackOperation({
    name: 'embedding-generation',
    duration: endTime - startTime,
    status: 'success',
    metadata: { batchSize, model }
});
```

## 3. Metryki i KPI

### LLM Metrics
1. Model Performance:
   - Response time
   - Token usage
   - Success rate

2. Cost Metrics:
   - Cost per request
   - Daily/Monthly spend
   - Cost by model

3. Quality Metrics:
   - Response quality
   - Error rates
   - User feedback

## 4. Best Practices

### Monitoring Strategy
1. Data Collection:
   - Structured logging
   - Error tracking
   - Performance metrics

2. Alerting:
   - Threshold alerts
   - Error notifications
   - Cost warnings

3. Reporting:
   - Daily summaries
   - Trend analysis
   - Cost projections

## 5. Przydatne Snippety

### Cost Calculator
```typescript
class CostCalculator {
    private readonly modelRates = {
        'gpt-4': 0.03,
        'gpt-3.5-turbo': 0.002
    };

    calculateCost(model: string, tokens: number): number {
        return this.modelRates[model] * tokens / 1000;
    }
}
```

### Performance Monitor
```typescript
class PerformanceMonitor {
    private metrics: Map<string, number[]> = new Map();

    track(operation: string, duration: number) {
        if (!this.metrics.has(operation)) {
            this.metrics.set(operation, []);
        }
        this.metrics.get(operation)!.push(duration);
    }

    getStats(operation: string) {
        const durations = this.metrics.get(operation) || [];
        return {
            avg: this.average(durations),
            p95: this.percentile(durations, 95),
            p99: this.percentile(durations, 99)
        };
    }
}
```

## 6. Troubleshooting

### Common Issues
1. Data Collection Gaps
   - Rozwiązanie: Redundant logging
   - Backup collectors
   - Data validation

2. Alert Fatigue
   - Rozwiązanie: Smart thresholds
   - Alert grouping
   - Priority levels

3. Cost Spikes
   - Rozwiązanie: Budget alerts
   - Usage quotas
   - Cost optimization

## 7. Integracje

### Monitoring Platforms
- Datadog
- New Relic
- Grafana

### Analytics Tools
- Mixpanel
- Amplitude
- Custom dashboards

### Alert Systems
- PagerDuty
- OpsGenie
- Slack integrations 