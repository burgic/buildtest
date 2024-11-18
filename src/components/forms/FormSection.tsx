import React from 'react';

interface FormSectionProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'select' | 'date';
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
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
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
  onChange
}) => {
  const renderInput = () => {
    const baseClassName = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm";

    if (type === 'select' && options) {
      return (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={baseClassName}
          required={required}
        >
          <option value="">Select...</option>
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={baseClassName}
        required={required}
        min={validation?.min}
        max={validation?.max}
        pattern={validation?.pattern}
      />
    );
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {validation?.message && (
        <p className="mt-1 text-sm text-gray-500">{validation.message}</p>
      )}
    </div>
  );
};

export default FormSection;