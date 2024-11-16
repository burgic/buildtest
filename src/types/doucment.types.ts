export interface Document {
    id: string;
    workflowLinkId: string;
    filePath: string;
    originalFilename: string;
    documentType: DocumentType;
    status: DocumentStatus;
    extractedData: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export type DocumentType = 'bank_statement' | 'payslip' | 'utility_bill' | 'other';
  
  export type DocumentStatus = 'uploading' | 'processing' | 'completed' | 'error';
  