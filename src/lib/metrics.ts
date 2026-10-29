/** Shape of public/data/gamepulse-metrics.json (produced by scripts/export_gamepulse_metrics.py) */

export type Platform = "Android" | "iOS" | "PC";

export interface DailyRow {
  date: string;
  platform: Platform;
  dau: number;
  sessions: number;
  matchesStarted: number;
  matchesCompleted: number;
  newPlayers: number;
  revenue: number;
  purchases: number;
  sessionSeconds: number;
}

export interface CohortRow {
  cohortDate: string;
  platform: Platform;
  size: number;
  d1: number | null;
  d3: number | null;
  d7: number | null;
  d14: number | null;
}

export interface LevelRow {
  date: string;
  platform: Platform;
  level: number;
  started: number;
  completed: number;
  failed: number;
}

export interface Summary {
  period: { start: string; end: string };
  players: number;
  events: number;
  eventTypes: number;
  sessions: number;
  avgSessionMinutes: number;
  avgDau: number;
  matchesStarted: number;
  matchesCompleted: number;
  matchesAbandoned: number;
  matchCompletionRate: number;
  levelAttempts: number;
  levelCompleted: number;
  levelFailed: number;
  tutorialCompletionRate: number;
  revenueInr: number;
  purchases: number;
  payingPlayers: number;
  payerConversion: number;
  arpuInr: number;
  arppuInr: number;
  retention: { d1: number; d3: number; d7: number; d14: number };
  eventCounts: Record<string, number>;
}

export interface Profile {
  players: number;
  activeDaysFirst3: number;
  tutorialCompletion: number;
  payerRate: number;
}

export interface Metrics {
  source: string;
  summary: Summary;
  daily: DailyRow[];
  cohorts: CohortRow[];
  levels: LevelRow[];
  failureReasons: Record<string, number>;
  failureReasonsByLevel: Record<string, Record<string, number>>;
  revenueBySegment: { date: string; platform: Platform; segment: string; price: number }[];
  revenueByCountry: { date: string; platform: Platform; country: string; price: number }[];
  products: { product_name: string; price: number; purchases: number; revenue: number }[];
  returnersVsChurners: { retainedD7: Profile; notRetainedD7: Profile };
}
