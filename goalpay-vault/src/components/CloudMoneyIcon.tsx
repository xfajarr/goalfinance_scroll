
import { DollarSign } from 'lucide-react';

interface CloudMoneyIconProps {
  className?: string;
  size?: number;
}

export const CloudMoneyIcon = ({ className = '', size = 80 }: CloudMoneyIconProps) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size * 0.7 }}>
      {/* Cloud shape */}
      <svg
        width={size}
        height={size * 0.7}
        viewBox="0 0 80 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-goal-primary"
      >
        <path
          d="M64 24C64 15.2 56.8 8 48 8C44.8 8 41.6 9.6 39.2 12C36 4.8 28.8 0 20 0C11.2 0 4 7.2 4 16C4 17.6 4.4 19.2 4.8 20.8C2 23.2 0 26.8 0 31C0 38.4 6 44 13.6 44H64C70.4 44 76 38.4 76 32C76 27.2 71.6 24 64 24Z"
          fill="currentColor"
          opacity="0.8"
        />
      </svg>
      
      {/* Money symbols */}
      <div className="absolute inset-0 flex items-center justify-center">
        <DollarSign className="w-6 h-6 text-goal-text/80" />
      </div>
      
      {/* Floating money symbols */}
      <div className="absolute -top-2 left-1/4">
        <div className="w-3 h-3 bg-goal-primary/60 rounded-full flex items-center justify-center">
          <span className="text-xs text-goal-text">$</span>
        </div>
      </div>
      
      <div className="absolute -top-1 right-1/4">
        <div className="w-2 h-2 bg-goal-primary/40 rounded-full flex items-center justify-center">
          <span className="text-xs text-goal-text">¢</span>
        </div>
      </div>
      
      <div className="absolute top-1 -right-2">
        <div className="w-3 h-3 bg-goal-primary/50 rounded-full flex items-center justify-center">
          <span className="text-xs text-goal-text">€</span>
        </div>
      </div>
    </div>
  );
};
