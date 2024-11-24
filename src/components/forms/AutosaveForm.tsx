import React, { useState, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import { useWorkflow } from '../../context/WorkflowContext';

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
  // const memorizedInitialData = useMemo(() => initialData, [initialData]); // Memoize data
  const formRef = useRef<Record<string, any>>({ ...initialData }); // Ref for form data
  const { saveProgress } = useWorkflow();
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  

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
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const newValue = type === 'number' ? (value ? parseFloat(value) : '') : value;
    
    // Update ref data
    formRef.current[name] = newValue;

    debouncedSave({...formRef.current});
  };

  // Make sure to pass the correct props to children
  const formChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...child.props,
        value: formRef.current[child.props.name] || '',
        onChange: handleInputChange
      });
    }
    return child;
  });

  return (
    <div className="space-y-4">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {formChildren}
      </form>
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
  );
};