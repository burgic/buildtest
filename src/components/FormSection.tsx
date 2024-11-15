import React from 'react';

interface FormSectionProps {
  label: string;
  type?: string;
  placeholder?: string;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ label, type = 'text', placeholder, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    />
  </div>
);

export default FormSection;