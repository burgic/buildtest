// src/components/common/forms/FormSection.tsx
import { ChangeEvent } from 'react';

export interface FormSectionProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'select' | 'date' | 'file' | 'custom';
  placeholder?: string;
  value?: string | number;
  required?: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error?: string | null;
}

const FormSection: React.FC<FormSectionProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  required = false,
  options,
  validation,
  onChange,
  error
}) => {
    const baseClasses = `
      w-full bg-[#2D2D2F] border border-gray-700 rounded-lg px-3 py-2
      text-white placeholder-gray-500 focus:outline-none focus:ring-2 
      focus:ring-blue-500 focus:border-transparent transition-all
    `;
    const renderInput = () => {
    if (type === 'select' && options) {
      return (
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          required={required}
          className={baseClasses}
        >
          <option value="">Select...</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        id={name}
        name={name}
        value={value?.toString() || ''}
        onChange={onChange}
        placeholder={placeholder}
        className={baseClasses}
        required={required}
        min={validation?.min}
        max={validation?.max}
        pattern={validation?.pattern}
      />
    );
  };

  return (
    <div className="space-y-2">
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-300"
      >
        {label}
        {required && <span className="text-blue-400 ml-1">*</span>}
      </label>
      {renderInput()}
      {validation?.message && (
        <p className="text-sm text-gray-500">{validation.message}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FormSection;