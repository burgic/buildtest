import React, { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { useWorkflow } from '../../context/WorkflowContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

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
  onSave,
  onStatusChange,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { saveProgress } = useWorkflow();

  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateData = (data: Record<string, any>): boolean => {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.trim() === '') {
        setError(`Field "${key}" cannot be empty.`);
        return false;
      }
    }
    return true;
  };

  const debouncedSave = useCallback(
    debounce(async (data: Record<string, any>) => {
      if (!validateData(data)) return;

      try {
        setSaving(true);
        setError(null);
        onStatusChange?.({ saving: true, error: null });
        await saveProgress(sectionId, data);
        setLastSaved(new Date());
        onSave?.(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save progress';
        console.error('Error in debouncedSave:', err);
        setError(errorMessage);
        onStatusChange?.({ saving: false, error: errorMessage });
      } finally {
        setSaving(false);
        onStatusChange?.({ saving: false, error: null });
      }
    }, 1500),
    [sectionId, saveProgress, onSave, onStatusChange]
  );

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;

    setFormData((prev) => {
      const newData = { ...prev, [name]: newValue };
      debouncedSave(newData);
      return newData;
    });
  };

  const retrySave = async () => {
    try {
      setSaving(true);
      setError(null);
      await saveProgress(sectionId, formData);
      setLastSaved(new Date());
      onSave?.(formData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save progress';
      console.error('Error in retrySave:', err);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

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
          <div className="text-gray-500">Last saved: {lastSaved.toLocaleTimeString()}</div>
        )}
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, {
                ...child.props,
                value: formData[child.props.name] || '',
                onChange: handleInputChange,
              })
            : child
        )}
      </form>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          <span>{error}</span>
          <button onClick={retrySave} className="ml-2 text-blue-600 hover:underline">
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
