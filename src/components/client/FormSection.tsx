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
  const baseInputStyles = `
    w-full bg-[#111111] border border-gray-800 rounded-lg px-3 py-2 text-white
    placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    transition-all text-sm
  `;

  const renderInput = () => {
    if (type === 'select' && options) {
      return (
        <select
          id={name}
          name={name}
          value={value?.toString() || ''}
          onChange={onChange}
          className={`${baseInputStyles} appearance-none bg-[#111111] cursor-pointer`}
          required={required}
        >
          <option value="" disabled>Select...</option>
          {options.map(option => (
            <option key={option} value={option} className="bg-[#1D1D1F]">
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
        value={value?.toString() || ''}
        onChange={onChange}
        placeholder={placeholder}
        className={baseInputStyles}
        required={required}
        min={validation?.min}
        max={validation?.max}
        pattern={validation?.pattern}
      />
    );
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-blue-400 ml-1">*</span>}
      </label>
      {renderInput()}
      {validation?.message && (
        <p className="mt-1 text-sm text-gray-500">{validation.message}</p>
      )}
    </div>
  );
};

export default FormSection;