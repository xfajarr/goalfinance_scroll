import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { ComponentBaseProps } from '@/types/common';

// Container component with responsive max-width
export interface ContainerProps extends ComponentBaseProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centerContent?: boolean;
}

export const Container = memo<ContainerProps>(({ 
  className,
  size = 'lg',
  centerContent = false,
  children
}) => {
  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md', 
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full',
  };

  return (
    <div 
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        { 'flex items-center justify-center': centerContent },
        className
      )}
    >
      {children}
    </div>
  );
});

Container.displayName = 'Container';

// Page wrapper component
export interface PageProps extends ComponentBaseProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  fullHeight?: boolean;
}

export const Page = memo<PageProps>(({ 
  className,
  title,
  description,
  actions,
  breadcrumbs,
  fullHeight = false,
  children
}) => {
  return (
    <div className={cn('w-full', { 'min-h-screen': fullHeight }, className)}>
      {/* Header section */}
      {(title || description || actions || breadcrumbs) && (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Container>
            <div className="py-6">
              {breadcrumbs && (
                <div className="mb-4">
                  {breadcrumbs}
                </div>
              )}
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  {title && (
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                
                {actions && (
                  <div className="flex flex-row items-center gap-2">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          </Container>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
});

Page.displayName = 'Page';

// Section component for content organization
export interface SectionProps extends ComponentBaseProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
}

export const Section = memo<SectionProps>(({ 
  className,
  title,
  description,
  actions,
  spacing = 'md',
  children
}) => {
  const spacingClasses = {
    sm: 'py-4',
    md: 'py-6',
    lg: 'py-8',
  };

  return (
    <section className={cn('w-full', spacingClasses[spacing], className)}>
      <Container>
        {/* Section header */}
        {(title || description || actions) && (
          <div className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                {title && (
                  <h2 className="text-lg font-semibold tracking-tight md:text-xl">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              
              {actions && (
                <div className="flex flex-row items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Section content */}
        {children}
      </Container>
    </section>
  );
});

Section.displayName = 'Section';

// Grid component for responsive layouts
export interface GridProps extends ComponentBaseProps {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
}

export const Grid = memo<GridProps>(({ 
  className,
  cols = 1,
  gap = 'md',
  responsive = true,
  children
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: responsive ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2',
    3: responsive ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
    4: responsive ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-4',
    6: responsive ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-6',
    12: responsive ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12' : 'grid-cols-12',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={cn('grid', colsClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
});

Grid.displayName = 'Grid';

// Card component with consistent styling
export interface CardWrapperProps extends ComponentBaseProps {
  variant?: 'default' | 'outline' | 'ghost';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const CardWrapper = memo<CardWrapperProps>(({ 
  className,
  variant = 'default',
  padding = 'md',
  hover = false,
  children
}) => {
  const variantClasses = {
    default: 'bg-card text-card-foreground border shadow-sm',
    outline: 'border border-border bg-transparent',
    ghost: 'bg-transparent',
  };

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div 
      className={cn(
        'rounded-lg',
        variantClasses[variant],
        paddingClasses[padding],
        { 'transition-colors hover:bg-muted/50': hover },
        className
      )}
    >
      {children}
    </div>
  );
});

CardWrapper.displayName = 'CardWrapper';

// Responsive stack component
export interface StackProps extends ComponentBaseProps {
  direction?: 'vertical' | 'horizontal';
  spacing?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
}

export const Stack = memo<StackProps>(({ 
  className,
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  children
}) => {
  const directionClasses = {
    vertical: 'flex-col',
    horizontal: 'flex-row',
  };

  const spacingClasses = {
    vertical: {
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6',
    },
    horizontal: {
      sm: 'space-x-2',
      md: 'space-x-4',
      lg: 'space-x-6',
    },
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  return (
    <div 
      className={cn(
        'flex',
        directionClasses[direction],
        spacingClasses[direction][spacing],
        alignClasses[align],
        justifyClasses[justify],
        { 'flex-wrap': wrap },
        className
      )}
    >
      {children}
    </div>
  );
});

Stack.displayName = 'Stack';
