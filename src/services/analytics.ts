/**
 * Lightweight, typed product analytics.
 *
 * Dependency-free with a pluggable sink so it can forward to RevenueCat, PostHog,
 * Amplitude, etc. in a real build. Conversion funnel events (paywall_viewed →
 * purchase_started → purchase_completed) are what a monetization app is judged on.
 */
export type AnalyticsEvent =
  | { name: 'app_opened' }
  | { name: 'habit_created'; category: string; total: number }
  | { name: 'habit_completed'; streak: number }
  | { name: 'paywall_viewed'; source: string }
  | { name: 'purchase_started'; packageId: string }
  | { name: 'purchase_completed'; packageId: string; mock: boolean }
  | { name: 'purchase_cancelled'; packageId: string }
  | { name: 'purchase_failed'; packageId: string; reason: string }
  | { name: 'restore_completed'; isPro: boolean }
  | { name: 'coach_viewed'; locked: boolean };

export interface AnalyticsSink {
  track(event: AnalyticsEvent, ts: number): void;
}

/** In-memory sink — used by tests and as a safe default. */
export class MemorySink implements AnalyticsSink {
  events: Array<{ event: AnalyticsEvent; ts: number }> = [];
  track(event: AnalyticsEvent, ts: number): void {
    this.events.push({ event, ts });
  }
  names(): string[] {
    return this.events.map((e) => e.event.name);
  }
  last(): AnalyticsEvent | undefined {
    return this.events.at(-1)?.event;
  }
}

class Analytics {
  private sinks: AnalyticsSink[] = [];
  private now: () => number = () => Date.now();

  addSink(sink: AnalyticsSink): void {
    this.sinks.push(sink);
  }

  setClock(now: () => number): void {
    this.now = now;
  }

  reset(): void {
    this.sinks = [];
  }

  track(event: AnalyticsEvent): void {
    const ts = this.now();
    for (const sink of this.sinks) {
      try {
        sink.track(event, ts);
      } catch {
        /* analytics must never break the app */
      }
    }
  }

  /** Funnel conversion rate between two event names (0..1). */
  conversionRate(sink: MemorySink, from: AnalyticsEvent['name'], to: AnalyticsEvent['name']): number {
    const fromN = sink.events.filter((e) => e.event.name === from).length;
    const toN = sink.events.filter((e) => e.event.name === to).length;
    return fromN === 0 ? 0 : Math.min(1, toN / fromN);
  }
}

export const analytics = new Analytics();
