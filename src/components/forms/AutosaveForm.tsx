import React, { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { useWorkflow } from '../../context/WorkflowContext';

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
  const [isInitialized, setIsInitialized] = useState(false);
  const { saveProgress } = useWorkflow();
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when the component mounts
  useEffect(() => {
    if (!isInitialized && Object.keys(initialData).length > 0) {
      console.log('Initializing form data:', initialData);
      setFormData(initialData);
      setIsInitialized(true);
    }
  }, [initialData, isInitialized]);

  const debouncedSave = useCallback(
    debounce(async (newData: Record<string, any>) => {
      console.log('Debounced save triggered with data:', newData);
      try {
        setSaving(true);
        setError(null);
        await saveProgress(sectionId, newData);
        setLastSaved(new Date());
        onSave?.(newData);
      } catch (err) {
        console.error('Error saving:', err);
        setError(err instanceof Error ? err.message : 'Save failed');
      } finally {
        setSaving(false);
      }
    }, 1000),
    [sectionId, saveProgress, onSave]
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    let newValue: string | number = value;

    // Handle different input types
    if (type === 'number') {
      newValue = value ? parseFloat(value) : 0;
    }
    
    const updatedData = {
      ...formData,
      [name]: newValue
    };
    
    console.log('Form field updated:', { name, value: newValue, allData: updatedData });
    setFormData(updatedData);
    debouncedSave(updatedData);
  };

  // Cleanup debounced save on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return (
    <div className="space-y-4">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {React.Children.map(children, child => {
          if (!React.isValidElement(child)) return child;
          
          // Clone and enhance child elements with form handling
          return React.cloneElement(child, {
            ...child.props,
            value: formData[child.props.name] ?? '',
            onChange: handleChange,
          });
        })}
      </form>

      {/* Form Status */}
      <div className="flex items-center justify-end space-x-4 text-sm">
        {saving && (
          <span className="text-gray-400 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-2" />
            Saving...
          </span>
        )}
        {error && <span className="text-red-500">{error}</span>}
        {lastSaved && !saving && (
          <span className="text-gray-400">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};
  /*

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;

    let newValue: string | number = value;

    // Handle number inputs
    if (type === 'number') {
      if (value === '') {
        newValue = '';
      } else {
        const parsed = parseFloat(value);
        if (isNaN(parsed)) return;
        newValue = parsed;
      }
    }
  
    console.log('Field change:', { name, value: newValue, type });

      setFields(prev => {
        const newFields = {
          ...prev,
          [name]: newValue
        };
        debouncedSave(newFields);
        return newFields;
      });
    };


  const renderFormFields = () => {
    return React.Children.map(children, child => {
      if (!React.isValidElement(child)) return child;

      if ('name' in child.props) {
        const fieldName = child.props.name;
        const currentValue = fields[fieldName];
        console.log('Rendering field:', { name: fieldName, value: currentValue });

        return React.cloneElement(child as React.ReactElement<FormInputProps>, {
          ...child.props,
          value: currentValue !== undefined ? currentValue : '',
          onChange: handleInputChange
        });
      }

      return child;
    });
  };

  useEffect(() => {
    console.log('Current fields state:', fields);
  }, [fields]);

  return (
    <div className="space-y-4">
      <form 
        className="space-y-6" 
        onSubmit={(e) => e.preventDefault()}
        onChange={(e) => console.log('Form change:', e)}
      >
        {renderFormFields()}
      </form>

      
      <div className="text-xs text-gray-500">
        <pre>{JSON.stringify(fields, null, 2)}</pre>
      </div>
      
    
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

*/