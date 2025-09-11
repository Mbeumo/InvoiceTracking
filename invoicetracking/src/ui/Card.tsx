import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const classes = `
    bg-white rounded-lg
    ${border ? 'border border-gray-200' : ''}
    ${shadowClasses[shadow]}
    ${paddingClasses[padding]}
    ${hover ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
    ${className}
  `;

  return (
    <div className={classes}>
      {children}
    </div>
  );
};
