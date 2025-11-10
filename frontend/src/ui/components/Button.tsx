import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-soft active:scale-[0.98] flex items-center justify-center gap-2 button-hover-animation relative';
  
  const variantClasses = {
    primary: 'gradient-primary text-white hover:shadow-glow hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 hover:brightness-110',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 hover:shadow-medium hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0',
    danger: 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 hover:brightness-110',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}

