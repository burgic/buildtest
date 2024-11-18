import { useEffect, useState } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { WorkflowSection } from '../../types/workflow.types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AutosaveWorkflowFormProps {
  workflowId: string;
  section: WorkflowSection;
  initialData?: any;
  onSave?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function AutosaveWorkflowForm({
  workflowId,
  section,
  initialData,
  onSave,
  onError
}: AutosaveWorkflowFormProps) {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { saveProgress } = useWorkflow();

  // Debounced save function
  useEffect(() => {
    const saveTimeout = setTimeout(async () => {
      if (!workflowId || !section.id) return;

      try {
        setSaving(true);
        await saveProgress(workflowId, section.id, formData);
        setLastSaved(new Date());
        onSave?.(formData);
      } catch (err) {
        console.error('Error saving form:', err);
        onError?.(err instanceof Error ? err : new Error('Failed to save form'));
      } finally {
        setSaving(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(saveTimeout);
  }, [formData, workflowId, section.id, saveProgress, onSave, onError]);

  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <input
            type={field.type}
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required={field.required}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            min={field.validation?.min}
            max={field.validation?.max}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required={field.required}
          />
        );
      case 'select':
        return (
          <select
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required={field.required}
          >
            <option value="">Select...</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Header with Save Status */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
        <div className="flex items-center space-x-2">
          {saving && <LoadingSpinner size="small" />}
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {section.fields.map((field) => (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>
    </div>
  );
}