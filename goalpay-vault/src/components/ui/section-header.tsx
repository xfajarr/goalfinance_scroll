
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const SectionHeader = ({ title, subtitle, className = "" }: SectionHeaderProps) => {
  return (
    <div className={`text-center space-element ${className}`}>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-fredoka font-bold text-goal-text-primary leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="font-inter text-base md:text-lg text-goal-text-secondary max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
