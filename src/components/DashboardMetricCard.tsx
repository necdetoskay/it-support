import { FC, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  className?: string;
  loading?: boolean;
}

const DashboardMetricCard: FC<DashboardMetricCardProps> = ({
  title,
  value,
  icon,
  description,
  change,
  className,
  loading = false
}) => {
  const getChangeColor = () => {
    if (!change) return '';
    return change.type === 'increase' ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = () => {
    if (!change) return null;
    return change.type === 'increase' ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  return (
    <Card className={cn("bg-white border border-gray-100 shadow-sm p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1 mb-1">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              value
            )}
          </h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
          {change && (
            <div className={cn("flex items-center gap-1 text-xs mt-2", getChangeColor())}>
              {getChangeIcon()}
              <span>{Math.abs(change.value)}%</span>
              <span>{change.type === 'increase' ? 'artış' : 'azalış'}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full bg-gray-100 text-primary-500">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default DashboardMetricCard; 