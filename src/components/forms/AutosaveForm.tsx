import React, { useState, useCallback } from 'react';
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
  const { saveProgress } = useWorkflow();
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data from props
  const debouncedSave = useCallback(
    debounce(async (data: Record<string, any>) => {
      try {
        setSaving(true);
        setError(null);
        await saveProgress(sectionId, data);
        setLastSaved(new Date());
        onSave?.(data);
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
    const newValue = type === 'number' && value ? parseFloat(value) : value;

    const updatedData = {
      ...formData,
      [name]: newValue
    };
    
    setFormData(updatedData);
    debouncedSave(updatedData);
  };


  return (
    <div className="space-y-4">
      <form onSubmit={(e) => e.preventDefault()}>
        {React.Children.map(children, child => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child, {
            ...child.props,
            value: formData[child.props.name] || '',
            onChange: handleChange
          });
        })}
      </form>

      <div className="text-sm">
        {saving && <span className="text-gray-400">Saving...</span>}
        {error && <span className="text-red-500">{error}</span>}
        {lastSaved && !saving && (
          <span className="text-gray-400">Last saved: {lastSaved.toLocaleTimeString()}</span>
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