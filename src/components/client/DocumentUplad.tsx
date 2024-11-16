import { useState } from 'react';
import { storage } from '../../lib/supabase';

export function DocumentUpload({ workflowId }: { workflowId: string }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = `workflows/${workflowId}/${Date.now()}-${file.name}`;
      await storage.uploadDocument(file, path);
      const publicUrl = storage.getDocumentUrl(path);
      // Update UI or notify parent component
    } catch (error) {
      console.error('Error uploading file:', error);
      // Handle error
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
        accept=".pdf,.png,.jpg,.jpeg"
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}