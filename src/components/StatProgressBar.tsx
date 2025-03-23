import { FC } from 'react';
import { cn } from '@/lib/utils';

interface StatProgressBarProps {
  value: number;
  max: number;
  label: string;
  description?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  className?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const StatProgressBar: FC<StatProgressBarProps> = ({
  value,
  max,
  label,
  description,
  color = 'blue',
  className,
  showPercentage = true,
  size = 'md',
  loading = false
}) => {
  // İlerlemeyi hesapla
  const progress = Math.min(Math.max(0, value / max), 1);
  const percentage = Math.round(progress * 100);
  
  // Renk sınıfları
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };
  
  // Boyut sınıfları
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  
  if (loading) {
    return (
      <div className={cn("space-y-1.5", className)}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-700">{label}</p>
            {description && (
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-1"></div>
            )}
          </div>
          <div className="h-4 w-14 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full overflow-hidden">
          <div className={cn("h-2 w-2/3 bg-gray-300 rounded-full animate-pulse")}></div>
        </div>
        {showPercentage && (
          <div className="h-3 w-8 bg-gray-200 rounded animate-pulse ml-auto"></div>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        {showPercentage && (
          <p className="text-sm font-medium text-gray-700">{`${value} / ${max}`}</p>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "transition-all duration-500 ease-in-out rounded-full",
            colorClasses[color],
            sizeClasses[size]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-right text-gray-500">
          {percentage}%
        </p>
      )}
    </div>
  );
};

export default StatProgressBar; 