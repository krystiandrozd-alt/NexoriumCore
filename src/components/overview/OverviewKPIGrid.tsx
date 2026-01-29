'use client';

// Nexorium Core - Overview KPI Grid Component
// Displays 6 key metrics in a responsive grid

import { KPICard, KPICardSkeleton, type KPICardProps } from './KPICard';
import type { OverviewKPIs } from '@/types/overview';

interface OverviewKPIGridProps {
  kpis: OverviewKPIs | null;
  isLoading?: boolean;
}

export function OverviewKPIGrid({ kpis, isLoading = false }: OverviewKPIGridProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const cards: KPICardProps[] = [
    {
      label: 'Total Environments',
      value: kpis.totalEnvironments,
      icon: 'environments',
      color: 'indigo',
      format: 'number',
      trend: kpis.trends?.environments,
    },
    {
      label: 'Active Systems',
      value: kpis.activeSystems,
      icon: 'systems',
      color: 'blue',
      format: 'number',
      trend: kpis.trends?.systems,
    },
    {
      label: 'Governance Alignment',
      value: kpis.governanceAlignmentPercent,
      icon: 'governance',
      color: 'emerald',
      format: 'percent',
      trend: kpis.trends?.governance,
    },
    {
      label: 'Open Violations',
      value: kpis.openViolations,
      icon: 'violations',
      color: 'rose',
      format: 'number',
      trend: kpis.trends?.violations,
    },
    {
      label: 'Avg Readiness Score',
      value: kpis.avgReadinessScore,
      icon: 'readiness',
      color: 'violet',
      format: 'percent',
      trend: kpis.trends?.readiness,
    },
    {
      label: 'Monthly Cost',
      value: kpis.monthlyCost,
      icon: 'cost',
      color: 'amber',
      format: 'currency',
      currency: kpis.currency,
      trend: kpis.trends?.cost,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <KPICard {...card} />
        </div>
      ))}
    </div>
  );
}
