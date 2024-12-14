interface MetricEvent {
  timestamp: Date;
  type: 'request' | 'response' | 'error' | 'cost' | 'latency';
  value: number;
  metadata?: Record<string, any>;
}

export class MetricsManager {
  private metrics: MetricEvent[] = [];
  private readonly maxStoredEvents: number;

  constructor(maxStoredEvents: number = 1000) {
    this.maxStoredEvents = maxStoredEvents;
  }

  trackEvent(type: MetricEvent['type'], value: number, metadata?: Record<string, any>): void {
    this.metrics.push({
      timestamp: new Date(),
      type,
      value,
      metadata
    });

    // Zachowaj tylko ostatnie wydarzenia
    if (this.metrics.length > this.maxStoredEvents) {
      this.metrics = this.metrics.slice(-this.maxStoredEvents);
    }
  }

  getMetrics(type?: MetricEvent['type'], timeRange?: { start: Date; end: Date }): MetricEvent[] {
    let filtered = this.metrics;

    if (type) {
      filtered = filtered.filter(m => m.type === type);
    }

    if (timeRange) {
      filtered = filtered.filter(
        m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    return filtered;
  }

  calculateAverages(): Record<MetricEvent['type'], number> {
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};

    this.metrics.forEach(metric => {
      sums[metric.type] = (sums[metric.type] || 0) + metric.value;
      counts[metric.type] = (counts[metric.type] || 0) + 1;
    });

    return Object.keys(sums).reduce((acc, type) => {
      acc[type as MetricEvent['type']] = sums[type] / counts[type];
      return acc;
    }, {} as Record<MetricEvent['type'], number>);
  }
} 