import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2.5 tracking-wide">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-3 border rounded-xl shadow-soft
          bg-white/90 backdrop-blur-sm transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
          focus:shadow-medium focus:shadow-primary-500/20
          hover:border-slate-400 hover:shadow-medium cursor-pointer
          text-slate-700
          ${error ? 'border-red-400 focus:ring-red-500/50 focus:border-red-500 bg-red-50/50' : 'border-slate-300'}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-red-600 font-medium animate-slide-down">{error}</p>}
    </div>
  );
}

