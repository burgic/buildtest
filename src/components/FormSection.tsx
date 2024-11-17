import React from 'react';

interface FormSectionProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  className?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormSection: React.FC<FormSectionProps> = ({ 
  label, 
  name,
  type = 'text', 
  placeholder, 
  className = '',
  value,
  onChange 
}) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    onChange?.(e);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  );
};

export default FormSection;