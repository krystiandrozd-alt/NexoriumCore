'use client';

// TelEnvIQ - Flow Map Intelligence Panel
// Right-side contextual intelligence panel for portfolio insights

import { memo } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Target,
  ArrowRight,
  Server,
  Database,
  Briefcase,
  Globe,
  Lightbulb,
  Brain,
  BarChart3,
  Shield,
  Clock,
  GitMerge,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  FlowNode,
  Collision,
  Project,
  RiskIndicator,
  IntelligenceContext,
  PortfolioRiskSummary,
} from '@/types/flow-map';

// ============================================
// INTERFACES
// ============================================

interface FlowMapIntelligenceProps {
  isOpen: boolean;
  onToggle: () => void;
  context: IntelligenceContext | null;
  portfolioSummary: PortfolioRiskSummary;
  projects: Project[];
  onClearSelection: () => void;
  onNavigateToNode: (nodeId: string) => void;
}

// ============================================
// HELPERS
// ============================================

const nodeTypeIcons = {
  PROJECT: Briefcase,
  ENVIRONMENT: Server,
  SYSTEM: Database,
  EXTERNAL: Globe,
};

function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function TrendIcon({ trend }: { trend: 'INCREASING' | 'STABLE' | 'DECREASING' }) {
  switch (trend) {
    case 'INCREASING':
      return <TrendingUp className="h-3 w-3 text-rose-400" />;
    case 'DECREASING':
      return <TrendingDown className="h-3 w-3 text-emerald-400" />;
    default:
      return <Minus className="h-3 w-3 text-slate-400" />;
  }
}

// ============================================
// RISK METER
// ============================================

function RiskMeter({ score, label }: { score: number; label: string }) {
  const color =
    score >= 75
      ? 'from-rose-500 to-rose-600'
      : score >= 50
      ? 'from-orange-500 to-amber-500'
      : score >= 25
      ? 'from-amber-500 to-yellow-500'
      : 'from-emerald-500 to-emerald-600';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-white">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// SUGGESTION CARD
// ============================================

function SuggestionCard({
  action,
  priority,
  reasoning,
}: {
  action: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;
}) {
  const priorityColors = {
    HIGH: 'border-rose-500/50 bg-rose-500/10',
    MEDIUM: 'border-amber-500/50 bg-amber-500/10',
    LOW: 'border-emerald-500/50 bg-emerald-500/10',
  };

  const priorityBadgeColors = {
    HIGH: 'bg-rose-500/30 text-rose-300',
    MEDIUM: 'bg-amber-500/30 text-amber-300',
    LOW: 'bg-emerald-500/30 text-emerald-300',
  };

  return (
    <div className={cn('p-3 rounded-lg border', priorityColors[priority])}>
      <div className="flex items-start gap-2">
        <Lightbulb className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold', priorityBadgeColors[priority])}>
              {priority}
            </span>
          </div>
          <p className="text-xs text-white font-medium">{action}</p>
          <p className="text-[10px] text-slate-400 mt-1">{reasoning}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// NODE DETAILS SECTION
// ============================================

function NodeDetailsSection({
  node,
  relatedProjects,
  riskIndicators,
  upcomingPromotions,
  capacityStress,
  onNavigateToNode,
}: {
  node: FlowNode;
  relatedProjects?: Project[];
  riskIndicators?: RiskIndicator[];
  upcomingPromotions?: { projectId: string; projectName: string; scheduledDate: Date }[];
  capacityStress?: { current: number; projected: number; threshold: number };
  onNavigateToNode: (nodeId: string) => void;
}) {
  const Icon = nodeTypeIcons[node.type];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          <Icon className="h-5 w-5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white truncate">{node.label}</h3>
          {node.subLabel && <p className="text-xs text-slate-400">{node.subLabel}</p>}
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'px-2 py-0.5 rounded text-xs font-medium',
            node.status === 'HEALTHY'
              ? 'bg-emerald-500/20 text-emerald-300'
              : node.status === 'WARNING'
              ? 'bg-amber-500/20 text-amber-300'
              : node.status === 'CRITICAL'
              ? 'bg-rose-500/20 text-rose-300'
              : 'bg-slate-500/20 text-slate-300'
          )}
        >
          {node.status}
        </span>
        <span
          className={cn(
            'px-2 py-0.5 rounded text-xs font-medium',
            node.riskLevel === 'CRITICAL'
              ? 'bg-rose-500/20 text-rose-300'
              : node.riskLevel === 'HIGH'
              ? 'bg-orange-500/20 text-orange-300'
              : node.riskLevel === 'MEDIUM'
              ? 'bg-amber-500/20 text-amber-300'
              : 'bg-emerald-500/20 text-emerald-300'
          )}
        >
          {node.riskLevel} Risk
        </span>
      </div>

      {/* Health score */}
      <RiskMeter score={node.healthScore} label="Health Score" />

      {/* Capacity stress for environments */}
      {capacityStress && (
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-white">
            <BarChart3 className="h-4 w-4 text-violet-400" />
            Capacity Analysis
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-white">{capacityStress.current}%</div>
              <div className="text-[9px] text-slate-500">Current</div>
            </div>
            <div>
              <div className={cn('text-lg font-bold', capacityStress.projected > capacityStress.threshold ? 'text-rose-400' : 'text-amber-400')}>
                {capacityStress.projected}%
              </div>
              <div className="text-[9px] text-slate-500">Projected</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-400">{capacityStress.threshold}%</div>
              <div className="text-[9px] text-slate-500">Threshold</div>
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      {node.metadata && (
        <div className="space-y-2">
          {node.metadata.owner && (
            <div className="flex items-center gap-2 text-xs">
              <Users className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-400">Owner:</span>
              <span className="text-white">{node.metadata.owner}</span>
            </div>
          )}
          {node.metadata.team && (
            <div className="flex items-center gap-2 text-xs">
              <Users className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-400">Team:</span>
              <span className="text-white">{node.metadata.team}</span>
            </div>
          )}
          {node.metadata.vendor && (
            <div className="flex items-center gap-2 text-xs">
              <Shield className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-400">Vendor:</span>
              <span className="text-white">{node.metadata.vendor}</span>
            </div>
          )}
          {node.metadata.version && (
            <div className="flex items-center gap-2 text-xs">
              <GitMerge className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-400">Version:</span>
              <span className="text-white font-mono">{node.metadata.version}</span>
            </div>
          )}
          {node.metadata.startDate && node.metadata.endDate && (
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-400">Timeline:</span>
              <span className="text-white">
                {formatDate(node.metadata.startDate)} - {formatDate(node.metadata.endDate)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Risk indicators */}
      {riskIndicators && riskIndicators.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Risk Indicators
          </div>
          <div className="space-y-2">
            {riskIndicators.map((indicator) => (
              <div
                key={indicator.id}
                className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-start gap-2"
              >
                <div
                  className={cn(
                    'w-2 h-2 rounded-full mt-1 flex-shrink-0',
                    indicator.score >= 70
                      ? 'bg-rose-500'
                      : indicator.score >= 40
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white">{indicator.type.replace('_', ' ')}</span>
                    <TrendIcon trend={indicator.trend} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{indicator.description}</p>
                </div>
                <span className="text-xs font-mono text-slate-300">{indicator.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related projects */}
      {relatedProjects && relatedProjects.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            Related Projects ({relatedProjects.length})
          </div>
          <div className="space-y-1.5">
            {relatedProjects.slice(0, 5).map((project) => (
              <button
                key={project.id}
                onClick={() => onNavigateToNode(project.id)}
                className="w-full p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white">{project.name}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[9px] font-medium',
                      project.riskLevel === 'CRITICAL'
                        ? 'bg-rose-500/30 text-rose-300'
                        : project.riskLevel === 'HIGH'
                        ? 'bg-orange-500/30 text-orange-300'
                        : 'bg-slate-500/30 text-slate-300'
                    )}
                  >
                    {project.riskLevel}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </div>
              </button>
            ))}
            {relatedProjects.length > 5 && (
              <div className="text-[10px] text-slate-500 text-center py-1">
                +{relatedProjects.length - 5} more projects
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upcoming promotions */}
      {upcomingPromotions && upcomingPromotions.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Upcoming Promotions
          </div>
          <div className="space-y-1.5">
            {upcomingPromotions.map((promo) => (
              <div
                key={promo.projectId}
                className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center gap-2"
              >
                <ArrowRight className="h-3.5 w-3.5 text-violet-400" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-white">{promo.projectName}</span>
                  <span className="text-[10px] text-slate-400 ml-2">
                    {formatDate(promo.scheduledDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COLLISION DETAILS SECTION
// ============================================

function CollisionDetailsSection({
  collision,
  projects,
  onNavigateToNode,
}: {
  collision: Collision;
  projects: Project[];
  onNavigateToNode: (nodeId: string) => void;
}) {
  const affectedProjectData = projects.filter((p) => collision.affectedProjects.includes(p.id));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40">
          <AlertTriangle className="h-5 w-5 text-rose-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white">Collision Detected</h3>
          <p className="text-xs text-rose-300">{collision.type.replace('_', ' ')}</p>
        </div>
      </div>

      {/* Severity and probability */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'px-2 py-0.5 rounded text-xs font-medium',
            collision.severity === 'CRITICAL'
              ? 'bg-rose-500/30 text-rose-300'
              : collision.severity === 'HIGH'
              ? 'bg-orange-500/30 text-orange-300'
              : 'bg-amber-500/30 text-amber-300'
          )}
        >
          {collision.severity}
        </span>
        <span className="text-xs text-slate-400">
          {Math.round(collision.probability * 100)}% probability
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300">{collision.description}</p>

      {/* Timeline */}
      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Calendar className="h-3.5 w-3.5" />
          Overlap Window
        </div>
        <div className="text-sm text-white">
          {formatDate(collision.overlapStart)} - {formatDate(collision.overlapEnd)}
        </div>
      </div>

      {/* Affected projects */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-slate-400">
          Affected Projects ({affectedProjectData.length})
        </div>
        <div className="space-y-1.5">
          {affectedProjectData.map((project) => (
            <button
              key={project.id}
              onClick={() => onNavigateToNode(project.id)}
              className="w-full p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-white">{project.name}</span>
                <span className="text-[10px] text-rose-300">{project.owner}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested action */}
      <SuggestionCard
        action={collision.suggestedAction}
        priority={collision.severity === 'CRITICAL' ? 'HIGH' : collision.severity === 'HIGH' ? 'MEDIUM' : 'LOW'}
        reasoning="Based on collision analysis and risk scoring"
      />
    </div>
  );
}

// ============================================
// PORTFOLIO SUMMARY SECTION
// ============================================

function PortfolioSummarySection({
  summary,
  onNavigateToNode,
}: {
  summary: PortfolioRiskSummary;
  onNavigateToNode: (nodeId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-violet-500/20 border border-violet-500/40">
          <Brain className="h-5 w-5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white">Portfolio Intelligence</h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Trend:</span>
            <TrendIcon trend={summary.riskTrend} />
            <span className={cn(
              summary.riskTrend === 'INCREASING' ? 'text-rose-400' : summary.riskTrend === 'DECREASING' ? 'text-emerald-400' : 'text-slate-400'
            )}>
              {summary.riskTrend}
            </span>
          </div>
        </div>
      </div>

      {/* Overall risk score */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-transparent border border-violet-500/30">
        <div className="text-center">
          <div className="text-4xl font-bold text-white">{summary.overallScore}</div>
          <div className="text-xs text-violet-300 mt-1">Portfolio Risk Score</div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-center">
          <div className="text-2xl font-bold text-rose-300">{summary.criticalCollisions}</div>
          <div className="text-[10px] text-slate-400">Critical Collisions</div>
        </div>
        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
          <div className="text-2xl font-bold text-orange-300">{summary.highRiskProjects}</div>
          <div className="text-[10px] text-slate-400">High Risk Projects</div>
        </div>
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center">
          <div className="text-2xl font-bold text-cyan-300">{summary.emergentConvergences}</div>
          <div className="text-[10px] text-slate-400">Emergent Links</div>
        </div>
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
          <div className="text-2xl font-bold text-amber-300">{summary.capacityStressedEnvironments}</div>
          <div className="text-[10px] text-slate-400">Stressed Envs</div>
        </div>
      </div>

      {/* Top risks */}
      {summary.topRisks.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" />
            Top Risks
          </div>
          <div className="space-y-2">
            {summary.topRisks.map((risk) => (
              <button
                key={risk.id}
                onClick={() => onNavigateToNode(risk.nodeId)}
                className="w-full p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white">{risk.type.replace('_', ' ')}</span>
                  <div className="flex items-center gap-1.5">
                    <TrendIcon trend={risk.trend} />
                    <span className="text-xs font-mono text-slate-300">{risk.score}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">{risk.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

function FlowMapIntelligencePanel({
  isOpen,
  onToggle,
  context,
  portfolioSummary,
  projects,
  onClearSelection,
  onNavigateToNode,
}: FlowMapIntelligenceProps) {
  const hasSelection = context && context.entityId;

  return (
    <>
      {/* Toggle button when collapsed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className={cn(
            'fixed right-0 top-1/2 -translate-y-1/2 z-50',
            'px-1 py-4 rounded-l-lg',
            'glass-panel-interactive',
            'text-slate-400 hover:text-white',
            'transition-all'
          )}
          data-testid="flowmap-intelligence-toggle"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Intelligence panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full z-40',
          'bg-slate-900/95 backdrop-blur-xl border-l border-white/5',
          'transition-all duration-300 ease-out overflow-hidden',
          isOpen ? 'w-80' : 'w-0'
        )}
        data-testid="flowmap-intelligence-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Intelligence</h2>
          </div>
          <div className="flex items-center gap-1">
            {hasSelection && (
              <button
                onClick={onClearSelection}
                className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onToggle}
              className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Collapse"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-56px)] overflow-y-auto premium-scrollbar p-4">
          {context?.type === 'NODE' && context.nodeData ? (
            <NodeDetailsSection
              node={context.nodeData}
              relatedProjects={context.relatedProjects}
              riskIndicators={context.riskIndicators}
              upcomingPromotions={context.upcomingPromotions}
              capacityStress={context.capacityStress}
              onNavigateToNode={onNavigateToNode}
            />
          ) : context?.type === 'COLLISION' && context.collisionData ? (
            <CollisionDetailsSection
              collision={context.collisionData}
              projects={projects}
              onNavigateToNode={onNavigateToNode}
            />
          ) : (
            <PortfolioSummarySection
              summary={portfolioSummary}
              onNavigateToNode={onNavigateToNode}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default memo(FlowMapIntelligencePanel);
