import { DemoManagement, DemoModeration } from '../../../cases/workspace/data/case-workspace.demo';

// Presentation models for the local demonstration, not REST contracts.
export interface ReportRow {
  code: string; title: string; territory: string; category: string; date: string;
  originalStatus: string; management: DemoManagement; moderation: DemoModeration;
  assignee: string; modified: boolean;
}
export interface ReportFilters {query: string; territory: string; category: string; management: string; moderation: string; assignee: string;}
export interface ReportDistribution {label: string; count: number; percent: number;}
export const EMPTY_REPORT_FILTERS: ReportFilters = {query: '', territory: '', category: '', management: '', moderation: '', assignee: ''};

function normalize(value: string) {return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');}
export function filterReportRows(rows: readonly ReportRow[], filters: ReportFilters): readonly ReportRow[] {
  return rows.filter(row => normalize(`${row.code} ${row.title} ${row.territory} ${row.assignee}`).includes(normalize(filters.query)) &&
    (!filters.territory || row.territory === filters.territory) && (!filters.category || row.category === filters.category) &&
    (!filters.management || row.management === filters.management) && (!filters.moderation || row.moderation === filters.moderation) &&
    (!filters.assignee || row.assignee === filters.assignee));
}
export function reportDistribution(rows: readonly ReportRow[], key: 'management' | 'category'): readonly ReportDistribution[] {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row[key], (counts.get(row[key]) ?? 0) + 1);
  return [...counts].map(([label, count]) => ({label, count, percent: count / rows.length * 100})).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
}
