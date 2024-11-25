import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { useWorkflow } from '../../context/WorkflowContext';

interface FormInputProps {
  name: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

interface AutosaveFormProps {
  sectionId: string;
  initialData?: Record<string, any>;
  children: React.ReactNode;
  onSave?: (data: Record<string, any>) => void;
  onStatusChange?: (status: { saving: boolean; error: string | null }) => void;
}

export const AutosaveForm: React.FC<AutosaveFormProps> = ({
  sectionId,
  initialData = {},
  children,
  onSave
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const { saveProgress } = useWorkflow();
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data from props
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const debouncedSave = useCallback(
    debounce(async (data: Record<string, any>) => {
      if (!sectionId || Object.keys(data).length === 0) return;
      
      try {
        setSaving(true);
        setError(null);
        
        console.log('Saving data:', { sectionId, data });
        
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
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;

    let newValue: string | number = value;

    if (type === 'number') {

      newValue = value === '' ? '': parseFloat(value);
    
    // Check if it's a valid number
    if (typeof newValue === 'number' && isNaN(newValue)) {
      return; // Don't update if it's an invalid number
    }
  }
  
  console.log('Input change:', { name, value: newValue, type });

    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: newValue
      };
    
    // Trigger save
    debouncedSave(newData);
    
    return newData;
  });
};

  const renderChildren = () => {
    return React.Children.map(children, child => {
      if (!React.isValidElement(child)) {
        return child;
      }

      // Type guard to check if the child has the required props
      if ('name' in child.props) {
        return React.cloneElement(child as React.ReactElement<FormInputProps>, {
          ...child.props,
          value: formData[child.props.name] || '',
          onChange: handleInputChange
        });
      }

      return child;
    });
  };

  return (
    <div className="space-y-4">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {renderChildren()}
      </form>
      
      {/* Status indicators */}
      <div className="space-y-2">
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        {saving && (
          <div className="text-gray-400 text-sm">Saving...</div>
        )}
        {lastSaved && !saving && (
          <div className="text-gray-400 text-sm">
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};