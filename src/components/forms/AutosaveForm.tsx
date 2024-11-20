// src/components/forms/AutosaveForm.tsx
import React, { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { useWorkflow } from '../../context/WorkflowContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AutosaveFormProps {
  sectionId: string;
  initialData?: Record<string, any>;
  children: React.ReactNode;
  onSave?: (data: Record<string, any>) => void;
}

export const AutosaveForm: React.FC<AutosaveFormProps> = ({
  sectionId,
  initialData = {},
  children,
  onSave
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { saveProgress } = useWorkflow();

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const debouncedSave = useCallback(
    debounce(async (data: Record<string, any>) => {
      try {
        setSaving(true);
        setError(null);
        await saveProgress(sectionId, data);
        setLastSaved(new Date());
        onSave?.(data);
      } catch (err) {
        console.error('Error in debouncedSave:', err);
        setError(err instanceof Error ? err.message : 'Failed to save progress');
      } finally {
        setSaving(false);
      }
    }, 1500),
    [sectionId, saveProgress, onSave]
  );

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: newValue };
      debouncedSave(newData);
      return newData;
    });
  };

  console.log('Form data:', formData);


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        {saving && (
          <div className="flex items-center space-x-2 text-gray-500">
            <LoadingSpinner size="small" />
            <span>Saving...</span>
          </div>
        )}
        {lastSaved && !saving && (
          <div className="text-gray-500">
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              ...child.props,
              value: formData[child.props.name] || '',
              onChange: handleInputChange
            });
          }
          return child;
        })}
      </form>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};