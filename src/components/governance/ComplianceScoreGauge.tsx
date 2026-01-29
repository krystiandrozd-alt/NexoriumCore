'use client';

// Nexorium Core - Compliance Score Gauge Component
// Circular progress indicator for compliance scores

interface ComplianceScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizes = {
  sm: { width: 64, strokeWidth: 6, fontSize: 'text-sm' },
  md: { width: 96, strokeWidth: 8, fontSize: 'text-xl' },
  lg: { width: 128, strokeWidth: 10, fontSize: 'text-3xl' },
};

export function ComplianceScoreGauge({
  score,
  size = 'md',
  showLabel = true,
  label,
  className = '',
}: ComplianceScoreGaugeProps) {
  const { width, strokeWidth, fontSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return { stroke: '#10b981', text: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { stroke: '#f59e0b', text: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { stroke: '#ef4444', text: 'text-red-600', bg: 'bg-red-100' };
  };

  const colors = getColor();

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width, height: width }}>
        <svg className="transform -rotate-90" width={width} height={width}>
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Score text */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${fontSize} font-bold ${colors.text}`}
        >
          {score}%
        </div>
      </div>
      {showLabel && label && (
        <div className="mt-2 text-sm text-slate-500 text-center">{label}</div>
      )}
    </div>
  );
}

export default ComplianceScoreGauge;
