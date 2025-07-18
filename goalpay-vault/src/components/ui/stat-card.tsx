
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  iconBgColor?: string;
}

export const StatCard = ({ icon: Icon, value, label, iconBgColor = "bg-goal-primary" }: StatCardProps) => {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-element rounded-2xl text-center hover:shadow-md transition-all duration-200">
      <div className="space-tight">
        <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center mx-auto`}>
          <Icon className="w-6 h-6 text-goal-text-secondary" />
        </div>
        <div className="space-xs">
          <p className="font-fredoka font-bold text-xl md:text-2xl text-goal-text-primary">{value}</p>
          <p className="font-inter text-sm text-goal-text">{label}</p>
        </div>
      </div>
    </Card>
  );
};
