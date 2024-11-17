import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { useWorkflow } from '../../context/WorkflowContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const AutosaveForm: React.FC<AutosaveFormProps> = ({
  sectionId,
  initialData = {},
  children,
  onSave
}) => {
  const [formData, setFormData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { saveProgress } = useWorkflow();

  // Create debounced save function
  const debouncedSave = useCallback(
    debounce(async (data: any) => {
      console.log('Attempting to save form data:', {
        sectionId,
        data
      });

      try {
        setSaving(true);
        setError(null);
        await saveProgress(sectionId, data);
        console.log('Successfully saved form data');
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
    
    console.log('Input changed:', {
      name,
      value: newValue,
      type
    });

    const newFormData = {
      ...formData,
      [name]: newValue
    };
    
    setFormData(newFormData);
    debouncedSave(newFormData);
  };

  // Log initial mount and cleanup
  useEffect(() => {
    console.log('AutosaveForm mounted with initial data:', initialData);
    return () => {
      console.log('AutosaveForm unmounting');
      debouncedSave.cancel();
    };
  }, [debouncedSave, initialData]);

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
        {error && (
          <div className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm">
            {error}
          </div>
        )}
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement, {
              ...formContext,
              value: formData[child.props.name],
              onChange: handleInputChange
            });
          }
          return child;
        })}
      </form>
    </div>
  );
};