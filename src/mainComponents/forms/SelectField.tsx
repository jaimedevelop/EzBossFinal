// src/mainComponents/forms/SelectField.tsx
import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  icon?: React.ReactNode;
  error?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  options,
  icon,
  error,
  className = '',
  ...props
}) => {
  const baseClasses = `block w-full py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 ${
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
  }`;
  
  const paddingClasses = icon ? 'pl-10 pr-3' : 'px-3';

  if (icon) {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <select
          className={`${baseClasses} ${paddingClasses} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <select
      className={`${baseClasses} ${paddingClasses} ${className}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
